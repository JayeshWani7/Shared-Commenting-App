import { 
  Injectable, 
  NotFoundException, 
  ForbiddenException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { User } from '../users/entities/user.entity';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../notifications/entities/notification.entity';
import { NotificationsGateway } from '../websocket/notifications.gateway';

@Injectable()
export class CommentsService {
  private readonly EDIT_GRACE_PERIOD = 15 * 60 * 1000; // 15 minutes in milliseconds
  private readonly DELETE_GRACE_PERIOD = 15 * 60 * 1000; // 15 minutes in milliseconds

  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private notificationsService: NotificationsService,
    private notificationsGateway: NotificationsGateway,
  ) {}

  async create(createCommentDto: CreateCommentDto, userId: string): Promise<Comment> {
    const { content, parentId } = createCommentDto;

    // Validate parent comment exists and is not deleted
    if (parentId) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
        relations: ['author'],
      });

      if (!parentComment) {
        throw new NotFoundException('Parent comment not found');
      }

      if (parentComment.isDeleted) {
        throw new BadRequestException('Cannot reply to deleted comment');
      }

      // Create notification for parent comment author
      if (parentComment.authorId !== userId) {
        const replyingUser = await this.commentRepository.manager.findOne(User, {
          where: { id: userId },
        });
        
        const notification = await this.notificationsService.create({
          userId: parentComment.authorId,
          type: NotificationType.COMMENT_REPLY,
          title: 'New Reply',
          message: `${replyingUser?.username || 'Someone'} replied to your comment`,
          commentId: parentId,
          triggeredByUserId: userId,
        });

        // Send real-time notification via WebSocket
        this.notificationsGateway.sendNotificationToUser(
          parentComment.authorId,
          notification
        );
      }
    }

    const comment = this.commentRepository.create({
      content,
      authorId: userId,
      parentId,
    });

    const savedComment = await this.commentRepository.save(comment);

    // Clear cache
    await this.clearCommentsCache();

    return this.findById(savedComment.id);
  }

  async findAll(page: number = 1, limit: number = 20): Promise<{ comments: Comment[]; total: number }> {
    const cacheKey = `comments:page:${page}:limit:${limit}`;
    
    // Try cache
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached as { comments: Comment[]; total: number };
    }

    const skip = (page - 1) * limit;

    // 1. Fetch all comments (including replies) within page window
    const [flatComments, total] = await this.commentRepository.findAndCount({
      relations: ['author'],
      order: { createdAt: 'ASC' },
      skip,
      take: limit,
    });

    // 2. Create a comment map
    const commentMap = new Map<string, Comment>();
    flatComments.forEach(comment => {
      comment.children = [];
      commentMap.set(comment.id, comment);
    });

    // 3. Build nested structure
    const rootComments: Comment[] = [];

    for (const comment of commentMap.values()) {
      if (comment.parentId) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(comment);
        } else {
          // orphan reply (missing parent in same page window)
          rootComments.push(comment);
        }
      } else {
        rootComments.push(comment);
      }
    }

    // 4. Process root comments recursively
    const processedComments = await Promise.all(
      rootComments.map(comment => this.processComment(comment))
    );

    const result = { comments: processedComments, total };

    // 5. Cache the result
    await this.cacheManager.set(cacheKey, result, 300); // Cache for 5 minutes

    return result;
  }

  async findById(id: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
      relations: ['author', 'children', 'children.author'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    return this.processComment(comment);
  }

  async update(id: string, updateCommentDto: UpdateCommentDto, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own comments');
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Cannot edit deleted comment');
    }

    // Check if within edit grace period
    const now = new Date();
    const commentAge = now.getTime() - comment.createdAt.getTime();
    
    if (commentAge > this.EDIT_GRACE_PERIOD) {
      throw new ForbiddenException('Comment can only be edited within 15 minutes of posting');
    }

    await this.commentRepository.update(id, {
      content: updateCommentDto.content,
      isEdited: true,
      editedAt: now,
    });

    // Clear cache
    await this.clearCommentsCache();

    return this.findById(id);
  }

  async delete(id: string, userId: string): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own comments');
    }

    if (comment.isDeleted) {
      throw new BadRequestException('Comment is already deleted');
    }

    // Soft delete
    const now = new Date();
    await this.commentRepository.update(id, {
      isDeleted: true,
      deletedAt: now,
    });

    // Clear cache
    await this.clearCommentsCache();
  }

  async restore(id: string, userId: string): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.authorId !== userId) {
      throw new ForbiddenException('You can only restore your own comments');
    }

    if (!comment.isDeleted) {
      throw new BadRequestException('Comment is not deleted');
    }

    // Check if within restore grace period
    const now = new Date();
    const deleteAge = now.getTime() - comment.deletedAt.getTime();
    
    if (deleteAge > this.DELETE_GRACE_PERIOD) {
      throw new ForbiddenException('Comment can only be restored within 15 minutes of deletion');
    }

    await this.commentRepository.update(id, {
      isDeleted: false,
      deletedAt: null,
    });

    // Clear cache
    await this.clearCommentsCache();

    return this.findById(id);
  }

  private async processComment(comment: Comment, level: number = 0): Promise<Comment> {
    const now = new Date();
    const commentAge = now.getTime() - comment.createdAt.getTime();
    const deleteAge = comment.deletedAt ? now.getTime() - comment.deletedAt.getTime() : 0;

    // Add business logic fields
    comment.canEdit = !comment.isDeleted && commentAge <= this.EDIT_GRACE_PERIOD;
    comment.canDelete = !comment.isDeleted;
    comment.canRestore = comment.isDeleted && deleteAge <= this.DELETE_GRACE_PERIOD;
    comment.nestingLevel = level;

    // Process children recursively
    if (comment.children) {
      comment.children = await Promise.all(
        comment.children.map(child => this.processComment(child, level + 1))
      );
    }

    return comment;
  }

  private async clearCommentsCache(): Promise<void> {
    // Clear all comment-related cache entries
    // Simple in-memory cache clearing - in production, implement more sophisticated cache management
    try {
      await this.cacheManager.reset();
    } catch (error) {
      console.warn('Cache clear failed:', error);
    }
  }
}

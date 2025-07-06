import { useState } from 'react';
import { format } from 'date-fns';
import { MessageSquare, Edit2, Trash2, RotateCcw } from 'lucide-react';
import { useMutation, useQueryClient } from 'react-query';
import { commentsApi } from '@/services/api';
import { toast } from '@/utils/toast';
import CommentForm from './CommentForm';

interface Comment {
  id: string;
  content: string;
  author: {
    id: string;
    username: string;
  };
  createdAt: string;
  updatedAt: string;
  isEdited: boolean;
  isDeleted: boolean;
  canEdit: boolean;
  canDelete: boolean;
  canRestore: boolean;
  children?: Comment[];
  nestingLevel: number;
}

interface CommentItemProps {
  comment: Comment;
  onUpdate: () => void;
}

export default function CommentItem({ comment, onUpdate }: CommentItemProps) {
  const [showReply, setShowReply] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const queryClient = useQueryClient();

  // Determine if this is a nested comment
  const isNested = comment.nestingLevel && comment.nestingLevel > 0;

  const deleteCommentMutation = useMutation(
    (id: string) => commentsApi.deleteComment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments']);
        toast.success('Comment deleted successfully');
        onUpdate();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to delete comment';
        toast.error(message);
      },
    }
  );

  const restoreCommentMutation = useMutation(
    (id: string) => commentsApi.restoreComment(id),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments']);
        toast.success('Comment restored successfully');
        onUpdate();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to restore comment';
        toast.error(message);
      },
    }
  );

  const updateCommentMutation = useMutation(
    ({ id, content }: { id: string; content: string }) => 
      commentsApi.updateComment(id, { content }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments']);
        toast.success('Comment updated successfully');
        setShowEdit(false);
        onUpdate();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to update comment';
        toast.error(message);
      },
    }
  );

  const handleReply = () => {
    setShowReply(!showReply);
  };

  const handleEdit = () => {
    setShowEdit(!showEdit);
    if (!showEdit) {
      setEditContent(comment.content); // Reset content when opening edit
    }
  };

  const handleEditSave = () => {
    if (editContent.trim() === '') {
      toast.error('Comment content cannot be empty');
      return;
    }
    updateCommentMutation.mutate({ id: comment.id, content: editContent.trim() });
  };

  const handleEditCancel = () => {
    setShowEdit(false);
    setEditContent(comment.content); // Reset to original content
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(comment.id);
    }
  };

  const handleRestore = () => {
    restoreCommentMutation.mutate(comment.id);
  };

  const handleReplySuccess = () => {
    setShowReply(false);
    // Clear all comment caches and force refetch to ensure nested structure is updated
    queryClient.removeQueries(['comments']);
    queryClient.invalidateQueries(['comments']);
    onUpdate();
  };

  const handleReplyCancel = () => {
    setShowReply(false);
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy at HH:mm');
  };

  const maxNestingLevel = 5;
  const nestingClass = `comment-depth-${Math.min(comment.nestingLevel || 0, maxNestingLevel)}`;

  return (
    <div className={`${nestingClass} space-y-3`} id={`comment-${comment.id}`}>
      <div className={`card p-4 transition-all duration-300 ${isNested ? 'bg-gray-50 border-l-4 border-blue-200' : ''}`}>
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-gray-900">
              {comment.author.username}
            </span>
            <span className="text-sm text-gray-500">
              {formatDate(comment.createdAt)}
            </span>
            {comment.isEdited && (
              <span className="text-xs text-gray-400 italic">
                (edited)
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          {comment.isDeleted ? (
            <p className="text-gray-500 italic">
              This comment has been deleted
            </p>
          ) : showEdit ? (
            <div className="space-y-3">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                rows={3}
                placeholder="Edit your comment..."
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleEditSave}
                  disabled={updateCommentMutation.isLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
                >
                  {updateCommentMutation.isLoading ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-gray-900 whitespace-pre-wrap">
              {comment.content}
            </p>
          )}
        </div>

        <div className="flex items-center space-x-4 text-sm">
          {!comment.isDeleted && (
            <button
              onClick={handleReply}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Reply</span>
            </button>
          )}

          {comment.canEdit && !showEdit && (
            <button
              onClick={handleEdit}
              className="flex items-center space-x-1 text-gray-500 hover:text-primary-600 transition-colors"
            >
              <Edit2 className="h-4 w-4" />
              <span>Edit</span>
            </button>
          )}

          {comment.canDelete && (
            <button
              onClick={handleDelete}
              disabled={deleteCommentMutation.isLoading}
              className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4" />
              <span>{deleteCommentMutation.isLoading ? 'Deleting...' : 'Delete'}</span>
            </button>
          )}

          {comment.canRestore && (
            <button
              onClick={handleRestore}
              disabled={restoreCommentMutation.isLoading}
              className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors disabled:opacity-50"
            >
              <RotateCcw className="h-4 w-4" />
              <span>{restoreCommentMutation.isLoading ? 'Restoring...' : 'Restore'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Reply form */}
      {showReply && (
        <div className="mt-4 ml-4 p-4 bg-blue-50 border-l-4 border-blue-300 rounded-r-lg">
          <div className="text-sm text-blue-700 mb-2 font-medium">
            Replying to {comment.author.username}
          </div>
          <CommentForm 
            parentId={comment.id}
            onSuccess={handleReplySuccess}
            onCancel={handleReplyCancel}
          />
        </div>
      )}

      {/* Nested comments */}
      {comment.children && comment.children.length > 0 && (
        <div className="ml-8 mt-4 space-y-4 border-l-2 border-gray-200 pl-4">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { useForm } from 'react-hook-form';
import { commentsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/utils/toast';

interface CommentFormData {
  content: string;
}

interface CommentFormProps {
  parentId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function CommentForm({ parentId, onSuccess, onCancel }: CommentFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CommentFormData>();

  const createCommentMutation = useMutation(
    (data: { content: string; parentId?: string }) => 
      commentsApi.createComment(data),
    {
      onSuccess: () => {
        // Force a complete refresh of the comments cache
        queryClient.invalidateQueries(['comments']);
        queryClient.refetchQueries(['comments']);
        toast.success(parentId ? 'Reply posted successfully!' : 'Comment posted successfully!');
        reset();
        onSuccess?.();
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Failed to post comment';
        toast.error(message);
      },
    }
  );

  const onSubmit = (data: CommentFormData) => {
    createCommentMutation.mutate({
      content: data.content,
      parentId,
    });
  };

  if (!user) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <textarea
          placeholder={parentId ? 'Write a reply...' : 'What are your thoughts?'}
          rows={parentId ? 3 : 4}
          className="textarea"
          {...register('content', {
            required: 'Comment content is required',
            minLength: {
              value: 1,
              message: 'Comment cannot be empty',
            },
            maxLength: {
              value: 1000,
              message: 'Comment cannot exceed 1000 characters',
            },
          })}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {parentId ? 'Replying as' : 'Commenting as'} <strong>{user.username}</strong>
        </span>
        
        <div className="flex space-x-3">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary btn-sm"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={createCommentMutation.isLoading}
            className="btn btn-primary btn-sm"
          >
            {createCommentMutation.isLoading 
              ? 'Posting...' 
              : parentId 
                ? 'Post Reply' 
                : 'Post Comment'
            }
          </button>
        </div>
      </div>
    </form>
  );
}

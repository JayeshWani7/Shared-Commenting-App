import { useState } from 'react';
import { useQuery } from 'react-query';
import { commentsApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import CommentItem from './CommentItem';
import { ChevronLeft, ChevronRight } from 'lucide-react';

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

interface CommentsResponse {
  comments: Comment[];
  total: number;
}

export default function CommentList() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);

  const { data, isLoading, error, refetch } = useQuery<CommentsResponse>(
    ['comments', currentPage, limit],
    () => commentsApi.getComments(currentPage, limit).then(res => res.data),
    {
      enabled: !!user,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  const totalPages = Math.ceil((data?.total || 0) / limit);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gray-200 h-20 rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Failed to load comments</p>
        <button
          onClick={handleRefresh}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!data?.comments?.length) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No comments yet. Be the first to comment!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">
          {data.total} Comment{data.total !== 1 ? 's' : ''}
        </h3>
        <button
          onClick={handleRefresh}
          className="btn btn-secondary btn-sm"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {data.comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            onUpdate={refetch}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-between items-center pt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="btn btn-secondary btn-sm flex items-center space-x-2"
          >
            <ChevronLeft className="h-4 w-4" />
            <span>Previous</span>
          </button>

          <div className="flex space-x-2">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-md text-sm ${
                  currentPage === i + 1
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className="btn btn-secondary btn-sm flex items-center space-x-2"
          >
            <span>Next</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

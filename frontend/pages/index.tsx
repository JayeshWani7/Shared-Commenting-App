import { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import CommentList from '@/components/CommentList';
import CommentForm from '@/components/CommentForm';
import Header from '@/components/Header';

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const commentListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  // Handle comment navigation from notifications
  useEffect(() => {
    const { comment } = router.query;
    if (comment && commentListRef.current) {
      // Small delay to ensure the component is mounted
      setTimeout(() => {
        const commentElement = document.getElementById(`comment-${comment}`);
        if (commentElement) {
          commentElement.scrollIntoView({ behavior: 'smooth' });
          commentElement.classList.add('ring-2', 'ring-blue-500', 'ring-opacity-50');
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            commentElement.classList.remove('ring-2', 'ring-blue-500', 'ring-opacity-50');
          }, 3000);
        }
      }, 500);
    }
  }, [router.query]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to the Comment App
          </h1>
          <p className="text-gray-600">
            Share your thoughts and engage in meaningful conversations.
          </p>
        </div>

        <div className="space-y-8">
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Start a Conversation</h2>
            <CommentForm />
          </div>

          <div className="card p-6" ref={commentListRef}>
            <h2 className="text-xl font-semibold mb-4">Recent Comments</h2>
            <CommentList />
          </div>
        </div>
      </main>
    </div>
  );
}

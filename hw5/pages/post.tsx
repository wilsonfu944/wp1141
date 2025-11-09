import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import PostForm from '@/components/PostForm';

export default function PostPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading' || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto p-6">
          <h1 className="text-2xl font-bold mb-6">發佈文章</h1>
          <PostForm />
        </div>
      </div>
    </div>
  );
}


import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import GuestHeader from '@/components/GuestHeader';
import PostForm from '@/components/PostForm';
import PostCard from '@/components/PostCard';

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'following'>('all');
  const [loading, setLoading] = useState(true);

  // 移除強制登入檢查，允許訪客查看內容
  // useEffect(() => {
  //   if (status === 'unauthenticated') {
  //     router.push('/auth/signin');
  //   }
  // }, [status, router]);

  useEffect(() => {
    // 訪客和登入用戶都可以查看文章
    fetchPosts();
  }, [filter, session]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // 訪客只能看全部，登入用戶可以看關注的
      const followingParam = session && filter === 'following' ? 'true' : 'false';
      const res = await fetch(`/api/posts?following=${followingParam}`);
      
      if (!res.ok) {
        // 如果 API 返回錯誤，但可能返回了 posts 陣列
        const data = await res.json().catch(() => ({}));
        setPosts(data.posts || []);
        if (data.error) {
          console.error('API Error:', data.error, data.message);
        }
        return;
      }
      
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      // 即使出錯也設置為空陣列，避免卡住
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // 添加超時處理，避免永遠卡在 loading
  useEffect(() => {
    if (status === 'loading') {
      const timeout = setTimeout(() => {
        console.warn('Session loading timeout, proceeding anyway');
      }, 3000); // 3秒超時
      return () => clearTimeout(timeout);
    }
  }, [status]);

  // 如果超過3秒還在 loading，強制顯示內容
  const [loadingTimeout, setLoadingTimeout] = useState(false);
  useEffect(() => {
    if (status === 'loading') {
      const timer = setTimeout(() => setLoadingTimeout(true), 3000);
      return () => clearTimeout(timer);
    } else {
      setLoadingTimeout(false);
    }
  }, [status]);

  if (status === 'loading' && !loadingTimeout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {session ? <Sidebar /> : <GuestHeader />}
      <div className={session ? "ml-64 flex-1" : "flex-1 mt-16"}>
        <div className="max-w-2xl mx-auto p-6">
          <div className="mb-6">
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg ${
                  filter === 'all'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                全部
              </button>
              {session && (
                <button
                  onClick={() => setFilter('following')}
                  className={`px-4 py-2 rounded-lg ${
                    filter === 'following'
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  關注中
                </button>
              )}
            </div>
            {session ? (
              <PostForm onPostCreated={fetchPosts} />
            ) : (
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="text-center">
                  <p className="text-gray-600 mb-4">訪客模式：你可以查看所有文章，但無法發文或互動</p>
                  <a
                    href="/auth/signin"
                    className="inline-block px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    登入以使用完整功能
                  </a>
                </div>
              </div>
            )}
          </div>

          <div>
            {loading ? (
              <div className="text-center text-gray-500 py-8">載入中...</div>
            ) : posts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {filter === 'following'
                  ? '還沒有關注任何人，去關注一些用戶吧！'
                  : '還沒有文章，發佈第一篇文章吧！'}
              </div>
            ) : (
              posts.map((post) => (
                <PostCard key={post._id} post={post} onUpdate={fetchPosts} />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function SignIn() {
  const router = useRouter();
  const [userID, setUserID] = useState('');
  const [error, setError] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    // 檢查是否是 OAuth callback 後的頁面載入
    const checkCallback = async () => {
      try {
        const session = await getSession();
        if (session?.user) {
          // 檢查是否需要設置 userID
          await checkUserID(session);
        }
      } catch (error) {
        console.error('Error checking session:', error);
      }
    };
    
    // 檢查 URL 參數，看是否是 OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const hasCallback = urlParams.has('callbackUrl') || urlParams.has('error');
    
    if (hasCallback) {
      // 如果是 callback，延遲檢查確保 session 已更新
      setTimeout(checkCallback, 1000);
    } else {
      // 立即檢查（處理已經有 session 的情況）
      checkCallback();
    }
    
    // 也設置一個定期檢查（最多 3 秒）
    let checkCount = 0;
    const intervalId = setInterval(async () => {
      checkCount++;
      if (checkCount > 6) {
        clearInterval(intervalId);
        return;
      }
      const session = await getSession();
      if (session?.user) {
        await checkUserID(session);
        clearInterval(intervalId);
      }
    }, 500);
    
    return () => clearInterval(intervalId);
  }, []);

  const checkUserID = async (session: any) => {
    try {
      console.log('Checking userID for session:', session.user?.email);
      const res = await fetch('/api/users/check-userid');
      if (!res.ok) {
        console.error('Failed to check userID, status:', res.status);
        return;
      }
      const data = await res.json();
      console.log('UserID check result:', data);
      if (!data.hasUserID) {
        console.log('No userID found, showing registration form');
        setIsRegistering(true);
      } else {
        console.log('UserID found, redirecting to home');
        // 使用 replace 而不是 push，避免在歷史記錄中留下 signin 頁面
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error checking userID:', error);
    }
  };

  const handleOAuthSignIn = async (provider: 'google' | 'github') => {
    try {
      setError('');
      // 使用 redirect: true 讓 NextAuth 自動處理跳轉
      // callbackUrl 會在登入成功後使用
      await signIn(provider, { 
        redirect: true,
        callbackUrl: '/auth/signin'
      });
    } catch (error: any) {
      console.error('OAuth sign in error:', error);
      setError('登入過程中發生錯誤，請檢查瀏覽器控制台或重試');
    }
  };

  const handleSetUserID = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userID.trim()) {
      setError('請輸入 userID');
      return;
    }

    const res = await fetch('/api/users/set-userid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userID: userID.trim() }),
    });

    const data = await res.json();
    if (res.ok) {
      router.push('/');
    } else {
      setError(data.error || '設置 userID 失敗');
    }
  };

  // 防止 hydration 不匹配
  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (isRegistering) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              完成註冊
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              請設定您的 userID
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleSetUserID}>
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <div>
              <label htmlFor="userID" className="sr-only">
                UserID
              </label>
              <input
                id="userID"
                name="userID"
                type="text"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                placeholder="請輸入 userID"
                value={userID}
                onChange={(e) => setUserID(e.target.value)}
              />
            </div>
            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                完成註冊
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            MySocialMedia
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            使用 OAuth 登入
          </p>
        </div>
        <div className="mt-8 space-y-4">
          {error && (
            <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded border border-red-200">
              {error}
              <div className="mt-2 text-xs text-red-500">
                詳細設定步驟請參考：GOOGLE_OAUTH_SETUP.md
              </div>
            </div>
          )}
          <button
            onClick={() => handleOAuthSignIn('google')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            使用 Google 登入
          </button>
          <button
            onClick={() => handleOAuthSignIn('github')}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            使用 GitHub 登入
          </button>
        </div>
      </div>
    </div>
  );
}

// 移除 getServerSideProps，完全由客戶端處理
// export const getServerSideProps: GetServerSideProps = async (context) => {
//   return { props: {} };
// };


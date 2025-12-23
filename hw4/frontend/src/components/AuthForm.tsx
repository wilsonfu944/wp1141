// 認證表單組件
import { useState } from 'react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (email: string, password: string) => Promise<void>;
  onSwitchMode: () => void;
  loading?: boolean;
  error?: string | null;
}

export const AuthForm = ({ mode, onSubmit, onSwitchMode, loading = false, error }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 驗證必填欄位
    if (!email.trim()) {
      alert('請輸入電子郵件');
      return;
    }

    if (!password.trim()) {
      alert('請輸入密碼');
      return;
    }

    // 驗證 Email 格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('請輸入有效的電子郵件地址');
      return;
    }

    if (mode === 'register') {
      // 驗證密碼長度
      if (password.length < 6) {
        alert('密碼至少需要 6 個字元');
        return;
      }

      // 驗證密碼確認
      if (password !== confirmPassword) {
        alert('密碼確認不一致');
        return;
      }
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      // 錯誤由父組件處理
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary-100">
            <span className="text-2xl">🏃‍♂️</span>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {mode === 'login' ? '登入您的帳戶' : '建立新帳戶'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {mode === 'login' ? '或' : '或'}
            <button
              type="button"
              onClick={onSwitchMode}
              className="font-medium text-primary-600 hover:text-primary-500 ml-1"
            >
              {mode === 'login' ? '註冊新帳戶' : '登入現有帳戶'}
            </button>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                電子郵件地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 input-field"
                placeholder="請輸入電子郵件"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                密碼
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 input-field"
                placeholder="請輸入密碼"
              />
            </div>

            {mode === 'register' && (
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  確認密碼
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="mt-1 input-field"
                  placeholder="請再次輸入密碼"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : (mode === 'login' ? '登入' : '註冊')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};






// 認證相關 Hook
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthResponse } from '../types';
import { apiService } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // 初始化時檢查本地存儲的認證資訊
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      const storedUser = localStorage.getItem('user');

      if (storedToken && storedUser) {
        try {
          // 驗證 token 是否仍然有效
          const response = await apiService.verifyToken();
          if (response.success) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          } else {
            // Token 無效，清除本地存儲
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Token 驗證失敗:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiService.login({ email, password });
      
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        
        // 保存到本地存儲
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // 更新狀態
        setToken(newToken);
        setUser(newUser);
      } else {
        throw new Error(response.error || '登入失敗');
      }
    } catch (error) {
      console.error('登入錯誤:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      const response = await apiService.register({ email, password });
      
      if (response.success && response.data) {
        const { token: newToken, user: newUser } = response.data;
        
        // 保存到本地存儲
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        // 更新狀態
        setToken(newToken);
        setUser(newUser);
      } else {
        throw new Error(response.error || '註冊失敗');
      }
    } catch (error) {
      console.error('註冊錯誤:', error);
      throw error;
    }
  };

  const logout = () => {
    // 清除本地存儲
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // 清除狀態
    setToken(null);
    setUser(null);
    
    // 呼叫後端登出 API（可選）
    apiService.logout().catch(console.error);
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
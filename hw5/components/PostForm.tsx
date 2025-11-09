import { useState, useRef, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';

interface PostFormProps {
  onPostCreated?: () => void;
  initialContent?: string;
  repostOf?: string;
}

export default function PostForm({
  onPostCreated,
  initialContent = '',
  repostOf,
}: PostFormProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [draft, setDraft] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  // 計算字數（連結佔23字，hashtag和mention不計）
  const calculateLength = (text: string): number => {
    // 提取連結
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    const urlLength = urls.reduce((sum, url) => sum + Math.min(url.length, 23), 0);

    // 移除 hashtag 和 mention
    const withoutTags = text
      .replace(/#\w+/g, '')
      .replace(/@\w+/g, '')
      .replace(urlRegex, '');

    return withoutTags.length + urlLength;
  };

  const currentLength = calculateLength(content);
  const maxLength = 280;
  const remainingChars = maxLength - currentLength;
  const isOverLimit = currentLength > maxLength;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOverLimit || !content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: content.trim(), repostOf }),
      });

      if (res.ok) {
        setContent('');
        setDraft('');
        if (onPostCreated) {
          onPostCreated();
        } else {
          router.push('/');
        }
      } else {
        const data = await res.json().catch(() => ({ error: 'Unknown error' }));
        console.error('Post creation error:', data);
        alert(`發文失敗：${data.error || '未知錯誤'}`);
      }
    } catch (error: any) {
      console.error('Error creating post:', error);
      alert(`發文失敗：${error.message || '網路錯誤，請檢查連線'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    setDraft(content);
    localStorage.setItem('postDraft', content);
    alert('草稿已儲存');
  };

  const handleLoadDraft = () => {
    const savedDraft = localStorage.getItem('postDraft') || draft;
    if (savedDraft) {
      setContent(savedDraft);
      setDraft('');
      localStorage.removeItem('postDraft');
    }
  };

  const handleDiscard = () => {
    if (confirm('確定要捨棄目前的內容嗎？')) {
      setContent('');
      setDraft('');
      localStorage.removeItem('postDraft');
    }
  };

  if (!session) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              const newContent = e.target.value;
              if (calculateLength(newContent) <= maxLength) {
                setContent(newContent);
              }
            }}
            placeholder="有什麼新鮮事？"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
            rows={4}
            maxLength={maxLength + 100} // 允許輸入超過，但會阻止提交
          />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              儲存草稿
            </button>
            <button
              type="button"
              onClick={handleLoadDraft}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              載入草稿
            </button>
            <button
              type="button"
              onClick={handleDiscard}
              className="px-4 py-2 text-sm text-red-600 hover:text-red-800"
            >
              捨棄
            </button>
          </div>

          <div className="flex items-center space-x-4">
            <span
              className={`text-sm ${
                remainingChars < 0
                  ? 'text-red-600'
                  : remainingChars < 20
                  ? 'text-yellow-600'
                  : 'text-gray-500'
              }`}
            >
              {remainingChars}
            </span>
            <button
              type="submit"
              disabled={isOverLimit || !content.trim() || isSubmitting}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? '發送中...' : '發文'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}


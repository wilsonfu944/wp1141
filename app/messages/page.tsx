import { Suspense } from 'react';
import MessagesPage from '@/components/MessagesPage';

export default function Messages() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-8 bg-black min-h-screen">載入中...</div>}>
      <MessagesPage />
    </Suspense>
  );
}


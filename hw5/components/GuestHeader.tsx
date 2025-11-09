import Link from 'next/link';

export default function GuestHeader() {
  return (
    <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 z-10">
      <Link href="/" className="text-2xl font-bold text-primary-600">
        MySocialMedia
      </Link>
      <div className="flex items-center space-x-4">
        <Link
          href="/auth/signin"
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          登入
        </Link>
      </div>
    </div>
  );
}


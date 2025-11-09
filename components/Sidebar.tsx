import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiHome, FiUser, FiEdit3, FiLogOut } from 'react-icons/fi';
import Image from 'next/image';

export default function Sidebar() {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session) {
    return null;
  }

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/auth/signin');
  };

  const userID = (session.user as any)?.userID || '';

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-primary-600">MySocialMedia</h1>
      </div>

      <nav className="flex-1 px-4">
        <Link
          href="/"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
            router.pathname === '/'
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiHome className="w-5 h-5" />
          <span>Home</span>
        </Link>

        <Link
          href={`/profile/${userID}`}
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
            router.pathname.startsWith('/profile')
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiUser className="w-5 h-5" />
          <span>Profile</span>
        </Link>

        <Link
          href="/post"
          className={`flex items-center space-x-3 px-4 py-3 rounded-lg mb-2 ${
            router.pathname === '/post'
              ? 'bg-primary-50 text-primary-600'
              : 'text-gray-700 hover:bg-gray-50'
          }`}
        >
          <FiEdit3 className="w-5 h-5" />
          <span>Post</span>
        </Link>
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div
          className="flex items-center space-x-3 px-4 py-3 rounded-lg cursor-pointer hover:bg-gray-50"
          onClick={handleLogout}
        >
          {session.user?.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || ''}
              width={32}
              height={32}
              className="rounded-full"
            />
          )}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user?.name}
            </p>
            <p className="text-xs text-gray-500 truncate">@{userID}</p>
          </div>
          <FiLogOut className="w-5 h-5 text-gray-400" />
        </div>
      </div>
    </div>
  );
}




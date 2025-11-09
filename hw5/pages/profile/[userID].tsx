import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import PostCard from '@/components/PostCard';
import Image from 'next/image';
import { FiEdit2, FiUserPlus, FiUserCheck } from 'react-icons/fi';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { userID } = router.query;
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    coverImage: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  useEffect(() => {
    if (userID && session) {
      fetchProfile();
      fetchPosts();
    }
  }, [userID, session]);

  const fetchProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userID}`);
      const data = await res.json();
      setProfile(data);
      setEditForm({
        name: data.user.name,
        bio: data.user.bio || '',
        coverImage: data.user.coverImage || '',
      });
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/posts');
      const data = await res.json();
      const userPosts = (data.posts || []).filter(
        (post: any) => post.author.userID === userID
      );
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const res = await fetch('/api/follow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followingId: profile.user._id }),
      });

      if (res.ok) {
        const data = await res.json();
        setProfile({
          ...profile,
          isFollowing: data.isFollowing,
          stats: {
            ...profile.stats,
            followers: data.followersCount,
          },
        });
      }
    } catch (error) {
      console.error('Error toggling follow:', error);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userID}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (status === 'loading' || loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">載入中...</div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="ml-64 flex-1">
          <div className="max-w-2xl mx-auto p-6">
            <div className="text-center text-gray-500">找不到用戶</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="ml-64 flex-1">
        <div className="max-w-2xl mx-auto">
          {/* Cover Image */}
          <div className="h-48 bg-gradient-to-r from-primary-400 to-primary-600 relative">
            {profile.user.coverImage && (
              <Image
                src={profile.user.coverImage}
                alt="Cover"
                fill
                className="object-cover"
              />
            )}
          </div>

          {/* Profile Info */}
          <div className="bg-white px-6 pb-6">
            <div className="flex items-end justify-between -mt-16 mb-4">
              <div className="relative">
                {profile.user.image ? (
                  <Image
                    src={profile.user.image}
                    alt={profile.user.name}
                    width={128}
                    height={128}
                    className="rounded-full border-4 border-white"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center">
                    <span className="text-4xl text-gray-600">
                      {profile.user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                {profile.isOwnProfile ? (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>編輯個人資料</span>
                  </button>
                ) : (
                  <button
                    onClick={handleFollow}
                    className={`px-4 py-2 rounded-lg flex items-center space-x-2 ${
                      profile.isFollowing
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-primary-600 text-white hover:bg-primary-700'
                    }`}
                  >
                    {profile.isFollowing ? (
                      <>
                        <FiUserCheck className="w-4 h-4" />
                        <span>已關注</span>
                      </>
                    ) : (
                      <>
                        <FiUserPlus className="w-4 h-4" />
                        <span>關注</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="mb-4">
              <h1 className="text-2xl font-bold">{profile.user.name}</h1>
              <p className="text-gray-500">@{profile.user.userID}</p>
            </div>

            {isEditing ? (
              <div className="space-y-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    姓名
                  </label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) =>
                      setEditForm({ ...editForm, name: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    簡介
                  </label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, bio: e.target.value })
                    }
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    背景圖 URL
                  </label>
                  <input
                    type="text"
                    value={editForm.coverImage}
                    onChange={(e) =>
                      setEditForm({ ...editForm, coverImage: e.target.value })
                    }
                    placeholder="https://..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    儲存
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      fetchProfile();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    取消
                  </button>
                </div>
              </div>
            ) : (
              profile.user.bio && (
                <p className="mb-4 text-gray-700">{profile.user.bio}</p>
              )
            )}

            <div className="flex space-x-6 text-sm">
              <div>
                <span className="font-semibold">{profile.stats.posts}</span>
                <span className="text-gray-500 ml-1">文章</span>
              </div>
              <div>
                <span className="font-semibold">{profile.stats.following}</span>
                <span className="text-gray-500 ml-1">關注中</span>
              </div>
              <div>
                <span className="font-semibold">{profile.stats.followers}</span>
                <span className="text-gray-500 ml-1">追蹤者</span>
              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="mt-4 px-6">
            <h2 className="text-xl font-bold mb-4">文章</h2>
            {posts.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                還沒有發佈任何文章
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


"use client";

import { useState, useEffect, use } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { FaArrowLeft, FaCalendar } from "react-icons/fa";
import { formatRelativeTime } from "@/lib/utils";

export default function Profile({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params);
  const { data: session } = useSession();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [likedPosts, setLikedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"posts" | "likes">("posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    backgroundImage: "",
  });

  const isOwnProfile = session?.user?.userId === userId;

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setPosts(data.posts);
        setLikedPosts(data.likedPosts || []);
        setIsFollowing(data.isFollowing || false);
        setFollowersCount(data.followersCount || 0);
        setFollowingCount(data.followingCount || 0);
        setEditForm({
          name: data.user.name || "",
          bio: data.user.bio || "",
          backgroundImage: data.user.backgroundImage || "",
        });
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error);
      router.push("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    const newIsFollowing = !isFollowing;
    setIsFollowing(newIsFollowing);
    setFollowersCount((prev: number) => newIsFollowing ? prev + 1 : Math.max(0, prev - 1));

    try {
      const res = await fetch(`/api/users/${userId}/follow`, {
        method: newIsFollowing ? "POST" : "DELETE",
      });

      if (!res.ok) {
        setIsFollowing(!newIsFollowing);
        setFollowersCount((prev: number) => newIsFollowing ? Math.max(0, prev - 1) : prev + 1);
      }
    } catch (error) {
      console.error("Failed to follow/unfollow:", error);
      setIsFollowing(!newIsFollowing);
      setFollowersCount((prev: number) => newIsFollowing ? Math.max(0, prev - 1) : prev + 1);
    }
  };

  const handleEditProfile = async () => {
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        setShowEditModal(false);
        fetchProfile();
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-gray-800 p-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="hover:bg-gray-900 p-2 rounded-full"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-gray-500">{posts.length} posts</p>
            </div>
          </div>
        </div>

        {/* Banner */}
        <div className="h-48 bg-gray-700 relative overflow-hidden">
          {user.backgroundImage && (
            <img
              src={user.backgroundImage}
              alt="Banner"
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4 relative">
          <div className="flex justify-between items-start mb-4">
            <img
              src={user.image || "/default-avatar.svg"}
              alt={user.name}
              className="w-32 h-32 rounded-full border-4 border-black -mt-16 relative z-10"
            />
            <div className="relative z-20">
              {isOwnProfile ? (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-6 py-2 border border-gray-700 rounded-full font-semibold hover:bg-gray-900 bg-black"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`px-6 py-2 rounded-full font-semibold ${
                    isFollowing
                      ? "bg-transparent border border-gray-700 hover:bg-red-500/10 hover:border-red-500 hover:text-red-500"
                      : "bg-white text-black hover:bg-gray-200"
                  }`}
                >
                  {isFollowing ? "Following" : "Follow"}
                </button>
              )}
            </div>
          </div>

          <div className="mb-4">
            <h2 className="text-2xl font-bold">{user.name}</h2>
            <p className="text-gray-500">@{user.userId}</p>
          </div>

          {user.bio && <p className="mb-4">{user.bio}</p>}

          <div className="flex items-center gap-4 text-gray-500 mb-4">
            <div className="flex items-center gap-1">
              <FaCalendar />
              <span>
                Joined {formatRelativeTime(new Date(user.joinedAt))}
              </span>
            </div>
          </div>

          <div className="flex gap-4 mb-4">
            <div>
              <span className="font-bold">{followingCount}</span>{" "}
              <span className="text-gray-500">Following</span>
            </div>
            <div>
              <span className="font-bold">{followersCount}</span>{" "}
              <span className="text-gray-500">Followers</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === "posts"
                  ? "border-b-4 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
            >
              Posts
            </button>
            {isOwnProfile && (
              <button
                onClick={() => setActiveTab("likes")}
                className={`flex-1 py-4 font-semibold transition-colors ${
                  activeTab === "likes"
                    ? "border-b-4 border-blue-500"
                    : "text-gray-500 hover:bg-gray-900"
                }`}
              >
                Likes
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div>
          {activeTab === "posts" ? (
            posts.length === 0 ? (
              <div className="p-8 text-center text-gray-500">No posts yet</div>
            ) : (
              posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  onDelete={fetchProfile}
                />
              ))
            )
          ) : (
            <>
              {isOwnProfile && (
                <div className="border-b border-gray-800 p-4 bg-blue-500/10">
                  <p className="text-sm">
                    🔒 Your likes are private. Only you can see them.
                  </p>
                </div>
              )}
              {likedPosts.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No liked posts yet
                </div>
              ) : (
                likedPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onDelete={fetchProfile}
                  />
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
          <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Edit Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-500 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Name</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  value={editForm.bio}
                  onChange={(e) =>
                    setEditForm({ ...editForm, bio: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg outline-none focus:border-blue-500 resize-none"
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Background Image URL
                </label>
                <input
                  type="text"
                  value={editForm.backgroundImage}
                  onChange={(e) =>
                    setEditForm({ ...editForm, backgroundImage: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg outline-none focus:border-blue-500"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <button
                onClick={handleEditProfile}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { FaArrowLeft } from "react-icons/fa";

export default function HashtagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = use(params);
  const router = useRouter();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHashtagPosts();
  }, [tag]);

  const fetchHashtagPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hashtags/${tag}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch hashtag posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
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
            <h1 className="text-xl font-bold">#{tag}</h1>
            <p className="text-sm text-gray-500">{posts.length} posts</p>
          </div>
        </div>
      </div>

      {/* Posts */}
      <div>
        {posts.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No posts with #{tag} yet
          </div>
        ) : (
          posts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              onDelete={fetchHashtagPosts}
            />
          ))
        )}
      </div>
    </div>
  );
}


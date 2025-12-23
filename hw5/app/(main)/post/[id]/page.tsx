"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { PostModal } from "@/components/PostModal";
import { FaArrowLeft } from "react-icons/fa";

export default function PostDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showReplyModal, setShowReplyModal] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${id}`);
      if (res.ok) {
        const data = await res.json();
        setPost(data.post);
      } else {
        router.push("/home");
      }
    } catch (error) {
      console.error("Failed to fetch post:", error);
      router.push("/home");
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

  if (!post) {
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
            <h1 className="text-xl font-bold">Post</h1>
          </div>
        </div>

        {/* Main Post */}
        <PostCard
          post={post}
          onDelete={() => router.push("/home")}
          onReply={() => setShowReplyModal(true)}
        />

        {/* Comments */}
        <div>
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment: any) => (
              <PostCard
                key={comment.id}
                post={comment}
                onDelete={fetchPost}
                onReply={() => {
                  // Could open reply modal for this comment
                }}
              />
            ))
          ) : (
            <div className="p-8 text-center text-gray-500">
              No comments yet. Be the first to reply!
            </div>
          )}
        </div>
      </div>

      <PostModal
        isOpen={showReplyModal}
        onClose={() => setShowReplyModal(false)}
        onSuccess={() => {
          setShowReplyModal(false);
          fetchPost();
        }}
        parentId={post.id}
      />
    </>
  );
}





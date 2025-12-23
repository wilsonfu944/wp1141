"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { PostCard } from "@/components/PostCard";
import { PostModal } from "@/components/PostModal";

export default function Home() {
  const { data: session, status } = useSession();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "following">("all");
  const [showPostModal, setShowPostModal] = useState(false);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);
  const [inlineContent, setInlineContent] = useState("");

  useEffect(() => {
    if (status === "unauthenticated") {
      redirect("/auth/signin");
    }
    if (status === "authenticated" && !session?.user?.userId) {
      redirect("/auth/register");
    }
  }, [status, session]);

  useEffect(() => {
    if (status === "authenticated" && session?.user?.userId) {
      fetchPosts();
    }
  }, [activeTab, status, session]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts?feed=${activeTab}`);
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts);
      }
    } catch (error) {
      console.error("Failed to fetch posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostSuccess = () => {
    fetchPosts();
  };

  const handleInlinePost = async () => {
    if (!inlineContent.trim()) return;

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: inlineContent }),
      });

      if (res.ok) {
        setInlineContent("");
        fetchPosts();
      }
    } catch (error) {
      console.error("Failed to post:", error);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-2xl">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <div className="max-w-2xl mx-auto border-x border-gray-800 min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-black/80 backdrop-blur border-b border-gray-800">
          <div className="flex">
            <button
              onClick={() => setActiveTab("all")}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === "all"
                  ? "border-b-4 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-4 font-semibold transition-colors ${
                activeTab === "following"
                  ? "border-b-4 border-blue-500"
                  : "text-gray-500 hover:bg-gray-900"
              }`}
            >
              Following
            </button>
          </div>
        </div>

        {/* Inline Post Composer */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex gap-3">
            <img
              src={session?.user?.image || "/default-avatar.svg"}
              alt="Profile"
              className="w-12 h-12 rounded-full"
            />
            <div className="flex-1">
              <textarea
                value={inlineContent}
                onChange={(e) => setInlineContent(e.target.value)}
                onClick={() => {
                  // Optionally expand or show more options
                }}
                placeholder="What's happening?"
                className="w-full bg-transparent text-xl outline-none resize-none"
                rows={1}
              />
              {inlineContent.trim() && (
                <div className="mt-3 flex justify-end">
                  <button
                    onClick={handleInlinePost}
                    className="bg-blue-500 hover:bg-blue-600 px-6 py-2 rounded-full font-semibold"
                  >
                    Post
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Feed */}
        <div>
          {posts.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {activeTab === "following"
                ? "Follow some users to see their posts here"
                : "No posts yet"}
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onDelete={fetchPosts}
                onReply={() => {
                  setReplyToPostId(post.id);
                  setShowReplyModal(true);
                }}
              />
            ))
          )}
        </div>
      </div>

      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSuccess={handlePostSuccess}
      />

      <PostModal
        isOpen={showReplyModal}
        onClose={() => {
          setShowReplyModal(false);
          setReplyToPostId(null);
        }}
        onSuccess={() => {
          setShowReplyModal(false);
          setReplyToPostId(null);
          fetchPosts();
        }}
        parentId={replyToPostId}
      />
    </>
  );
}





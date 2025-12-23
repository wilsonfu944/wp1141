"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { calculateCharCount } from "@/lib/utils";
import { FaImage, FaTimes } from "react-icons/fa";

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  parentId?: string | null;
}

export function PostModal({ isOpen, onClose, onSuccess, parentId = null }: PostModalProps) {
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [charCount, setCharCount] = useState(0);
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [drafts, setDrafts] = useState<any[]>([]);
  const [showDrafts, setShowDrafts] = useState(false);

  useEffect(() => {
    setCharCount(calculateCharCount(content));
  }, [content]);

  useEffect(() => {
    if (showDrafts) {
      fetchDrafts();
    }
  }, [showDrafts]);

  const fetchDrafts = async () => {
    try {
      const res = await fetch("/api/drafts");
      if (res.ok) {
        const data = await res.json();
        setDrafts(data.drafts);
      }
    } catch (error) {
      console.error("Failed to fetch drafts:", error);
    }
  };

  const handlePost = async () => {
    if (!content.trim() || charCount > 280) return;

    setLoading(true);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, parentId }),
      });

      if (res.ok) {
        setContent("");
        onSuccess();
        onClose();
      }
    } catch (error) {
      console.error("Failed to post:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (content.trim()) {
      setShowDiscardDialog(true);
    } else {
      onClose();
    }
  };

  const handleSaveDraft = async () => {
    try {
      await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      setContent("");
      setShowDiscardDialog(false);
      onClose();
    } catch (error) {
      console.error("Failed to save draft:", error);
    }
  };

  const handleDiscard = () => {
    setContent("");
    setShowDiscardDialog(false);
    onClose();
  };

  const handleLoadDraft = (draft: any) => {
    setContent(draft.content);
    setShowDrafts(false);
  };

  const handleDeleteDraft = async (draftId: string) => {
    try {
      await fetch(`/api/drafts/${draftId}`, { method: "DELETE" });
      fetchDrafts();
    } catch (error) {
      console.error("Failed to delete draft:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-20">
        <div className="bg-gray-900 rounded-2xl w-full max-w-2xl border border-gray-800 max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-800">
            <button
              onClick={handleClose}
              className="text-white hover:bg-gray-800 p-2 rounded-full"
            >
              <FaTimes />
            </button>
            <button
              onClick={() => setShowDrafts(!showDrafts)}
              className="text-blue-500 text-sm font-semibold hover:underline"
            >
              Drafts
            </button>
          </div>

          {showDrafts ? (
            <div className="flex-1 overflow-y-auto p-4">
              <h3 className="text-xl font-bold mb-4">Your Drafts</h3>
              {drafts.length === 0 ? (
                <p className="text-gray-500">No drafts saved</p>
              ) : (
                <div className="space-y-3">
                  {drafts.map((draft) => (
                    <div
                      key={draft.id}
                      className="border border-gray-800 rounded-lg p-3 hover:bg-gray-800 cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <p
                          onClick={() => handleLoadDraft(draft)}
                          className="flex-1 text-sm"
                        >
                          {draft.content}
                        </p>
                        <button
                          onClick={() => handleDeleteDraft(draft.id)}
                          className="text-red-500 hover:text-red-400 ml-2"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="flex gap-3">
                  <img
                    src={session?.user?.image || "/default-avatar.svg"}
                    alt="Profile"
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1">
                    <textarea
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="What's happening?"
                      className="w-full bg-transparent text-xl outline-none resize-none min-h-32"
                      autoFocus
                    />
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-gray-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-blue-500">
                    <button className="hover:bg-gray-800 p-2 rounded-full">
                      <FaImage />
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-sm ${
                        charCount > 280 ? "text-red-500" : "text-gray-500"
                      }`}
                    >
                      {charCount}/280
                    </span>
                    <button
                      onClick={handlePost}
                      disabled={!content.trim() || charCount > 280 || loading}
                      className="bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-2 rounded-full font-semibold"
                    >
                      {loading ? "Posting..." : parentId ? "Reply" : "Post"}
                    </button>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Discard Dialog */}
      {showDiscardDialog && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center">
          <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full border border-gray-800">
            <h3 className="text-xl font-bold mb-2">Save draft?</h3>
            <p className="text-gray-500 mb-6">
              You can save this to send later from your drafts.
            </p>
            <div className="space-y-3">
              <button
                onClick={handleSaveDraft}
                className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-full font-semibold"
              >
                Save
              </button>
              <button
                onClick={handleDiscard}
                className="w-full py-3 border border-gray-700 hover:bg-gray-800 rounded-full font-semibold"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}





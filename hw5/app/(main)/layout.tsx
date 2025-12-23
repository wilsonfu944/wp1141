"use client";

import { useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { PostModal } from "@/components/PostModal";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [showPostModal, setShowPostModal] = useState(false);

  return (
    <div className="flex">
      <Sidebar onPostClick={() => setShowPostModal(true)} />
      <main className="flex-1">{children}</main>
      <PostModal
        isOpen={showPostModal}
        onClose={() => setShowPostModal(false)}
        onSuccess={() => {
          setShowPostModal(false);
          // Optionally refresh the feed
        }}
      />
    </div>
  );
}







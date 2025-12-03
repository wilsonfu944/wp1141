"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { formatRelativeTime } from "@/lib/utils";
import { FaHeart, FaRetweet, FaComment } from "react-icons/fa";

interface Notification {
  id: string;
  type: string;
  read: boolean;
  createdAt: string;
  postId: string;
  actor: {
    id: string;
    name: string;
    userId: string;
    image: string;
  };
  post: {
    id: string;
    content: string;
    authorId: string;
  };
}

export default function Notifications() {
  const { data: session } = useSession();
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    markAllAsRead();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch("/api/notifications/read-all", {
        method: "PATCH",
      });
    } catch (error) {
      console.error("Failed to mark notifications as read:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "LIKE":
        return <FaHeart className="text-red-500" />;
      case "REPOST":
        return <FaRetweet className="text-green-500" />;
      case "COMMENT":
        return <FaComment className="text-blue-500" />;
      default:
        return null;
    }
  };

  const getNotificationText = (type: string) => {
    switch (type) {
      case "LIKE":
        return "liked your post";
      case "REPOST":
        return "reposted your post";
      case "COMMENT":
        return "commented on your post";
      default:
        return "interacted with your post";
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
        <h1 className="text-xl font-bold">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div>
        {notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.tagName === 'A' || target.closest('a')) {
                  return;
                }
                router.push(`/post/${notification.postId}`);
              }}
              className={`border-b border-gray-800 p-4 hover:bg-gray-900/30 transition-colors cursor-pointer ${
                !notification.read ? "bg-blue-500/5" : ""
              }`}
            >
              <div className="flex gap-3">
                <div className="text-2xl shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/profile/${notification.actor.userId}`}
                      className="shrink-0"
                    >
                      <img
                        src={notification.actor.image || "/default-avatar.svg"}
                        alt={notification.actor.name}
                        className="w-8 h-8 rounded-full hover:opacity-80 transition-opacity"
                      />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p>
                        <Link
                          href={`/profile/${notification.actor.userId}`}
                          className="font-bold hover:underline"
                        >
                          {notification.actor.name}
                        </Link>{" "}
                        <span className="text-gray-500">
                          {getNotificationText(notification.type)}
                        </span>
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatRelativeTime(new Date(notification.createdAt))}
                      </p>
                    </div>
                  </div>

                  {notification.post && (
                    <div className="mt-2 p-3 bg-gray-900 rounded-lg border border-gray-800">
                      <p className="text-sm text-gray-400 line-clamp-2">
                        {notification.post.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}


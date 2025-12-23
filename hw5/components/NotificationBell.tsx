"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { FaBell } from "react-icons/fa";
import { pusherClient } from "@/lib/pusher-client";

interface NotificationBellProps {
  initialCount?: number;
}

export function NotificationBell({ initialCount = 0 }: NotificationBellProps) {
  const { data: session } = useSession();
  const [unreadCount, setUnreadCount] = useState(initialCount);

  useEffect(() => {
    // Fetch initial unread count
    const fetchUnreadCount = async () => {
      try {
        const res = await fetch("/api/notifications/unread-count");
        if (res.ok) {
          const data = await res.json();
          setUnreadCount(data.count);
        }
      } catch (error) {
        console.error("Failed to fetch unread count:", error);
      }
    };

    fetchUnreadCount();

    // Subscribe to user-specific notifications
    if (session?.user?.id) {
      const channel = pusherClient.subscribe(`user-${session.user.id}`);

      channel.bind("new-notification", () => {
        setUnreadCount((prev) => prev + 1);
      });

      return () => {
        channel.unbind_all();
        pusherClient.unsubscribe(`user-${session.user.id}`);
      };
    }
  }, [session?.user?.id]);

  return (
    <div className="relative">
      <FaBell className="text-2xl" />
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </div>
  );
}


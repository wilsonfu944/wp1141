"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FaHome, FaUser, FaFeatherAlt, FaBell } from "react-icons/fa";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";

interface SidebarProps {
  onPostClick: () => void;
}

export function Sidebar({ onPostClick }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const navItems = [
    { href: "/home", label: "Home", icon: FaHome },
    { href: "/notifications", label: "Notifications", icon: FaBell, showBadge: true },
    { href: `/profile/${session?.user?.userId}`, label: "Profile", icon: FaUser },
  ];

  return (
    <div className="w-64 h-screen sticky top-0 flex flex-col border-r border-gray-800 p-4">
      {/* Logo */}
      <Link href="/home" className="text-4xl font-bold mb-8 px-3">
        𝕏
      </Link>

      {/* Navigation */}
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || 
                          (item.href.includes('/profile') && pathname?.includes('/profile')) ||
                          (item.href.includes('/notifications') && pathname?.includes('/notifications'));
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3 rounded-full text-xl transition-colors relative",
                isActive ? "font-bold" : "hover:bg-gray-900"
              )}
            >
              {item.showBadge ? (
                <NotificationBell />
              ) : (
                <Icon className="text-2xl" />
              )}
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* Post Button */}
        <button
          onClick={onPostClick}
          className="w-full flex items-center gap-4 px-4 py-3 bg-blue-500 hover:bg-blue-600 rounded-full text-xl font-semibold transition-colors"
        >
          <FaFeatherAlt />
          <span>Post</span>
        </button>
      </nav>

      {/* User Menu */}
      <div className="relative">
        <button
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-full flex items-center gap-3 p-3 hover:bg-gray-900 rounded-full transition-colors"
        >
          <img
            src={session?.user?.image || "/default-avatar.svg"}
            alt="Profile"
            className="w-10 h-10 rounded-full"
          />
          <div className="flex-1 text-left overflow-hidden">
            <p className="font-semibold truncate">{session?.user?.name}</p>
            <p className="text-sm text-gray-500 truncate">
              @{session?.user?.userId}
            </p>
          </div>
          <span className="text-gray-500">⋯</span>
        </button>

        {showUserMenu && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setShowUserMenu(false)}
            />
            <div className="absolute bottom-full mb-2 left-0 right-0 bg-gray-900 border border-gray-800 rounded-xl shadow-xl overflow-hidden z-20">
              <button
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full px-4 py-3 text-left hover:bg-gray-800 transition-colors"
              >
                Log out @{session?.user?.userId}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}





"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { validateUserId } from "@/lib/utils";

export default function Register() {
  const { data: session, update } = useSession();
  const router = useRouter();
  const [userId, setUserId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!validateUserId(userId)) {
      setError("UserID must be 3-15 characters (letters, numbers, underscore only)");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register userID");
        setLoading(false);
        return;
      }

      // Update session
      await update();
      router.push("/");
    } catch (err) {
      setError("An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 rounded-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">𝕏</h1>
          <h2 className="text-2xl font-bold text-white">Create your userID</h2>
          <p className="mt-2 text-gray-400">
            Choose a unique userID for your X account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="userId" className="block text-sm font-medium text-gray-300 mb-2">
              UserID
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">@</span>
              <input
                type="text"
                id="userId"
                value={userId}
                onChange={(e) => setUserId(e.target.value.toLowerCase())}
                className="w-full pl-8 pr-4 py-3 bg-black border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                placeholder="your_userid"
                maxLength={15}
                required
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              3-15 characters: letters, numbers, and underscore only
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-500 text-white font-semibold rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="text-center text-xs text-gray-500">
          <p>Logged in as: {session?.user?.email}</p>
        </div>
      </div>
    </div>
  );
}







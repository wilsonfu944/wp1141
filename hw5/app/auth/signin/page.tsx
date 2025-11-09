"use client";

import { signIn } from "next-auth/react";
import { FaGoogle, FaGithub } from "react-icons/fa";

export default function SignIn() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-900 rounded-xl border border-gray-800">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">𝕏</h1>
          <h2 className="text-2xl font-bold text-white">Sign in to X</h2>
          <p className="mt-2 text-gray-400">Choose your preferred sign-in method</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-full text-white hover:bg-gray-800 transition-colors"
          >
            <FaGoogle className="text-xl" />
            <span>Continue with Google</span>
          </button>

          <button
            onClick={() => signIn("github", { callbackUrl: "/" })}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-700 rounded-full text-white hover:bg-gray-800 transition-colors"
          >
            <FaGithub className="text-xl" />
            <span>Continue with GitHub</span>
          </button>
        </div>

        <div className="text-center text-sm text-gray-400 pt-4">
          <p>By signing in, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}





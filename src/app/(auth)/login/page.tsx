"use client";

import React, { useState } from "react";
import { getFirebaseAuth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Lock, Mail, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const auth = await getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      setError("Authentication is not initialized. Please try again later.");
      return;
    }

    try {
      const { signInWithEmailAndPassword } = await import("firebase/auth");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      if (!userCredential.user) {
        throw new Error("Authentication succeeded but no user was returned.");
      }

      const token = await userCredential.user.getIdToken();
      const response = await fetch("/api/auth/session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ token }),
      });

      if (!response.ok) {
        throw new Error("Failed to create a secure session.");
      }
      
      router.push("/admin/dashboard");
    } catch (err: any) {
      console.error(err);

      // Friendly error messages as requested
      switch (err.code) {
        case "auth/user-not-found":
        case "auth/invalid-credential":
          setError("Invalid email or password. Please try again.");
          break;
        case "auth/wrong-password":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        case "auth/too-many-requests":
          setError("Too many failed attempts. Please try again later.");
          break;
        case "auth/network-request-failed":
          setError("Network error. Please check your internet connection.");
          break;
        default:
          setError("Failed to sign in. Please check your credentials.");
      }
    } finally {

      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/auth/session", {
        method: "DELETE",
        credentials: "include",
      });
    } catch {
      // If the session endpoint is unavailable, the page still continues to the public site.
    } finally {
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-4 font-sans">
      <div className="max-w-md w-full">
        {/* Branding */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6 transition-transform hover:scale-105">
            <div className="bg-secondary-500 p-4 rounded-2xl shadow-lg">
              <Image 
                src="/logo.png" 
                alt="Combine Foundation" 
                width={200} 
                height={60} 
                className="object-contain brightness-0 invert"
              />
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-secondary-500 tracking-tight">Admin Portal</h1>
          <p className="text-gray-500 mt-2 font-medium">Restricted Access • Authorized Personnel Only</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-[2rem] shadow-2xl border border-gray-100 overflow-hidden">
          {/* Accent Bar */}
          <div className="h-2 bg-gradient-to-r from-secondary-500 via-orange to-secondary-500"></div>
          
          <div className="p-10">
            <p className="text-xs text-gray-500 mb-4 text-center">
              By signing in, you acknowledge our <Link href="/privacy" className="text-secondary-600 underline hover:text-secondary-700">Privacy Policy.</Link>
            </p>
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 flex items-start gap-3 rounded-r-xl animate-in fade-in slide-in-from-top-4 duration-300">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 font-semibold">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary-500 ml-1 uppercase tracking-wider">Email Address</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange transition-colors">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 focus:ring-0 focus:border-orange transition-all outline-none font-medium"
                    placeholder="admin2@combinefoundation.com"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-secondary-500 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-orange transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl text-gray-900 focus:ring-0 focus:border-orange transition-all outline-none font-medium"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-secondary-500 hover:brightness-90 text-white py-4 rounded-2xl font-bold text-lg shadow-[0_10px_20px_-10px_rgba(19,73,129,0.5)] hover:shadow-[0_15px_25px_-10px_rgba(19,73,129,0.6)] transition-all transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2 group mt-4"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-orange" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="px-10 py-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
            <button
              type="button"
              onClick={handleSignOut}
              className="text-xs font-bold text-gray-400 hover:text-secondary-500 transition-colors flex items-center gap-1"
            >
              <span className="text-lg">←</span> Back to Website
            </button>
            <div className="flex gap-2">
              <div className="w-2 h-2 rounded-full bg-orange"></div>
              <div className="w-2 h-2 rounded-full bg-secondary-500"></div>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 flex items-center justify-center gap-2 text-gray-400">
          <Lock className="w-4 h-4" />
          <p className="text-xs font-medium uppercase tracking-[0.2em]">End-to-End Encrypted Session</p>
        </div>
      </div>
    </div>
  );
}

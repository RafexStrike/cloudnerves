'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useGetCurrentUser } from '@/lib/useGetCurrentUser.js';
import { useEffect } from 'react';

export default function DashboardPage() {
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const { user, loading: mongoLoading, isNewUser } = useGetCurrentUser();
  const router = useRouter();
  
  const loading = authLoading || mongoLoading;

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login');
    }
  }, [authUser, loading, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-base-100 via-purple-900 to-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-purple-900 to-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200/50 backdrop-blur border-b border-purple-500/20 sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex-1">
            <Link href="/dashboard" className="btn btn-ghost text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              CloudNerves
            </Link>
          </div>
        </div>

        <div className="navbar-end gap-4">
          <div className="tooltip tooltip-bottom" data-tip={authUser?.email}>
            <div className="text-sm text-base-content/70">
              <span className="hidden sm:inline">{authUser?.email}</span>
              <span className="sm:hidden">{authUser?.email?.split('@')[0]}</span>
            </div>
          </div>

          <button onClick={handleLogout} className="btn btn-outline btn-primary btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* New User Welcome */}
        {isNewUser && (
          <div className="alert alert-success mb-8">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="stroke-current shrink-0 h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>🎉 Welcome to CloudNerves! Your profile has been created and saved to our database.</span>
          </div>
        )}

        {/* Welcome Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Welcome Back!
            </span>
          </h1>
          <p className="text-xl text-base-content/70 mb-8">
            Revolutionizing campus dining with tokenless technology
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-primary flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Verified Identity
              </h2>
              <p className="text-base-content/70">Your identity has been securely verified</p>
              <div className="badge badge-success gap-2 w-fit">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                  className="inline w-4 h-4"
                >
                  <path d="M10.854 7.146a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708 0l-1.5-1.5a.5.5 0 1 1 .708-.708L7.5 9.793l2.646-2.647a.5.5 0 0 1 .708 0z" />
                </svg>
                Status Active
              </div>
            </div>
          </div>

          <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-accent flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Meal Balance
              </h2>
              <p className="text-2xl font-bold text-primary">$450.00</p>
              <p className="text-base-content/70 text-sm">Current dining credits</p>
            </div>
          </div>

          <div className="card bg-base-200 border border-purple-500/20 shadow-xl hover:shadow-2xl transition-shadow">
            <div className="card-body">
              <h2 className="card-title text-info flex items-center gap-2">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Meals Today
              </h2>
              <p className="text-2xl font-bold text-info">0/2</p>
              <p className="text-base-content/70 text-sm">Meals consumed today</p>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Dining Entry */}
          <div className="card bg-gradient-to-br from-purple-900/30 to-base-200 border border-purple-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl text-primary mb-4">Enter Dining Hall</h2>
              <p className="text-base-content/70 mb-6">
                Use face recognition or ID card scan to access the dining hall. Our secure system ensures only authorized members get access.
              </p>
              <div className="card-actions">
                <button className="btn btn-primary w-full">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                  Go to Entry Point
                </button>
              </div>
            </div>
          </div>

          {/* Your Activity */}
          <div className="card bg-gradient-to-br from-purple-900/30 to-base-200 border border-purple-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-xl text-accent mb-4">Recent Activity</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-base-100/50 rounded-lg">
                  <span className="text-base-content/70">Today - Breakfast</span>
                  <span className="badge badge-primary">Completed</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-base-100/50 rounded-lg">
                  <span className="text-base-content/70">Yesterday - Lunch</span>
                  <span className="badge badge-success">Completed</span>
                </div>
                <div className="text-center text-base-content/50 py-4">
                  No more recent activity
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card bg-base-200 border border-purple-500/20 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-2xl mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <button className="btn btn-outline btn-primary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                View Schedule
              </button>
              <button className="btn btn-outline btn-primary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Add Funds
              </button>
              <button className="btn btn-outline btn-primary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Profile Settings
              </button>
              <button className="btn btn-outline btn-primary">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
                Get Help
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

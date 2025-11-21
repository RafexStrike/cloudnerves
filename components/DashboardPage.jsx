'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useGetCurrentUser } from '@/lib/useGetCurrentUser.js';
import StudentMealRequest from './StudentMealRequest';
import ManagerRequestsTable from './ManagerRequestsTable';
import AdminPanel from './AdminPanel';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const { user, loading: mongoLoading, isNewUser } = useGetCurrentUser();
  const router = useRouter();
  const [userRole, setUserRole] = useState(null);
  const [userDocument, setUserDocument] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  const loading = authLoading || mongoLoading || roleLoading;

  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login');
    }
  }, [authUser, loading, router]);

  // Fetch user document to get role
  useEffect(() => {
    if (authUser?.uid) {
      fetchUserRole();
    }
  }, [authUser?.uid]);

  const fetchUserRole = async () => {
    try {
      const response = await fetch(`/api/users/${authUser.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setUserRole(userData.role);
        setUserDocument(userData);
        console.log('User role:', userData.role);
      }
    } catch (error) {
      console.error('Error fetching user role:', error);
    } finally {
      setRoleLoading(false);
    }
  };

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

  // Render role-based dashboard
  const renderDashboard = () => {
    switch (userRole) {
      case 'admin':
        return (
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Admin Dashboard
                </span>
              </h1>
              <p className="text-xl text-base-content/70">
                Manage all requests, users, and system settings
              </p>
            </div>
            <AdminPanel />
          </div>
        );

      case 'manager':
        return (
          <div className="container mx-auto px-4 py-12">
            <div className="mb-8">
              <h1 className="text-5xl font-bold mb-2">
                <span className="bg-gradient-to-r from-info via-accent to-info bg-clip-text text-transparent">
                  Manager Dashboard
                </span>
              </h1>
              <p className="text-xl text-base-content/70">
                Review and approve student meal requests
              </p>
            </div>
            <ManagerRequestsTable />
          </div>
        );

      case 'student':
        return (
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-4">
                <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                  Welcome Back!
                </span>
              </h1>
              <p className="text-xl text-base-content/70 mb-8">
                Request your meal tokens below
              </p>
            </div>

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

            <StudentMealRequest user={authUser} />
          </div>
        );

      default:
        return (
          <div className="container mx-auto px-4 py-12">
            <div className="alert alert-warning">
              <span>User role not found. Please contact administrator.</span>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-base-100 via-purple-900 to-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200/50 backdrop-blur border-b border-purple-500/20 sticky top-0 z-50">
        <div className="navbar-start">
          <div className="flex-1">
            <Link
              href="/dashboard"
              className="btn btn-ghost text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
            >
              CloudNerves
            </Link>
          </div>
        </div>

        <div className="navbar-center hidden md:flex">
          <div className="badge badge-primary gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 11a9 9 0 00-5.86 0m5.92 0a9.001 9.001 0 01.996 1.529m-5.88-9.529a9.001 9.001 0 01.996-1.529m5.92 0a9 9 0 10-5.92 0m5.92 0a9.001 9.001 0 01-.996 1.529m-5.88 9.529a9 9 0 00-5.86 0m5.92 0a9.001 9.001 0 01-.996-1.529m5.88 9.529a9.001 9.001 0 01-.996 1.529" />
            </svg>
            {userRole ? userRole.toUpperCase() : 'LOADING'}
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
      {renderDashboard()}
    </div>
  );
}

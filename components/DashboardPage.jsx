'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useGetCurrentUser } from '@/lib/useGetCurrentUser.js';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
  const { user: authUser, logout, loading: authLoading } = useAuth();
  const { user, loading: mongoLoading, isNewUser } = useGetCurrentUser();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);
  const router = useRouter();

  const loading = authLoading || mongoLoading || roleLoading;

  // Fetch user role from MongoDB
  useEffect(() => {
    const fetchUserRole = async () => {
      if (!authUser?.uid) {
        setRoleLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users/${authUser.uid}`);
        if (response.ok) {
          const userData = await response.json();
          setUserRole(userData.role || 'student');
        } else {
          setUserRole('student'); // Default role
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setUserRole('student');
      } finally {
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [authUser?.uid]);

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
      <div className="min-h-screen bg-linear-to-br from-base-100 via-purple-900 to-base-100 flex items-center justify-center">
        <div className="text-center">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="mt-4 text-base-content text-lg">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  if (userRole === 'admin') {
    return <AdminDashboard user={authUser} handleLogout={handleLogout} isNewUser={isNewUser} />;
  } else if (userRole === 'manager') {
    return <ManagerDashboard user={authUser} handleLogout={handleLogout} isNewUser={isNewUser} />;
  } else {
    return <StudentDashboard user={authUser} handleLogout={handleLogout} isNewUser={isNewUser} />;
  }
}

// ============================================
// ADMIN DASHBOARD
// ============================================
function AdminDashboard({ user, handleLogout, isNewUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    email: '',
    role: 'student',
    password: '',
  });

  useEffect(() => {
    fetchAllUsers();
  }, []);

  const fetchAllUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowModal(false);
        setFormData({ displayName: '', email: '', role: 'student', password: '' });
        fetchAllUsers();
      }
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleDeleteUser = async (uid) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        await fetch(`/api/admin/users/${uid}`, { method: 'DELETE' });
        fetchAllUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-base-100 via-purple-900 to-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200/50 backdrop-blur border-b border-red-500/30 sticky top-0 z-50">
        <div className="navbar-start">
          <Link href="/dashboard" className="btn btn-ghost text-2xl font-bold bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
            ⚙️ Admin Panel
          </Link>
        </div>
        <div className="navbar-end gap-4">
          <div className="badge badge-error gap-2">{user?.email}</div>
          <button onClick={handleLogout} className="btn btn-outline btn-error btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* New User Alert */}
        {isNewUser && (
          <div className="alert alert-info mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Welcome Admin! Your admin account has been activated.</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-xl text-base-content/70">Manage all users, roles, and system settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-base-200 border border-red-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-error flex items-center gap-2">
                <span>👥</span> Total Users
              </h2>
              <p className="text-3xl font-bold">{users.length}</p>
            </div>
          </div>

          <div className="card bg-base-200 border border-orange-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-warning flex items-center gap-2">
                <span>🛠️</span> Managers
              </h2>
              <p className="text-3xl font-bold">{users.filter(u => u.role === 'manager').length}</p>
            </div>
          </div>

          <div className="card bg-base-200 border border-blue-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-info flex items-center gap-2">
                <span>📚</span> Students
              </h2>
              <p className="text-3xl font-bold">{users.filter(u => u.role === 'student').length}</p>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="card bg-base-200 border border-red-500/20 shadow-xl">
          <div className="card-body">
            <div className="flex justify-between items-center mb-4">
              <h2 className="card-title text-red-500">All Users</h2>
              <button onClick={() => setShowModal(true)} className="btn btn-sm btn-error">
                + Add User
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner"></span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table table-zebra w-full">
                  <thead>
                    <tr className="bg-base-300">
                      <th>Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.uid} className="hover">
                        <td className="font-semibold">{u.displayName}</td>
                        <td>{u.email}</td>
                        <td>
                          <span className={`badge ${u.role === 'admin' ? 'badge-error' : u.role === 'manager' ? 'badge-warning' : 'badge-info'}`}>
                            {u.role}
                          </span>
                        </td>
                        <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => handleDeleteUser(u.uid)}
                            disabled={u.role === 'admin'}
                            className="btn btn-xs btn-outline btn-error"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Add User Modal */}
        {showModal && (
          <div className="modal modal-open">
            <div className="modal-box bg-base-200 border border-red-500/30">
              <h3 className="font-bold text-lg mb-4">Create New User</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Name</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter name"
                    className="input input-bordered"
                    value={formData.displayName}
                    onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Email</span>
                  </label>
                  <input
                    type="email"
                    placeholder="Enter email"
                    className="input input-bordered"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Password</span>
                  </label>
                  <input
                    type="password"
                    placeholder="Enter password"
                    className="input input-bordered"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Role</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  >
                    <option value="student">Student</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div className="modal-action">
                  <button type="button" onClick={() => setShowModal(false)} className="btn">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-error">
                    Create
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================
// MANAGER DASHBOARD
// ============================================
function ManagerDashboard({ user, handleLogout, isNewUser }) {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      const response = await fetch('/api/manager/students');
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-base-100 via-purple-900 to-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200/50 backdrop-blur border-b border-yellow-500/30 sticky top-0 z-50">
        <div className="navbar-start">
          <Link href="/dashboard" className="btn btn-ghost text-2xl font-bold bg-linear-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
            🛠️ Manager Panel
          </Link>
        </div>
        <div className="navbar-end gap-4">
          <div className="badge badge-warning gap-2">{user?.email}</div>
          <button onClick={handleLogout} className="btn btn-outline btn-warning btn-sm">
            Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* New User Alert */}
        {isNewUser && (
          <div className="alert alert-warning mb-8">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>Welcome Manager! Manage your students effectively.</span>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">
            <span className="bg-linear-to-r from-yellow-500 to-orange-500 bg-clip-text text-transparent">
              Manager Dashboard
            </span>
          </h1>
          <p className="text-xl text-base-content/70">Manage and track your students</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="card bg-base-200 border border-yellow-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-warning flex items-center gap-2">
                <span>📚</span> Total Students
              </h2>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
          </div>

          <div className="card bg-base-200 border border-green-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-success flex items-center gap-2">
                <span>✓</span> Active
              </h2>
              <p className="text-3xl font-bold">{students.length}</p>
            </div>
          </div>

          <div className="card bg-base-200 border border-blue-500/30 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-info flex items-center gap-2">
                <span>📊</span> Enrollment Rate
              </h2>
              <p className="text-3xl font-bold">100%</p>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="card bg-base-200 border border-yellow-500/20 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-yellow-500 mb-6">Your Students</h2>

            {loading ? (
              <div className="text-center py-8">
                <span className="loading loading-spinner"></span>
              </div>
            ) : students.length === 0 ? (
              <div className="alert alert-info">
                <span>No students assigned yet</span>
              </div>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div key={student.uid} className="card bg-base-100 border border-yellow-500/20">
                    <div className="card-body p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-lg">{student.displayName}</h3>
                          <p className="text-sm text-base-content/70">{student.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-outline">View</button>
                          <button className="btn btn-sm btn-outline">Message</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// STUDENT DASHBOARD
// ============================================
function StudentDashboard({ user, handleLogout, isNewUser }) {
  return (
    <div className="min-h-screen bg-linear-to-br from-base-100 via-purple-900 to-base-100">
      {/* Navbar */}
      <div className="navbar bg-base-200/50 backdrop-blur border-b border-purple-500/20 sticky top-0 z-50">
        <div className="navbar-start">
          <Link href="/dashboard" className="btn btn-ghost text-2xl font-bold bg-linear-to-r from-primary to-accent bg-clip-text text-transparent">
            CloudNerves
          </Link>
        </div>
        <div className="navbar-end gap-4">
          <div className="tooltip tooltip-bottom" data-tip={user?.email}>
            <div className="text-sm text-base-content/70">
              <span className="hidden sm:inline">{user?.email}</span>
              <span className="sm:hidden">{user?.email?.split('@')[0]}</span>
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
            <span className="bg-linear-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
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
                Transactions
              </h2>
              <p className="text-2xl font-bold text-info">12</p>
              <p className="text-base-content/70 text-sm">This semester</p>
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="card bg-base-200 border border-purple-500/20 shadow-xl">
          <div className="card-body">
            <h2 className="card-title mb-6">Recent Transactions</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-base-100 rounded-lg border border-purple-500/10">
                <div>
                  <p className="font-semibold">Dining Hall Purchase</p>
                  <p className="text-sm text-base-content/70">Today at 12:30 PM</p>
                </div>
                <span className="text-error">-$5.50</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-base-100 rounded-lg border border-purple-500/10">
                <div>
                  <p className="font-semibold">Account Credit</p>
                  <p className="text-sm text-base-content/70">Yesterday</p>
                </div>
                <span className="text-success">+$50.00</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-base-100 rounded-lg border border-purple-500/10">
                <div>
                  <p className="font-semibold">Cafeteria Payment</p>
                  <p className="text-sm text-base-content/70">2 days ago</p>
                </div>
                <span className="text-error">-$8.25</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

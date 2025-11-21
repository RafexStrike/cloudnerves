'use client';

import { useState, useEffect } from 'react';

export default function AdminPanel() {
  const [requests, setRequests] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [message, setMessage] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchAllData();
    // Refresh every 5 seconds
    const interval = setInterval(fetchAllData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAllData = async () => {
    try {
      const [requestsRes, usersRes] = await Promise.all([
        fetch('/api/meal-requests'),
        fetch('/api/users'),
      ]);

      if (requestsRes.ok) {
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
      }

      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId, newStatus) => {
    try {
      const response = await fetch(`/api/meal-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      setRequests(
        requests.map((req) =>
          req._id === requestId
            ? { ...req, status: newStatus, updatedAt: new Date() }
            : req
        )
      );

      setMessage({
        type: 'success',
        text: `Request ${newStatus.toUpperCase()} ✓`,
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      setUsers(users.filter((u) => u.uid !== userId));

      setMessage({
        type: 'success',
        text: 'User deleted ✓',
      });
      setTimeout(() => setMessage(null), 2000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message,
      });
      setTimeout(() => setMessage(null), 2000);
    }
  };

  const filteredRequests = filter === 'all' ? requests : requests.filter((r) => r.status === filter);

  const stats = {
    totalRequests: requests.length,
    pendingRequests: requests.filter((r) => r.status === 'pending').length,
    acceptedRequests: requests.filter((r) => r.status === 'accepted').length,
    deniedRequests: requests.filter((r) => r.status === 'denied').length,
    totalUsers: users.length,
    adminCount: users.filter((u) => u.role === 'admin').length,
    managerCount: users.filter((u) => u.role === 'manager').length,
    studentCount: users.filter((u) => u.role === 'student').length,
  };

  return (
    <div className="space-y-6">
      {/* Message Alert */}
      {message && (
        <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'}`}>
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
          <span>{message.text}</span>
        </div>
      )}

      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-200 border border-info/20 rounded-lg">
          <div className="stat-title">Total Requests</div>
          <div className="stat-value text-info">{stats.totalRequests}</div>
          <div className="stat-desc">
            <span className="text-warning">{stats.pendingRequests} Pending</span>
          </div>
        </div>
        <div className="stat bg-base-200 border border-success/20 rounded-lg">
          <div className="stat-title">Accepted</div>
          <div className="stat-value text-success">{stats.acceptedRequests}</div>
        </div>
        <div className="stat bg-base-200 border border-error/20 rounded-lg">
          <div className="stat-title">Denied</div>
          <div className="stat-value text-error">{stats.deniedRequests}</div>
        </div>
        <div className="stat bg-base-200 border border-primary/20 rounded-lg">
          <div className="stat-title">Total Users</div>
          <div className="stat-value text-primary">{stats.totalUsers}</div>
          <div className="stat-desc">
            A: {stats.adminCount} | M: {stats.managerCount} | S: {stats.studentCount}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs tabs-bordered">
        <button
          onClick={() => setActiveTab('requests')}
          className={`tab capitalize ${activeTab === 'requests' ? 'tab-active' : ''}`}
        >
          Meal Requests
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`tab capitalize ${activeTab === 'users' ? 'tab-active' : ''}`}
        >
          Users
        </button>
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          {/* Filter */}
          <div className="flex gap-2">
            {['all', 'pending', 'accepted', 'denied'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`btn btn-sm capitalize ${
                  filter === status ? 'btn-primary' : 'btn-outline'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Requests Table */}
          <div className="card bg-base-200 border border-purple-500/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="table table-zebra w-full">
                <thead className="bg-purple-900/30">
                  <tr>
                    <th>Student</th>
                    <th>Meal</th>
                    <th>Token</th>
                    <th>Requested</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8">
                        <span className="loading loading-spinner"></span>
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="text-center py-8 text-base-content/50">
                        No requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr key={request._id}>
                        <td>{request.studentName}</td>
                        <td className="capitalize">{request.mealType}</td>
                        <td>
                          <span className="badge badge-info">{request.tokenId}</span>
                        </td>
                        <td className="text-sm">
                          {new Date(request.requestedAt).toLocaleString()}
                        </td>
                        <td>
                          <span
                            className={`badge ${
                              request.status === 'pending'
                                ? 'badge-warning'
                                : request.status === 'accepted'
                                  ? 'badge-success'
                                  : 'badge-error'
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                        <td>
                          {request.status === 'pending' && (
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'accepted')}
                                className="btn btn-xs btn-success"
                              >
                                ✓
                              </button>
                              <button
                                onClick={() => handleStatusUpdate(request._id, 'denied')}
                                className="btn btn-xs btn-error"
                              >
                                ✕
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="card bg-base-200 border border-purple-500/20 shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table table-zebra w-full">
              <thead className="bg-purple-900/30">
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.uid}>
                    <td className="font-mono text-sm">{user.email}</td>
                    <td>{user.displayName || 'N/A'}</td>
                    <td>
                      <span
                        className={`badge ${
                          user.role === 'admin'
                            ? 'badge-error'
                            : user.role === 'manager'
                              ? 'badge-warning'
                              : 'badge-info'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="text-sm">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteUser(user.uid)}
                        className="btn btn-xs btn-error btn-outline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

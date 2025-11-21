'use client';

import { useState, useEffect } from 'react';
import PendingRequestCard from './PendingRequestCard';
import BlockStudentModal from './BlockStudentModal';
import BlockedStudentsSection from './BlockedStudentsSection';

/**
 * ManagerRequestsTable Component
 * 
 * Enhanced manager dashboard that displays:
 * 1. Pending meal requests as cards with OK/Delete/Block actions
 * 2. Blocked students section with unblock functionality
 * 3. Statistics and filtering options
 */
export default function ManagerRequestsTable() {
  const [allRequests, setAllRequests] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Block student modal state
  const [blockModal, setBlockModal] = useState({
    isOpen: false,
    studentId: null,
    studentName: null,
    studentEmail: null,
  });

  // Fetch all requests on mount and when refresh trigger changes
  useEffect(() => {
    fetchRequests();
    // Refresh every 5 seconds
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [refreshTrigger]);

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/meal-requests');
      const data = await response.json();
      
      // The API returns an array directly, not wrapped in an object
      const allReqs = Array.isArray(data) ? data : (data.requests || []);
      setAllRequests(allReqs);
      
      // Extract pending requests
      const pending = allReqs.filter((r) => r.status === 'pending');
      setPendingRequests(pending);
      
      console.log('✓ Fetched requests:', allReqs);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setMessage({
        type: 'error',
        text: 'Failed to load requests',
      });
    } finally {
      setLoading(false);
    }
  };

  // Accept (approve) request
  const handleAccept = async (requestId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/meal-requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted' }),
      });

      if (!response.ok) throw new Error('Failed to accept request');

      setMessage({
        type: 'success',
        text: '✓ Request approved successfully',
      });
      
      setTimeout(() => setRefreshTrigger((prev) => prev + 1), 500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to accept request',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Delete request
  const handleDelete = async (requestId) => {
    if (!confirm('Are you sure you want to delete this request?')) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/meal-requests/${requestId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete request');

      setMessage({
        type: 'success',
        text: '🗑️ Request dismissed successfully',
      });
      
      setTimeout(() => setRefreshTrigger((prev) => prev + 1), 500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to delete request',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Open block student modal
  const handleBlockClick = (studentId, studentName, studentEmail) => {
    setBlockModal({
      isOpen: true,
      studentId,
      studentName,
      studentEmail,
    });
  };

  // Confirm block student
  const handleBlockConfirm = async (studentId) => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/meal-requests/student-block/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: true }),
      });

      if (!response.ok) throw new Error('Failed to block student');

      setMessage({
        type: 'success',
        text: `🚫 ${blockModal.studentName} has been blocked`,
      });

      setBlockModal({ isOpen: false, studentId: null, studentName: null, studentEmail: null });
      setTimeout(() => setRefreshTrigger((prev) => prev + 1), 500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to block student',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Unblock student
  const handleUnblock = async (studentId, studentName) => {
    if (!confirm(`Are you sure you want to unblock ${studentName}?`)) return;

    setActionLoading(true);
    try {
      const response = await fetch(`/api/meal-requests/student-block/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: false }),
      });

      if (!response.ok) throw new Error('Failed to unblock student');

      setMessage({
        type: 'success',
        text: `✅ ${studentName} has been unblocked`,
      });
      
      setTimeout(() => setRefreshTrigger((prev) => prev + 1), 500);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to unblock student',
      });
    } finally {
      setActionLoading(false);
      setTimeout(() => setMessage(null), 2000);
    }
  };

  // Calculate stats
  const stats = {
    total: allRequests.length,
    pending: pendingRequests.length,
    accepted: allRequests.filter((r) => r.status === 'accepted').length,
    denied: allRequests.filter((r) => r.status === 'denied').length,
  };

  return (
    <div className="space-y-8">
      {/* Message Alert */}
      {message && (
        <div
          className={`alert alert-${message.type === 'success' ? 'success' : 'error'} shadow-lg`}
        >
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

      {/* Stats Overview */}
      <div>
        <h2 className="text-2xl font-bold mb-4 text-base-content">Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="stat bg-base-200 border-2 border-purple-500/30 rounded-lg shadow-md">
            <div className="stat-title">Total Requests</div>
            <div className="stat-value text-primary">{stats.total}</div>
          </div>
          <div className="stat bg-base-200 border-2 border-warning/30 rounded-lg shadow-md">
            <div className="stat-title">Pending</div>
            <div className="stat-value text-warning">{stats.pending}</div>
          </div>
          <div className="stat bg-base-200 border-2 border-success/30 rounded-lg shadow-md">
            <div className="stat-title">Approved</div>
            <div className="stat-value text-success">{stats.accepted}</div>
          </div>
          <div className="stat bg-base-200 border-2 border-error/30 rounded-lg shadow-md">
            <div className="stat-title">Denied</div>
            <div className="stat-value text-error">{stats.denied}</div>
          </div>
        </div>
      </div>

      {/* Pending Requests Section */}
      <div>
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-warning/20">
            <svg
              className="h-6 w-6 text-warning"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-base-content">Pending Requests</h2>
            <p className="text-sm text-base-content/60">{pendingRequests.length} pending</p>
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-16">
            <span className="loading loading-spinner loading-lg text-primary"></span>
          </div>
        ) : pendingRequests.length === 0 ? (
          <div className="text-center py-12 bg-base-200/50 rounded-lg">
            <svg
              className="h-16 w-16 mx-auto text-success opacity-50 mb-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <p className="text-base-content/60 font-semibold">No pending requests</p>
            <p className="text-sm text-base-content/40">All requests have been processed</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {pendingRequests.map((request) => (
              <PendingRequestCard
                key={request._id}
                request={request}
                onAccept={handleAccept}
                onDelete={handleDelete}
                onBlock={(studentId, studentName) =>
                  handleBlockClick(studentId, studentName, request.studentEmail)
                }
                loading={actionLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Blocked Students Section */}
      <div>
        <BlockedStudentsSection
          onUnblock={handleUnblock}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Block Student Modal */}
      <BlockStudentModal
        isOpen={blockModal.isOpen}
        studentId={blockModal.studentId}
        studentName={blockModal.studentName}
        studentEmail={blockModal.studentEmail}
        onConfirm={handleBlockConfirm}
        onCancel={() =>
          setBlockModal({
            isOpen: false,
            studentId: null,
            studentName: null,
            studentEmail: null,
          })
        }
        loading={actionLoading}
      />
    </div>
  );
}

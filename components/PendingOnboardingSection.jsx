'use client';

import { useState, useEffect } from 'react';

export default function PendingOnboardingSection() {
  const [pendingStudents, setPendingStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    fetchPendingStudents();
    // Refresh every 5 seconds
    const interval = setInterval(fetchPendingStudents, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchPendingStudents = async () => {
    try {
      const response = await fetch('/api/onboarding');
      const data = await response.json();
      setPendingStudents(data.students || []);
    } catch (error) {
      console.error('Error fetching pending students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (uid, studentName) => {
    setActionLoading(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action: 'approve' }),
      });

      if (!response.ok) throw new Error('Failed to approve student');

      setMessage({
        type: 'success',
        text: `✓ ${studentName} approved! They can now request meals.`,
      });

      setTimeout(() => {
        fetchPendingStudents();
        setMessage(null);
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to approve student',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (uid, studentName) => {
    if (!confirm(`Are you sure you want to reject ${studentName}? They will need to sign up again.`)) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch('/api/onboarding', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, action: 'reject' }),
      });

      if (!response.ok) throw new Error('Failed to reject student');

      setMessage({
        type: 'success',
        text: `✓ ${studentName} rejected. They will need to sign up again.`,
      });

      setTimeout(() => {
        fetchPendingStudents();
        setMessage(null);
      }, 1000);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to reject student',
      });
      setTimeout(() => setMessage(null), 3000);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card bg-base-200 border border-warning/20 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-warning">📋 Pending Student Approvals</h2>
          <div className="flex justify-center py-8">
            <span className="loading loading-spinner loading-lg text-warning"></span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-base-200 border border-warning/20 shadow-xl">
      <div className="card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="card-title text-warning">📋 Pending Student Approvals</h2>
          <div className="badge badge-warning gap-2">{pendingStudents.length} Pending</div>
        </div>

        {message && (
          <div className={`alert alert-${message.type === 'success' ? 'success' : 'error'} mb-4`}>
            <span>{message.text}</span>
          </div>
        )}

        {pendingStudents.length === 0 ? (
          <p className="text-base-content/70 text-center py-8">
            ✓ All students have been approved! No pending requests.
          </p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {pendingStudents.map((student) => (
              <div
                key={student.uid}
                className="bg-base-100 border border-warning/20 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition"
              >
                <div className="flex-1">
                  <p className="font-semibold text-base-content">
                    {student.displayName || student.email}
                  </p>
                  <p className="text-sm text-base-content/70">{student.email}</p>
                  <p className="text-xs text-base-content/50 mt-1">
                    Signed up: {new Date(student.createdAt).toLocaleDateString()} at{' '}
                    {new Date(student.createdAt).toLocaleTimeString()}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(student.uid, student.displayName || student.email)}
                    disabled={actionLoading}
                    className="btn btn-sm btn-success gap-1"
                  >
                    {actionLoading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Approve
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleReject(student.uid, student.displayName || student.email)}
                    disabled={actionLoading}
                    className="btn btn-sm btn-error gap-1"
                  >
                    {actionLoading ? (
                      <>
                        <span className="loading loading-spinner loading-xs"></span>
                      </>
                    ) : (
                      <>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Reject
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

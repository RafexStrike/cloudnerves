'use client';

import { useState, useEffect } from 'react';

/**
 * BlockedStudentsSection Component
 * 
 * Displays all blocked students in a list format with:
 * - Student name and email
 * - Block date
 * - Unblock button for each student
 * 
 * Props:
 *   - onUnblock: Callback when unblock button clicked
 *   - refreshTrigger: External trigger to refresh the list
 */
export default function BlockedStudentsSection({ onUnblock, refreshTrigger }) {
  const [blockedStudents, setBlockedStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all blocked students
  const fetchBlockedStudents = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/meal-requests?isBlocked=true');
      if (!response.ok) throw new Error('Failed to fetch blocked students');
      
      const data = await response.json();
      
      // Get unique blocked students
      const uniqueStudents = {};
      if (data.requests && Array.isArray(data.requests)) {
        data.requests.forEach((request) => {
          if (request.isBlocked && !uniqueStudents[request.studentId]) {
            uniqueStudents[request.studentId] = {
              studentId: request.studentId,
              studentName: request.studentName,
              studentEmail: request.studentEmail,
              blockedAt: request.updatedAt,
              requestCount: 1,
            };
          } else if (request.isBlocked) {
            uniqueStudents[request.studentId].requestCount += 1;
          }
        });
      }
      
      setBlockedStudents(Object.values(uniqueStudents));
    } catch (err) {
      setError(err.message);
      console.error('Error fetching blocked students:', err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount and when refresh trigger changes
  useEffect(() => {
    fetchBlockedStudents();
  }, [refreshTrigger]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      {/* Section Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-error/20">
          <svg
            className="h-6 w-6 text-error"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M13.477 14.89A6 6 0 15.838 6.162M9.239 5.324a2 2 0 114-1.999 2 2 0 01-4 2z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-xl font-bold text-base-content">Blocked Students</h3>
          <p className="text-sm text-base-content/60">
            {blockedStudents.length} student{blockedStudents.length !== 1 ? 's' : ''} currently blocked
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="alert alert-error shadow-md">
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
              d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m9-11a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center py-8">
          <span className="loading loading-spinner loading-lg text-warning"></span>
        </div>
      )}

      {/* Empty State */}
      {!loading && blockedStudents.length === 0 && !error && (
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
          <p className="text-base-content/60 font-semibold">No blocked students</p>
          <p className="text-sm text-base-content/40">All students are in good standing</p>
        </div>
      )}

      {/* Blocked Students List */}
      {!loading && blockedStudents.length > 0 && (
        <div className="space-y-3">
          {blockedStudents.map((student) => (
            <div
              key={student.studentId}
              className="card bg-base-100 border-2 border-error/30 shadow-md hover:shadow-lg transition-all"
            >
              <div className="card-body p-4">
                <div className="flex items-center justify-between gap-4">
                  {/* Student Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-base-content truncate">
                      {student.studentName}
                    </h4>
                    <p className="text-sm text-info truncate">{student.studentEmail}</p>
                    <div className="flex gap-2 mt-2 text-xs text-base-content/60">
                      <span className="badge badge-sm">
                        {student.requestCount} request{student.requestCount !== 1 ? 's' : ''}
                      </span>
                      <span className="badge badge-sm badge-error">
                        Blocked since: {formatDate(student.blockedAt)}
                      </span>
                    </div>
                  </div>

                  {/* Unblock Button */}
                  <button
                    onClick={() => onUnblock(student.studentId, student.studentName)}
                    className="btn btn-sm btn-success gap-2 whitespace-nowrap"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M13 7H7v6h6V7z" />
                      <path
                        fillRule="evenodd"
                        d="M7 2a1 1 0 012 0v1h2V2a1 1 0 112 0v1h2V2a1 1 0 112 0v1a2 2 0 012 2v2h1a1 1 0 110 2h-1v2h1a1 1 0 110 2h-1v2a2 2 0 01-2 2v1a1 1 0 11-2 0v-1h-2v1a1 1 0 11-2 0v-1H9a2 2 0 01-2-2v-2H6a1 1 0 110-2h1V9H6a1 1 0 010-2h1V5a2 2 0 012-2V2z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Unblock
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

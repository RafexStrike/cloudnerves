'use client';

import { useState, useEffect } from 'react';

export default function StudentMealRequest({ user }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [requestedToday, setRequestedToday] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
  });

  // Load existing requests for today
  useEffect(() => {
    if (!user?.uid) return;
    fetchTodayRequests();
  }, [user]);

  const fetchTodayRequests = async () => {
    try {
      const response = await fetch(`/api/meal-requests?studentId=${user.uid}&status=pending`);
      const data = await response.json();

      // Check which meals have been requested today
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mealStatus = {
        breakfast: false,
        lunch: false,
        dinner: false,
      };

      data.forEach((req) => {
        if (new Date(req.requestedAt) >= today) {
          mealStatus[req.mealType] = true;
        }
      });

      setRequestedToday(mealStatus);
      setRequests(data);
    } catch (error) {
      console.error('Error fetching requests:', error);
    }
  };

  const handleMealRequest = async (mealType) => {
    if (requestedToday[mealType]) {
      setMessage({
        type: 'error',
        text: `You already have a pending request for ${mealType} today!`,
      });
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/meal-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: user.uid,
          studentName: user.displayName || user.email,
          studentEmail: user.email,
          mealType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        
        // Handle 403 errors (blocked or pending approval)
        if (response.status === 403) {
          throw new Error(error.error || '🚫 You cannot make requests at this time.');
        }
        
        // Handle other errors
        throw new Error(error.error || 'Failed to request meal');
      }

      const newRequest = await response.json();
      setRequests([newRequest, ...requests]);
      setRequestedToday({
        ...requestedToday,
        [mealType]: true,
      });

      setMessage({
        type: 'success',
        text: `🎉 ${mealType.toUpperCase()} request approved! Token: ${newRequest.tokenId}`,
      });
      setTimeout(() => setMessage(null), 5000);

      console.log('✓ Meal request created:', newRequest);
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to request meal',
      });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setLoading(false);
    }
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
              d={
                message.type === 'success'
                  ? 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
                  : 'M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
              }
            />
          </svg>
          <span>{message.text}</span>
        </div>
      )}

      {/* Meal Request Buttons */}
      <div className="card bg-base-200 border border-purple-500/20 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-primary">Request Meal</h2>
          <p className="text-base-content/70 mb-6">Click to request a token for any meal</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Breakfast Button */}
            <button
              onClick={() => handleMealRequest('breakfast')}
              disabled={loading || requestedToday.breakfast}
              className={`btn btn-lg gap-2 ${
                requestedToday.breakfast
                  ? 'btn-disabled btn-ghost'
                  : 'btn-primary hover:shadow-lg'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 3v1m6.364 1.636l-.707-.707M21 12h-1m1.364 6.364l-.707-.707M12 21v-1m-6.364-1.636l.707-.707M3 12h1M3.636 5.636l.707-.707"
                />
              </svg>
              {requestedToday.breakfast ? '✓ Requested' : 'Breakfast'}
            </button>

            {/* Lunch Button */}
            <button
              onClick={() => handleMealRequest('lunch')}
              disabled={loading || requestedToday.lunch}
              className={`btn btn-lg gap-2 ${
                requestedToday.lunch
                  ? 'btn-disabled btn-ghost'
                  : 'btn-info hover:shadow-lg'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {requestedToday.lunch ? '✓ Requested' : 'Lunch'}
            </button>

            {/* Dinner Button */}
            <button
              onClick={() => handleMealRequest('dinner')}
              disabled={loading || requestedToday.dinner}
              className={`btn btn-lg gap-2 ${
                requestedToday.dinner
                  ? 'btn-disabled btn-ghost'
                  : 'btn-warning hover:shadow-lg'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20.354 15.354A9 9 0 00.646 8.646M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-4v8m0 0l3-3m-3 3l-3-3"
                />
              </svg>
              {requestedToday.dinner ? '✓ Requested' : 'Dinner'}
            </button>
          </div>
        </div>
      </div>

      {/* Recent Requests */}
      {requests.length > 0 && (
        <div className="card bg-base-200 border border-purple-500/20 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-primary">Your Requests</h2>
            <div className="divider my-2"></div>

            <div className="space-y-3">
              {requests.map((req) => (
                <div
                  key={req._id}
                  className="p-4 bg-base-100 rounded-lg border border-purple-500/10 flex justify-between items-center"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-base-content capitalize">
                      {req.mealType}
                    </p>
                    <p className="text-sm text-base-content/70">Token: {req.tokenId}</p>
                    <p className="text-xs text-base-content/50">
                      {new Date(req.requestedAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`badge ${
                        req.status === 'pending'
                          ? 'badge-warning'
                          : req.status === 'accepted'
                            ? 'badge-success'
                            : 'badge-error'
                      }`}
                    >
                      {req.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

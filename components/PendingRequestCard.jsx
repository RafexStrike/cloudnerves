'use client';

/**
 * PendingRequestCard Component
 * 
 * Displays a single pending meal request in card format with:
 * - Student email and name
 * - Meal type with icon
 * - Token ID
 * - Request time
 * - Action buttons: OK (accept), Delete, Block Student
 * 
 * Props:
 *   - request: The meal request object
 *   - onAccept: Callback when Accept button clicked
 *   - onDelete: Callback when Delete button clicked
 *   - onBlock: Callback when Block Student button clicked
 *   - loading: Boolean to disable buttons during loading
 */
export default function PendingRequestCard({
  request,
  onAccept,
  onDelete,
  onBlock,
  loading = false,
}) {
  // Get meal icon based on type
  const getMealIcon = (mealType) => {
    switch (mealType?.toLowerCase()) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '🍽️';
      case 'dinner':
        return '🌙';
      default:
        return '🍴';
    }
  };

  // Format time to readable format
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="card bg-linear-to-br from-purple-900/20 to-base-200 border-2 border-purple-500/30 shadow-lg hover:shadow-xl transition-all">
      <div className="card-body">
        {/* Header: Meal Type & Token */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="card-title text-2xl mb-1">
              {getMealIcon(request.mealType)} {request.mealType?.toUpperCase()}
            </h3>
            <p className="text-sm text-primary font-mono font-bold">Token: {request.tokenId}</p>
          </div>
          <span className="badge badge-warning badge-lg">PENDING</span>
        </div>

        {/* Student Information */}
        <div className="divider my-2"></div>
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.94 6.412A2 2 0 016 4h8a2 2 0 012.94 2.412M1 14s0-4 9-4 9 4 9 4M11 10a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <p className="text-sm text-base-content/60">Name</p>
              <p className="font-semibold text-base-content">{request.studentName}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-info" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            <div>
              <p className="text-sm text-base-content/60">Email</p>
              <p className="font-semibold text-info text-sm">{request.studentEmail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-success" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.707-11.414a1 1 0 00-1.414-1.414L9 9.586 7.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm text-base-content/60">Requested</p>
              <p className="font-semibold text-success">{formatTime(request.requestedAt)}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="divider my-2"></div>
        <div className="flex gap-2 flex-wrap">
          {/* Accept Button - Green */}
          <button
            onClick={() => onAccept(request._id)}
            disabled={loading}
            className="btn btn-sm btn-success gap-1 flex-1"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Processing...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                OK
              </>
            )}
          </button>

          {/* Delete Button - Red */}
          <button
            onClick={() => onDelete(request._id)}
            disabled={loading}
            className="btn btn-sm btn-error gap-1 flex-1"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
                Delete
              </>
            )}
          </button>

          {/* Block Student Button - Warning */}
          <button
            onClick={() => onBlock(request.studentId, request.studentName)}
            disabled={loading}
            className="btn btn-sm btn-warning gap-1 flex-1"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.477 14.89A6 6 0 15.838 6.162M9.239 5.324a2 2 0 114-1.999 2 2 0 01-4 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Block
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

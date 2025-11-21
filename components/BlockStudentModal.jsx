'use client';

/**
 * BlockStudentModal Component
 * 
 * Confirmation modal for blocking a student
 * Shows student details and confirms before blocking action
 * 
 * Props:
 *   - isOpen: Boolean to show/hide modal
 *   - studentId: The student's Firebase UID
 *   - studentName: The student's name
 *   - studentEmail: The student's email
 *   - onConfirm: Callback when confirm button clicked
 *   - onCancel: Callback when cancel/close clicked
 *   - loading: Boolean to disable buttons during loading
 */
export default function BlockStudentModal({
  isOpen,
  studentId,
  studentName,
  studentEmail,
  onConfirm,
  onCancel,
  loading = false,
}) {
  const handleConfirm = async () => {
    await onConfirm(studentId);
  };

  if (!isOpen) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-base-300">
          <div className="shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-warning/20">
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
                d="M12 9v2m0 4v2m0 4v2m0-14a9 9 0 110 18 9 9 0 010-18z"
              />
            </svg>
          </div>
          <h3 className="font-bold text-lg">Block Student</h3>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4">
          <p className="text-base-content/80">
            Are you sure you want to <span className="font-bold text-warning">block this student</span>? 
            They will be unable to make new meal requests.
          </p>

          {/* Student Information */}
          <div className="bg-base-200/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-base-content/60 text-sm font-semibold">NAME:</span>
              <span className="text-base-content font-bold">{studentName}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-base-content/60 text-sm font-semibold">EMAIL:</span>
              <span className="text-info text-sm font-mono">{studentEmail}</span>
            </div>
          </div>

          {/* Warning Message */}
          <div className="alert alert-warning shadow-sm">
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
                d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">
              This action will block the student from making any new meal requests.
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="divider my-0"></div>

        {/* Action Buttons */}
        <div className="modal-action">
          <button
            onClick={onCancel}
            disabled={loading}
            className="btn btn-ghost"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="btn btn-warning gap-2"
          >
            {loading ? (
              <>
                <span className="loading loading-spinner loading-sm"></span>
                Blocking...
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M13.477 14.89A6 6 0 15.838 6.162M9.239 5.324a2 2 0 114-1.999 2 2 0 01-4 2z"
                    clipRule="evenodd"
                  />
                </svg>
                Block Student
              </>
            )}
          </button>
        </div>
      </div>

      {/* Backdrop - close on click outside */}
      <form method="dialog" className="modal-backdrop">
        <button onClick={onCancel}>close</button>
      </form>
    </dialog>
  );
}

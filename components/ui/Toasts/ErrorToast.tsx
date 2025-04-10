import React from "react";
import toast from "react-hot-toast";

export interface ErrorToastProps {
  id: string;
  primaryMessage?: string;
  secondaryMessage?: string;
}

const ErrorToast: React.FC<ErrorToastProps> = ({
  primaryMessage,
  secondaryMessage,
  id,
}) => (
  <div
    id="toast-danger"
    className="flex items-center w-full max-w-xs p-4 mb-4 rounded-lg shadow-lg bg-card text-card-foreground dark:bg-red-900 dark:text-red-100"
    role="alert"
    aria-live="assertive"
  >
    <div className="flex items-center justify-center w-8 h-8 text-red-600 dark:text-red-300">
      <svg
        className="w-5 h-5"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M10 .5a9.5 9.5 0 1 0 9.5 9.5A9.51 9.51 0 0 0 10 .5Zm3.707 11.793a1 1 0 1 1-1.414 1.414L10 11.414l-2.293 2.293a1 1 0 0 1-1.414-1.414L8.586 10 6.293 7.707a1 1 0 0 1 1.414-1.414L10 8.586l2.293-2.293a1 1 0 0 1 1.414 1.414L11.414 10l2.293 2.293Z" />
      </svg>
      <span className="sr-only">Error icon</span>
    </div>
    <div className="ml-3 text-sm">
      <p>{primaryMessage}</p>
      {secondaryMessage && (
        <p className="mt-1 text-xs text-muted-foreground dark:text-red-200">
          {secondaryMessage}
        </p>
      )}
    </div>
    <button
      onClick={() => toast.dismiss(id)}
      type="button"
      className="ml-auto p-1.5 rounded-lg bg-transparent text-muted-foreground hover:text-foreground focus:ring-2 focus:ring-ring dark:text-red-300 dark:hover:text-white"
      aria-label="Close"
    >
      <svg
        className="w-4 h-4"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 14 14"
      >
        <path
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
        />
      </svg>
      <span className="sr-only">Close</span>
    </button>
  </div>
);

export default ErrorToast;

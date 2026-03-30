export default function PageSpinner() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="flex flex-col items-center gap-3">
        <svg
          className="h-8 w-8 animate-spin text-[#2F3FBF] dark:text-indigo-400"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-20"
            cx={12}
            cy={12}
            r={10}
            stroke="currentColor"
            strokeWidth={3}
          />
          <path
            className="opacity-90"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v3.5a4.5 4.5 0 00-4.5 4.5H4z"
          />
        </svg>
        <p className="text-sm text-gray-400 dark:text-slate-500">
          Loading...
        </p>
      </div>
    </div>
  );
}

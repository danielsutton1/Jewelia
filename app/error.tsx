"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-4">Something went wrong!</h2>
        <pre className="text-sm sm:text-base text-red-600 mb-6 overflow-x-auto whitespace-pre-wrap break-words">{error.message}</pre>
        <button 
          onClick={() => reset()} 
          className="w-full sm:w-auto min-h-[44px] px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  )
} 
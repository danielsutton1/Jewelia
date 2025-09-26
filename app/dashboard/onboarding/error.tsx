"use client"

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h2 className="text-2xl font-bold mb-4 text-red-600">Something went wrong!</h2>
      <p className="mb-4">{error.message}</p>
      <button
        className="px-4 py-2 bg-emerald-600 text-white rounded"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  )
} 
"use client";

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ViewFilePage() {
  const searchParams = useSearchParams();
  const [fileData, setFileData] = useState<{
    name: string;
    type: string;
    data?: string;
    url?: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const name = searchParams.get('name');
    const type = searchParams.get('type');
    const data = searchParams.get('data');
    const url = searchParams.get('url');

    if (!name || !type) {
      setError('Missing file information');
      setLoading(false);
      return;
    }

    setFileData({
      name: decodeURIComponent(name),
      type: decodeURIComponent(type),
      data: data ? decodeURIComponent(data) : undefined,
      url: url ? decodeURIComponent(url) : undefined
    });
    setLoading(false);
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full border-2 border-gray-300 border-t-emerald-600 h-8 w-8 mx-auto"></div>
          <p className="mt-4 text-emerald-700 font-medium">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error || !fileData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 font-medium">Error: {error || 'File not found'}</p>
        </div>
      </div>
    );
  }

  const isImage = fileData.type.startsWith('image/');
  const isPDF = fileData.type === 'application/pdf';
  const isText = fileData.type.startsWith('text/') || fileData.type === 'application/json';

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{fileData.name}</h1>
              <p className="text-sm text-gray-500">{fileData.type}</p>
            </div>
            <div className="flex gap-2">
              {fileData.url && (
                <a
                  href={fileData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Open Original
                </a>
              )}
              {fileData.data && (
                <a
                  href={fileData.data}
                  download={fileData.name}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Download
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* File Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-sm border">
          {isImage && fileData.data && (
            <div className="p-4">
              <img
                src={fileData.data}
                alt={fileData.name}
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: '80vh' }}
              />
            </div>
          )}
          
          {isImage && fileData.url && (
            <div className="p-4">
              <img
                src={fileData.url}
                alt={fileData.name}
                className="max-w-full h-auto mx-auto"
                style={{ maxHeight: '80vh' }}
              />
            </div>
          )}

          {isPDF && fileData.data && (
            <div className="p-4">
              <iframe
                src={fileData.data}
                className="w-full"
                style={{ height: '80vh' }}
                title={fileData.name}
              />
            </div>
          )}

          {isPDF && fileData.url && (
            <div className="p-4">
              <iframe
                src={fileData.url}
                className="w-full"
                style={{ height: '80vh' }}
                title={fileData.name}
              />
            </div>
          )}

          {isText && fileData.data && (
            <div className="p-4">
              <pre className="bg-gray-50 p-4 rounded-lg overflow-auto max-h-96 text-sm">
                {atob(fileData.data.split(',')[1])}
              </pre>
            </div>
          )}

          {!isImage && !isPDF && !isText && (
            <div className="p-8 text-center">
              <p className="text-gray-500 mb-4">This file type cannot be previewed directly.</p>
              {fileData.data && (
                <a
                  href={fileData.data}
                  download={fileData.name}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                >
                  Download File
                </a>
              )}
              {fileData.url && (
                <a
                  href={fileData.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors ml-2"
                >
                  Open Original
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
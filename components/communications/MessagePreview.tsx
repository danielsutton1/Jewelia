import React from 'react';
import Link from 'next/link';

interface MessagePreviewProps {
  content: string;
  maxLength?: number;
}

export default function MessagePreview({ content, maxLength = 40 }: MessagePreviewProps) {
  // Function to detect URLs in text
  const detectUrls = (text: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.split(urlRegex).map((part, index) => {
      if (part.match(urlRegex)) {
        return (
          <Link 
            key={index} 
            href={part} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:underline"
          >
            {part}
          </Link>
        );
      }
      return part;
    });
  };

  // Function to detect image URLs
  const isImageUrl = (url: string) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url);
  };

  // Function to truncate text while preserving URLs
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    
    const truncated = text.slice(0, maxLength);
    const lastSpace = truncated.lastIndexOf(' ');
    
    return lastSpace > 0 ? truncated.slice(0, lastSpace) + '...' : truncated + '...';
  };

  // Process the content
  const processedContent = () => {
    // Check if content is a URL
    if (content.match(/^https?:\/\/.+/)) {
      if (isImageUrl(content)) {
        return (
          <div className="flex items-center gap-2">
            <img 
              src={content} 
              alt="Preview" 
              className="w-6 h-6 object-cover rounded"
            />
            <span className="text-gray-500 text-xs">[Image]</span>
          </div>
        );
      }
      return (
        <Link 
          href={content} 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          {truncateText(content, maxLength)}
        </Link>
      );
    }

    // Regular text with URLs
    const truncated = truncateText(content, maxLength);
    return <span className="text-gray-700">{detectUrls(truncated)}</span>;
  };

  return (
    <div className="text-xs">
      {processedContent()}
    </div>
  );
} 
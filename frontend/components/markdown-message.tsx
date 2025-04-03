import React from 'react';
import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  className?: string;
}

export const MarkdownMessage: React.FC<MarkdownMessageProps> = ({ 
  content, 
  className = "" 
}) => {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown>
        {content}
      </ReactMarkdown>
    </div>
  );
};
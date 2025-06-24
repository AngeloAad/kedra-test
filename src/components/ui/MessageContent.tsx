import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import { cn } from "@/lib/utils";

interface MessageContentProps {
  content: string;
  isUser?: boolean;
  className?: string;
}

export function MessageContent({
  content,
  isUser = false,
  className,
}: MessageContentProps) {
  if (isUser) {
    // For user messages, just display as plain text with line breaks
    return (
      <div
        className={cn(
          "whitespace-pre-wrap break-words message-content",
          className
        )}
      >
        {content}
      </div>
    );
  }

  // For AI messages, use React Markdown with full formatting
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none break-words message-content",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={{
          // Customize heading styles
          h1: ({ children }) => (
            <h1 className="text-lg font-bold mb-3 text-gray-900 dark:text-gray-100">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-base font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-sm font-medium mb-2 text-gray-900 dark:text-gray-100">
              {children}
            </h3>
          ),

          // Customize paragraph styles
          p: ({ children }) => (
            <p className="mb-2 text-gray-900 dark:text-gray-100 leading-relaxed">
              {children}
            </p>
          ),

          // Customize list styles
          ul: ({ children }) => (
            <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-900 dark:text-gray-100">{children}</li>
          ),

          // Customize code styles
          code: (props) => {
            const { children, className: codeClassName } = props;
            // @ts-expect-error - react-markdown provides inline prop
            const inline = props.inline;
            if (inline) {
              return (
                <code
                  className="bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 px-1 py-0.5 rounded text-xs font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <code
                className={cn(
                  "block bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 p-3 rounded-lg text-xs font-mono overflow-x-auto",
                  codeClassName
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          // Customize pre (code block container) styles
          pre: ({ children }) => (
            <pre className="mb-3 overflow-x-auto rounded-lg bg-gray-100 dark:bg-gray-800">
              {children}
            </pre>
          ),

          // Customize blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 my-2 italic text-gray-700 dark:text-gray-300">
              {children}
            </blockquote>
          ),

          // Customize table styles
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-600">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 px-3 py-2 text-left font-medium text-gray-900 dark:text-gray-100">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-300 dark:border-gray-600 px-3 py-2 text-gray-900 dark:text-gray-100">
              {children}
            </td>
          ),

          // Customize link styles
          a: ({ children, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline"
            >
              {children}
            </a>
          ),

          // Customize strong/bold styles
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900 dark:text-gray-100">
              {children}
            </strong>
          ),

          // Customize emphasis/italic styles
          em: ({ children }) => (
            <em className="italic text-gray-900 dark:text-gray-100">
              {children}
            </em>
          ),

          // Customize horizontal rule styles
          hr: () => (
            <hr className="my-4 border-gray-300 dark:border-gray-600" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

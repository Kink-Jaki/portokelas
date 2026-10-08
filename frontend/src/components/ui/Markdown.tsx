import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

type MarkdownProps = {
  children: string;
  className?: string;
};

/**
 * Render markdown yang sudah disanitasi (rehype-sanitize) sehingga aman dari
 * XSS. Gaya dipaksa monochrome mengikuti tema.
 */
export function Markdown({ children, className }: MarkdownProps) {
  if (!children.trim()) return null;

  return (
    <div className={cn('space-y-4 text-[0.95rem] leading-relaxed text-fg', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeSanitize]}
        components={{
          h1: ({ children: content }) => (
            <h2 className="font-display text-2xl sm:text-3xl">{content}</h2>
          ),
          h2: ({ children: content }) => (
            <h3 className="font-display text-xl sm:text-2xl">{content}</h3>
          ),
          h3: ({ children: content }) => <h4 className="font-display text-lg">{content}</h4>,
          p: ({ children: content }) => <p className="text-muted">{content}</p>,
          a: ({ children: content, href }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:decoration-fg"
            >
              {content}
            </a>
          ),
          ul: ({ children: content }) => (
            <ul className="list-disc space-y-1.5 pl-5 text-muted marker:text-muted">{content}</ul>
          ),
          ol: ({ children: content }) => (
            <ol className="list-decimal space-y-1.5 pl-5 text-muted marker:text-muted">
              {content}
            </ol>
          ),
          li: ({ children: content }) => <li className="pl-1">{content}</li>,
          blockquote: ({ children: content }) => (
            <blockquote className="border-l-2 border-line-strong pl-4 italic text-muted">
              {content}
            </blockquote>
          ),
          code: ({ children: content }) => (
            <code className="rounded-sm bg-subtle px-1.5 py-0.5 font-mono text-[0.8em] text-fg">
              {content}
            </code>
          ),
          pre: ({ children: content }) => (
            <pre className="overflow-x-auto border border-line bg-subtle p-4 font-mono text-[0.8rem] leading-relaxed">
              {content}
            </pre>
          ),
          hr: () => <hr className="border-line" />,
          table: ({ children: content }) => (
            <div className="overflow-x-auto border border-line">
              <table className="w-full border-collapse text-sm">{content}</table>
            </div>
          ),
          th: ({ children: content }) => (
            <th className="border-b border-line bg-subtle px-3 py-2 text-left font-medium">
              {content}
            </th>
          ),
          td: ({ children: content }) => (
            <td className="border-b border-line px-3 py-2 text-muted">{content}</td>
          ),
          img: ({ src, alt }) => (
            <img
              src={typeof src === 'string' ? src : ''}
              alt={alt ?? ''}
              loading="lazy"
              className="w-full border border-line"
            />
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

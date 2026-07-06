import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders a discovered message. Deliberately unlabeled — no "hidden message"
 * or "easter egg" chrome, just a note that fades into view beneath the
 * bitmap as though it had been sitting there all along.
 */
export function HiddenMessage({ message }: { message: string }) {
  return (
    <div className="animate-fade-in mt-6 max-w-2xl">
      <div className="hidden-message-prose text-[15px] leading-relaxed text-slate-200/90">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            a: (props) => <a {...props} target="_blank" rel="noreferrer noopener" />,
          }}
        >
          {message}
        </ReactMarkdown>
      </div>
    </div>
  );
}

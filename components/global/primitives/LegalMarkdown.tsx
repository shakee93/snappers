import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LegalMarkdownProps = {
  content: string;
};

export function LegalMarkdown({ content }: LegalMarkdownProps) {
  return (
    <div className="prose prose-neutral max-w-none leading-8 dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node: _node, ...props }) => (
            <a
              {...props}
              className="text-blue-500 underline"
              target={props.href?.startsWith("http") ? "_blank" : undefined}
              rel={
                props.href?.startsWith("http")
                  ? "noopener noreferrer"
                  : undefined
              }
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

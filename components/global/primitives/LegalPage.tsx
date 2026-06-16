import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LegalPageProps = {
  title: string;
  content: string;
};

// Tailwind prose covers the full GFM subset (headings, nested lists, tables, etc.).
// Link color is overridden below — prose defaults to primary blue, not header-green.
const legalMarkdownClassName =
  "prose prose-neutral max-w-none leading-8 dark:prose-invert";

export function LegalPage({ title, content }: LegalPageProps) {
  return (
    <div className="overflow-hidden relative" data-nc-id="LegalPage">
      <div className="container py-10 lg:py-10">
        <div className="py-8 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 mb-8">
            {title}
          </h1>
          <div className={legalMarkdownClassName}>
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                a: ({ node: _node, ...props }) => (
                  <a
                    {...props}
                    className="font-medium text-header-green underline hover:opacity-80"
                    target={
                      props.href?.startsWith("http") ? "_blank" : undefined
                    }
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
        </div>
      </div>
    </div>
  );
}

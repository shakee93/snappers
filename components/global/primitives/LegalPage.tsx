import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type LegalPageProps = {
  title: string;
  content: string;
};

const legalMarkdownClassName = [
  "text-neutral-800 dark:text-neutral-200",
  "text-base leading-8",
  "[&>p]:mb-5",
  "[&>h2]:text-lg [&>h2]:font-bold [&>h2]:text-neutral-900 [&>h2]:dark:text-neutral-100",
  "[&>h2]:mt-10 [&>h2]:mb-4 [&>h2:first-child]:mt-0",
  "[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-5 [&>ul]:space-y-2",
  "[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-5 [&>ol]:space-y-2",
  "[&_strong]:font-semibold [&_strong]:text-neutral-900 [&_strong]:dark:text-neutral-100",
].join(" ");

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
                    className="text-primary-600 underline hover:text-primary-700 dark:text-primary-400"
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

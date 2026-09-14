import { User } from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import type { ChatMessage } from "@/lib/use-archmind-chat";
import FoxAvatar from "@/components/fox-avatar";

interface Props {
  message: ChatMessage;
}

// Wrap tables so wide ones scroll inside the bubble instead of being clipped.
const mdComponents: Components = {
  table({ node, ...props }) {
    void node;
    return (
      <div className="my-2 max-w-full overflow-x-auto">
        <table {...props} />
      </div>
    );
  },
};

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      {isUser ? (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg shrink-0 bg-clay text-clay-foreground">
          <User className="w-4 h-4" />
        </div>
      ) : (
        <FoxAvatar size={34} className="shrink-0 -mt-0.5" />
      )}

      {/* Bubble */}
      <div
        className={cn(
          "min-w-0 max-w-[82%] rounded-2xl px-4 py-3 text-sm leading-relaxed",
          isUser
            ? "bg-ink text-paper rounded-tr-sm"
            : "bg-card border border-border text-foreground rounded-tl-sm"
        )}
      >
        {isUser ? (
          <div className="space-y-2">
            {message.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={message.image}
                alt="Attached"
                className="max-h-64 w-auto max-w-full rounded-lg border border-paper/20"
              />
            )}
            {message.content && (
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            )}
          </div>
        ) : (
          <div className="chat-md prose prose-sm dark:prose-invert max-w-none prose-p:my-1.5 prose-headings:my-2 prose-headings:font-display prose-ul:my-1.5 prose-li:my-0 prose-table:text-xs prose-strong:text-foreground prose-a:text-clay">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
              {message.content}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
}

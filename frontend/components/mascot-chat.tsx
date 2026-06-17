"use client";

import { FormEvent, KeyboardEvent, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SendHorizonal, X, RotateCcw, Loader2, Maximize2 } from "lucide-react";
import Link from "next/link";
import MessageBubble from "@/components/message-bubble";
import FoxAvatar from "@/components/fox-avatar";
import { useArchmindChat, isOversizedReply } from "@/lib/use-archmind-chat";

const STARTERS = [
  "How should I orient a house on a coastal Accra plot?",
  "Key passive cooling strategies for hot-dry climates?",
  "Explain load paths in a simple RC frame",
];

export default function MascotChat({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { messages, input, setInput, isLoading, sendMessage, clearChat, bottomRef } =
    useArchmindChat();
  const router = useRouter();
  const handledRef = useRef<Set<string>>(new Set());
  const seededRef = useRef(false);

  // When a finished reply is too big for the popup, hand off to the full /chat
  // page (which shares the same conversation via context) so it's readable.
  useEffect(() => {
    if (!open) return;
    if (!seededRef.current) {
      // don't migrate replies that already existed when the popup was opened
      messages.forEach((m) => handledRef.current.add(m.id));
      seededRef.current = true;
      return;
    }
    if (isLoading) return;
    const last = messages[messages.length - 1];
    if (
      last &&
      last.role === "assistant" &&
      !handledRef.current.has(last.id) &&
      isOversizedReply(last.content)
    ) {
      handledRef.current.add(last.id);
      onClose();
      router.push("/chat");
    }
  }, [messages, isLoading, open, onClose, router]);

  if (!open) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }

  return (
    <div className="animate-pop flex h-[min(70vh,520px)] w-[min(88vw,370px)] flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 border-b border-border bg-paper/90 px-4 py-3 backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <FoxAvatar />
          <div>
            <p className="font-display text-base leading-none tracking-tight">ArchMind</p>
            <p className="mt-1 flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={clearChat}
            disabled={messages.length === 0}
            aria-label="Clear chat"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Open full chat"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            render={<Link href="/chat" />}
          >
            <Maximize2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Minimize chat"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3.5 py-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center gap-4 px-2 py-6 text-center">
            <FoxAvatar size={56} lively greet />
            <div>
              <p className="font-display text-lg tracking-tight">Hey, I&apos;m ArchMind</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Ask me anything about architecture and the built environment.
              </p>
            </div>
            <div className="mt-1 flex w-full flex-col gap-2">
              {STARTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="rounded-xl border border-border bg-background px-3.5 py-2.5 text-left text-sm transition-colors hover:border-clay/40 hover:bg-muted/50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <MessageBubble key={m.id} message={m} />
            ))}
            {isLoading && messages[messages.length - 1]?.role === "user" && (
              <div className="flex items-center gap-2 pl-1 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-clay" />
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2 border-t border-border bg-paper/90 px-3 py-3 backdrop-blur-md"
      >
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask ArchMind…"
          rows={1}
          className="max-h-28 min-h-[42px] flex-1 resize-none rounded-xl bg-background text-sm"
        />
        <Button
          type="submit"
          disabled={isLoading || !input.trim()}
          size="icon"
          className="h-[42px] w-[42px] shrink-0 rounded-xl bg-clay text-clay-foreground hover:brightness-110"
        >
          <SendHorizonal className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}

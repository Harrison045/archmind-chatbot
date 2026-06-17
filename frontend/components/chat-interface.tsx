"use client";

import { FormEvent, KeyboardEvent, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SendHorizonal, RotateCcw, Loader2, ArrowLeft } from "lucide-react";
import MessageBubble from "@/components/message-bubble";
import FoxAvatar from "@/components/fox-avatar";
import Link from "next/link";
import { useArchmindChat } from "@/lib/use-archmind-chat";

export default function ChatInterface() {
  const searchParams = useSearchParams();
  const { messages, input, setInput, isLoading, sendMessage, clearChat, bottomRef } =
    useArchmindChat();

  // Prefill from a /chat?q=… deep link (e.g. portfolio "Try this"), only on a fresh thread.
  useEffect(() => {
    const q = searchParams.get("q");
    if (q && messages.length === 0) setInput(q);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-5 md:px-6 h-16 border-b border-border bg-paper/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            aria-label="Back to site"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <FoxAvatar size={40} />
          <div>
            <h1 className="font-display text-lg leading-none tracking-tight">ArchMind</h1>
            <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground mt-1">
              Your architecture fox
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-clay" />
            OpenRouter
          </span>
          <Separator orientation="vertical" className="h-5" />
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            disabled={messages.length === 0}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear
          </Button>
        </div>
      </header>

      {/* Message list */}
      <ScrollArea className="flex-1">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
          {messages.length === 0 && (
            <div className="relative flex flex-col items-center justify-center gap-5 py-16 text-center">
              <div className="absolute inset-0 bg-grid mask-fade opacity-60 pointer-events-none" />
              {/* warm fox-orange glow behind the hero */}
              <div className="absolute left-1/2 top-10 -translate-x-1/2 h-40 w-40 rounded-full bg-clay/15 blur-3xl pointer-events-none" />
              {/* subtle bushy-tail flourish */}
              <svg
                viewBox="0 0 120 80"
                aria-hidden
                className="absolute right-2 bottom-0 w-28 rotate-[8deg] opacity-[0.12] pointer-events-none"
              >
                <path
                  d="M112,18 C72,8 30,24 16,52 C8,68 22,80 40,75 C27,61 38,38 64,32 C82,28 102,28 112,38 Z"
                  fill="#e88438"
                />
                <path
                  d="M40,75 C24,80 9,65 16,49 C22,62 33,70 45,66 C49,71 47,75 40,75 Z"
                  fill="#5a3216"
                />
              </svg>
              <div className="relative">
                <FoxAvatar size={108} lively greet />
              </div>
              <div className="relative">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-clay mb-3">
                  Hey there
                </p>
                <h2 className="font-display text-3xl tracking-tight mb-2.5">
                  I&apos;m ArchMind — let&apos;s design.
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mx-auto">
                  Ask me about architecture, building design, materials, passive design, codes — or
                  anything in the built environment.
                </p>
              </div>
              <div className="relative grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-3 w-full max-w-xl">
                {STARTERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setInput(s)}
                    className="group text-left text-sm px-4 py-3.5 rounded-xl border border-border bg-card hover:border-clay/40 hover:bg-muted/50 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}

          {isLoading && messages[messages.length - 1]?.role === "user" && (
            <div className="flex items-center gap-2 text-muted-foreground text-sm pl-2">
              <Loader2 className="w-4 h-4 animate-spin text-clay" />
              ArchMind is thinking…
            </div>
          )}

          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      {/* Input area */}
      <div className="border-t border-border bg-paper/90 backdrop-blur-md px-4 py-4 shrink-0">
        <form
          onSubmit={handleSubmit}
          className="max-w-3xl mx-auto flex gap-3 items-end"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about architecture, design, codes, materials…"
            rows={1}
            className="resize-none min-h-[48px] max-h-40 overflow-y-auto flex-1 text-sm rounded-xl bg-card"
          />
          <Button
            type="submit"
            disabled={isLoading || !input.trim()}
            size="icon"
            className="h-12 w-12 shrink-0 rounded-xl bg-clay text-clay-foreground hover:brightness-110"
          >
            <SendHorizonal className="w-4 h-4" />
          </Button>
        </form>
        <p className="text-center text-[11px] text-muted-foreground mt-2.5">
          ArchMind informs professional judgment — it does not replace a licensed architect&apos;s
          stamped work.
        </p>
      </div>
    </div>
  );
}

const STARTERS = [
  "How should I orient a house on a coastal Accra plot?",
  "What are the key passive cooling strategies for hot-dry climates?",
  "Explain load paths in a simple RC frame building",
  "What is the typical daylight factor for habitable rooms?",
];

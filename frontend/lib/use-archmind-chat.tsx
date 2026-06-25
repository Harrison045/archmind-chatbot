"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  /** Data URL of an attached image (user messages only). */
  image?: string;
}

export interface ChatApi {
  messages: ChatMessage[];
  input: string;
  setInput: (v: string) => void;
  isLoading: boolean;
  sendMessage: (text: string, image?: string) => Promise<void>;
  clearChat: () => void;
  bottomRef: React.RefObject<HTMLDivElement | null>;
}

/** Default ask when the user attaches an image without typing anything. */
const IMAGE_PROMPT =
  "What is this? Tell me what it is, whether it belongs indoors or outdoors, " +
  "its likely style and materials, where it fits, and a few similar pieces.";

/** Single source of truth for the conversation, shared by the popup and /chat. */
function useChatState(): ChatApi {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage(text: string, image?: string) {
    const trimmed = text.trim();
    if ((!trimmed && !image) || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed || (image ? IMAGE_PROMPT : ""),
      image,
    };

    const history = [...messages, userMessage];
    setMessages(history);
    setInput("");
    setIsLoading(true);

    const assistantId = crypto.randomUUID();
    setMessages((prev) => [...prev, { id: assistantId, role: "assistant", content: "" }]);

    abortRef.current = new AbortController();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          // Multimodal format for messages with an image, plain string otherwise.
          messages: history.map((m) => ({
            role: m.role,
            content: m.image
              ? [
                  { type: "text", text: m.content },
                  { type: "image_url", image_url: { url: m.image } },
                ]
              : m.content,
          })),
        }),
        signal: abortRef.current.signal,
      });

      if (!res.ok) throw new Error(`API error: ${res.status}`);
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((m) => (m.id === assistantId ? { ...m, content: m.content + chunk } : m))
        );
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: "Something went wrong. Please try again." }
            : m
        )
      );
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }

  function clearChat() {
    abortRef.current?.abort();
    setMessages([]);
    setInput("");
    setIsLoading(false);
  }

  return { messages, input, setInput, isLoading, sendMessage, clearChat, bottomRef };
}

const ChatContext = createContext<ChatApi | null>(null);

export function ArchmindChatProvider({ children }: { children: React.ReactNode }) {
  const chat = useChatState();
  return <ChatContext.Provider value={chat}>{children}</ChatContext.Provider>;
}

export function useArchmindChat(): ChatApi {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useArchmindChat must be used within <ArchmindChatProvider>");
  return ctx;
}

/** True when a reply is too large to read comfortably in the small popup. */
export function isOversizedReply(text: string): boolean {
  if (text.length > 650) return true;
  // a markdown table: some row with pipes + a |---|:--| separator line
  const lines = text.split("\n");
  const hasSeparator = lines.some(
    (l) => l.includes("|") && /-/.test(l) && /^[\s|:-]+$/.test(l.trim())
  );
  if (hasSeparator) return true;
  // a fenced code block
  if (/```[\s\S]*```/.test(text)) return true;
  return false;
}

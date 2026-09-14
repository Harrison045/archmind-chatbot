"use client";

import { ChangeEvent, useRef, useState } from "react";

/** Read a File as a data URL. */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/**
 * Convert an image File to a data URL, downscaling large images so the base64
 * payload sent to the model stays reasonable (multimodal requests can get huge).
 */
export async function fileToDataUrl(
  file: File,
  maxDim = 1024,
  quality = 0.85
): Promise<string> {
  const original = await readAsDataUrl(file);
  const img = await loadImage(original);
  const longest = Math.max(img.width, img.height);
  const scale = Math.min(1, maxDim / longest);

  // Already small enough — keep the original (preserves PNG transparency etc.).
  if (scale === 1) return original;

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(img.width * scale);
  canvas.height = Math.round(img.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return original;
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

/** Shared state + handlers for attaching a single image to a chat input. */
export function useImageAttach() {
  const [pending, setPending] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file
    if (!file || !file.type.startsWith("image/")) return;
    setBusy(true);
    try {
      setPending(await fileToDataUrl(file));
    } catch {
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  return {
    pending,
    setPending,
    busy,
    inputRef,
    onFile,
    open: () => inputRef.current?.click(),
    clear: () => setPending(null),
  };
}

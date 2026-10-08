"use client";

import { VoiceWaveform } from "@/components/motion/voice-waveform";
import { useSpeechRecognition } from "@/lib/use-speech-recognition";
import { cn } from "@/lib/utils";
import { ArrowUp, Mic } from "lucide-react";
import { useState } from "react";

interface SuziPromptInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  /** Mobile/touch devices lead with voice; desktop leads with typing. */
  micFirst?: boolean;
  className?: string;
}

/**
 * The Suzi conversation entry point — not a search bar. Supports typing and
 * native browser speech-to-text (no server, no API key), and emphasises
 * whichever mode fits the device: mic-forward on touch, keyboard-forward
 * with a mouse/trackpad.
 */
export function SuziPromptInput({
  value,
  onChange,
  onSubmit,
  disabled,
  placeholder = "Speak naturally, or type your request…",
  micFirst = false,
  className,
}: SuziPromptInputProps) {
  const { supported, listening, start, stop } = useSpeechRecognition();
  const [interim, setInterim] = useState("");

  function handleMicClick() {
    if (listening) {
      stop();
      return;
    }
    setInterim("");
    start((text, isFinal) => {
      if (isFinal) {
        onChange(text);
        setInterim("");
      } else {
        setInterim(text);
      }
    });
  }

  const shown = listening && interim ? interim : value;

  // Mic and send are the most-tapped controls on the site: 44px on touch
  // (WCAG 2.2 target size), 36px with a mouse to keep the desktop density.
  const controlSize = micFirst ? "h-11 w-11" : "h-9 w-9 pointer-coarse:h-11 pointer-coarse:w-11";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-border bg-white px-2 transition-shadow duration-300 focus-within:border-brand-500",
        micFirst ? "py-1.5" : "py-2 pointer-coarse:py-1.5",
        listening && "border-brand-400 ring-[3px] ring-brand-500/15",
        className,
      )}
    >
      {supported ? (
        <button
          type="button"
          onClick={handleMicClick}
          aria-label={listening ? "Stop listening" : "Speak to Suzi"}
          aria-pressed={listening}
          className={cn(
            "flex shrink-0 items-center justify-center rounded-lg transition-colors cursor-pointer",
            controlSize,
            listening
              ? "bg-brand-500 text-white"
              : micFirst
                ? "bg-brand-900 text-brand-300 hover:bg-brand-800"
                : "bg-paper-2 text-muted hover:bg-brand-100",
          )}
        >
          {listening ? <VoiceWaveform active /> : <Mic className="h-4 w-4" aria-hidden />}
        </button>
      ) : null}

      <input
        value={shown}
        onChange={(e) => onChange(e.target.value)}
        placeholder={listening ? "Listening…" : placeholder}
        disabled={disabled}
        aria-label="Tell Suzi what you need"
        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-ink placeholder:text-muted-2 disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className={cn(
          "flex shrink-0 items-center justify-center rounded-lg bg-brand-900 text-paper disabled:opacity-40 cursor-pointer",
          controlSize,
        )}
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

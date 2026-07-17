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

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value);
      }}
      className={cn(
        "flex items-center gap-2 rounded-lg border border-line bg-white px-2 py-2 transition-shadow duration-300 focus-within:border-navy-400",
        listening && "border-gold-400 shadow-[0_0_0_3px_rgba(179,148,90,0.14)]",
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
            micFirst ? "h-10 w-10" : "h-9 w-9",
            listening
              ? "bg-gold-500 text-navy-950"
              : micFirst
                ? "bg-navy-950 text-gold-300 hover:bg-navy-800"
                : "bg-parchment text-navy-600 hover:bg-sand",
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
        className="min-w-0 flex-1 bg-transparent px-2 py-1 text-sm text-navy-900 placeholder:text-navy-400 focus:outline-none disabled:opacity-50"
      />

      <button
        type="submit"
        disabled={disabled || !value.trim()}
        aria-label="Send"
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-ivory disabled:opacity-40 cursor-pointer"
      >
        <ArrowUp className="h-4 w-4" aria-hidden />
      </button>
    </form>
  );
}

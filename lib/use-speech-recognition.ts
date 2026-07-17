"use client";

import { useClientSnapshot } from "@/lib/use-client-snapshot";
import { useCallback, useRef, useState } from "react";

interface SpeechRecognitionAlternativeLike {
  transcript: string;
}

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  0: SpeechRecognitionAlternativeLike;
}

interface SpeechRecognitionEventLike extends Event {
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionLike extends EventTarget {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start: () => void;
  stop: () => void;
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function getSpeechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function speechSupported(): boolean {
  return getSpeechRecognitionConstructor() !== null;
}

/**
 * Thin wrapper around the browser's native SpeechRecognition API (Chrome,
 * Edge, Safari) — no server, no API key. Falls back to `supported: false`
 * on browsers without it (e.g. Firefox), so callers can hide the mic
 * affordance rather than offer a broken one.
 */
export function useSpeechRecognition() {
  const supported = useClientSnapshot(speechSupported, false);
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const start = useCallback((onResult: (text: string, isFinal: boolean) => void) => {
    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) return;
    const recognition = new Ctor();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onresult = (event) => {
      let text = "";
      let isFinal = false;
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        text += result[0].transcript;
        if (result.isFinal) isFinal = true;
      }
      onResult(text, isFinal);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    setListening(true);
    recognition.start();
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { supported, listening, start, stop };
}

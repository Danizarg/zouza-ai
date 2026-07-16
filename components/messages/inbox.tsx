"use client";

import { Badge } from "@/components/ui/badge";
import { MOCK_CONVERSATIONS, MOCK_MESSAGES } from "@/lib/mock-data";
import type { Message } from "@/lib/types";
import { cn, daysAgo } from "@/lib/utils";
import { BadgeCheck, Send } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

export function Inbox() {
  const [activeId, setActiveId] = useState(MOCK_CONVERSATIONS[0]?.id);
  const [messagesByConvo, setMessagesByConvo] = useState<Record<string, Message[]>>(() => {
    const map: Record<string, Message[]> = {};
    for (const conv of MOCK_CONVERSATIONS) {
      map[conv.id] = MOCK_MESSAGES.filter((m) => m.conversation_id === conv.id);
    }
    return map;
  });
  const [draft, setDraft] = useState("");

  const active = MOCK_CONVERSATIONS.find((c) => c.id === activeId);
  const activeMessages = active ? messagesByConvo[active.id] ?? [] : [];

  function send() {
    if (!draft.trim() || !active) return;
    const msg: Message = {
      id: `local-${Date.now()}`,
      conversation_id: active.id,
      sender: "me",
      body: draft.trim(),
      created_at: new Date().toISOString(),
    };
    setMessagesByConvo((prev) => ({ ...prev, [active.id]: [...(prev[active.id] ?? []), msg] }));
    setDraft("");
  }

  return (
    <div className="grid h-[calc(100vh-3.5rem)] grid-cols-1 md:grid-cols-[320px_1fr]">
      <div className={cn("overflow-y-auto border-r border-line", active ? "hidden md:block" : "block")}>
        <div className="border-b border-line p-4">
          <h1 className="font-display text-lg font-semibold text-navy-900">Messages</h1>
        </div>
        <ul>
          {MOCK_CONVERSATIONS.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => setActiveId(c.id)}
                className={cn(
                  "flex w-full items-start gap-3 border-b border-line p-4 text-left transition-colors hover:bg-parchment",
                  c.id === activeId && "bg-parchment",
                )}
              >
                <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-sand">
                  <Image src={c.listing_image} alt="" fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-navy-900">{c.counterpart_name}</p>
                    {c.unread > 0 ? (
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-terra-600 text-[10px] font-semibold text-ivory">
                        {c.unread}
                      </span>
                    ) : null}
                  </div>
                  <p className="truncate text-xs text-navy-500">{c.listing_title}</p>
                  {c.prequalified ? (
                    <Badge tone="gold" className="mt-1.5">
                      <BadgeCheck className="h-3 w-3" aria-hidden />
                      Pre-qualified
                    </Badge>
                  ) : null}
                  <p className="mt-1 text-xs text-navy-400">{daysAgo(c.last_message_at)}d ago</p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className={cn("flex flex-col", !active ? "hidden md:flex" : "flex")}>
        {active ? (
          <>
            <div className="flex items-center gap-3 border-b border-line p-4">
              <button
                type="button"
                onClick={() => setActiveId(undefined as unknown as string)}
                className="text-sm font-medium text-terra-600 md:hidden"
              >
                Back
              </button>
              <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl bg-sand">
                <Image src={active.listing_image} alt="" fill className="object-cover" />
              </div>
              <div>
                <p className="text-sm font-semibold text-navy-900">{active.counterpart_name}</p>
                <p className="text-xs text-navy-500">{active.listing_title}</p>
              </div>
              {active.prequalified ? (
                <Badge tone="gold" className="ml-auto">
                  {active.prequalification_note}
                </Badge>
              ) : null}
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {activeMessages.map((m) => (
                <div key={m.id} className={cn("flex", m.sender === "me" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-xl px-4 py-2.5 text-sm leading-relaxed",
                      m.sender === "me"
                        ? "rounded-br-md bg-navy-900 text-ivory"
                        : m.sender === "zouza_ai"
                          ? "rounded-bl-md border border-gold-200 bg-gold-100 text-navy-800"
                          : "rounded-bl-md bg-parchment text-navy-800",
                    )}
                  >
                    {m.sender === "zouza_ai" ? (
                      <p className="mb-1 text-xs font-semibold text-gold-700">Zouza AI pre-check</p>
                    ) : null}
                    {m.body}
                  </div>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-center gap-2 border-t border-line p-4"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a message…"
                aria-label="Message"
                className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-sm focus:border-navy-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Send"
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-950 text-ivory disabled:opacity-40"
              >
                <Send className="h-4 w-4" aria-hidden />
              </button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-navy-400">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}

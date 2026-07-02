"use client";

import { Button } from "@/components/ui/button";
import { Input, Label, Textarea } from "@/components/ui/field";
import type { Listing } from "@/lib/types";
import { CheckCircle2, Mail, MessageSquare } from "lucide-react";
import { useState } from "react";

type Panel = "none" | "message" | "viewing";

export function ContactActions({ listing }: { listing: Listing }) {
  const [panel, setPanel] = useState<Panel>("none");
  const [sentMessage, setSentMessage] = useState(false);
  const [sentViewing, setSentViewing] = useState(false);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Button variant="ink" onClick={() => setPanel(panel === "message" ? "none" : "message")}>
          <Mail className="h-4 w-4" aria-hidden />
          Contact owner
        </Button>
        <Button variant="outline" onClick={() => setPanel(panel === "viewing" ? "none" : "viewing")}>
          <MessageSquare className="h-4 w-4" aria-hidden />
          Request viewing
        </Button>
      </div>

      {panel === "message" ? (
        sentMessage ? (
          <SuccessNote text={`Your message to ${listing.owner_name} has been sent. Aurora will pre-check it and notify you when they reply.`} />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSentMessage(true);
            }}
            className="space-y-3 rounded-xl border border-line bg-parchment p-4"
          >
            <div>
              <Label htmlFor="msg-name">Your name</Label>
              <Input id="msg-name" required />
            </div>
            <div>
              <Label htmlFor="msg-email">Your email</Label>
              <Input id="msg-email" type="email" required />
            </div>
            <div>
              <Label htmlFor="msg-body">Message</Label>
              <Textarea
                id="msg-body"
                required
                defaultValue={`Hi ${listing.owner_name}, I'm interested in "${listing.title}". Is it still available?`}
              />
            </div>
            <Button type="submit" className="w-full">Send message</Button>
          </form>
        )
      ) : null}

      {panel === "viewing" ? (
        sentViewing ? (
          <SuccessNote text="Your viewing request has been sent. The owner usually confirms within a day." />
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSentViewing(true);
            }}
            className="space-y-3 rounded-xl border border-line bg-parchment p-4"
          >
            <div>
              <Label htmlFor="view-date">Preferred date</Label>
              <Input id="view-date" type="date" required />
            </div>
            <div>
              <Label htmlFor="view-note" hint="optional">Note to owner</Label>
              <Textarea id="view-note" placeholder="Morning or afternoon, video call preference, etc." />
            </div>
            <Button type="submit" className="w-full">Request viewing</Button>
          </form>
        )
      ) : null}
    </div>
  );
}

function SuccessNote({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl border border-gold-200 bg-gold-100 p-4 text-sm text-navy-800">
      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-gold-700" aria-hidden />
      {text}
    </div>
  );
}

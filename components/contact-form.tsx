"use client";

import { submitContact } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/field";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

const REASONS = [
  "I want to rent",
  "I want to list a property",
  "I want to sell",
  "I want to buy",
  "Partnership",
  "Support",
];

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    const result = await submitContact({
      reason: String(data.get("reason") ?? ""),
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
    });
    if (result.ok) {
      setStatus("done");
      form.reset();
    } else {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-gold-200 bg-gold-100 p-6">
        <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold-700" aria-hidden />
        <div>
          <p className="font-medium text-navy-900">Message sent</p>
          <p className="mt-1 text-sm text-navy-700">
            Thank you — we typically reply within one business day.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <Label htmlFor="reason">What can we help with?</Label>
        <Select id="reason" name="reason" required defaultValue="">
          <option value="" disabled>Choose a reason</option>
          {REASONS.map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </Select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" required minLength={2} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
      </div>
      <div>
        <Label htmlFor="message">Message</Label>
        <Textarea id="message" name="message" required minLength={10} className="min-h-36" />
      </div>
      {status === "error" ? (
        <p className="text-sm text-terra-700">Something went wrong — please try again.</p>
      ) : null}
      <Button type="submit" disabled={status === "sending"} className="w-full sm:w-auto">
        {status === "sending" ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}

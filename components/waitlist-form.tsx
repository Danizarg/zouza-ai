"use client";

import { joinWaitlist } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/field";
import { CheckCircle2 } from "lucide-react";
import { useState } from "react";

interface WaitlistFormProps {
  /**
   * Preset the interest (e.g. "agent" on /pro). When set, the visitor is
   * not asked to pick one — only the email field and the button remain.
   */
  interest?: string;
}

export function WaitlistForm({ interest }: WaitlistFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    const result = await joinWaitlist(
      String(data.get("email") ?? ""),
      String(data.get("interest") ?? ""),
    );
    setStatus(result.ok ? "done" : "error");
    if (result.ok) form.reset();
  }

  if (status === "done") {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-brand-100 bg-brand-50 px-5 py-4" role="status">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-700" aria-hidden />
        <p className="text-sm text-ink-2">
          {interest
            ? "You are on the list. We will email you before launch."
            : "You are on the list. We will invite you before public launch — owners with photos ready get priority access."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <Input
        type="email"
        name="email"
        required
        placeholder="you@example.com"
        aria-label="Email address"
        className="sm:flex-1"
      />
      {interest ? (
        <input type="hidden" name="interest" value={interest} />
      ) : (
        <Select name="interest" aria-label="What describes you best" className="sm:w-56" defaultValue="owner">
          <option value="owner">I own a property</option>
          <option value="renter">I want to rent</option>
          <option value="buyer">I want to buy</option>
          <option value="agent">I am an agent</option>
          <option value="curious">Just curious</option>
        </Select>
      )}
      <Button type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Joining…" : "Join early access"}
      </Button>
      {status === "error" ? (
        <p className="text-sm text-danger sm:self-center" role="alert">
          Something went wrong — please try again.
        </p>
      ) : null}
    </form>
  );
}

import { SignInToList } from "@/components/wizard/sign-in-to-list";
import { Wizard } from "@/components/wizard/wizard";
import { getViewer } from "@/lib/auth/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "List with Suzi",
  description:
    "Add photos and answer a short chat. Suzi writes your listing and you review every word. Create and preview free; €20/month once published.",
};

export default async function ListWithAiPage() {
  // A listing belongs to its owner, so in Supabase mode the wizard needs an account before it
  // starts (the photos and answers live only in this tab and would be lost by a sign-in detour).
  // Mock mode keeps working with no account at all.
  if (isSupabaseConfigured() && !(await getViewer())) {
    return <SignInToList />;
  }
  return <Wizard />;
}

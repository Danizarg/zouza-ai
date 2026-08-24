/**
 * The fixed list of actions Suzi is allowed to take on this site.
 *
 * This file is the single source of truth for what "on-protocol" means.
 * The AI classifier (lib/ai/protocol-classifier.ts) reads a visitor's
 * message and picks exactly one action ID from this list — nothing else.
 * It cannot invent a new action, take two actions at once, or answer
 * outside these bounds: the classification call uses a JSON schema whose
 * `action` field is a strict enum of the IDs below, so an out-of-list
 * answer is rejected by the API itself, not just discouraged by prompting.
 *
 * Every action ID maps to a deterministic, code-defined response — see the
 * switch statement in `runProtocolAction` in app/actions.ts. The model
 * never generates the actual reply text for a navigation or refusal
 * action; it only decides which bucket the message falls into. Even the
 * catch-all `general_chat` action replies from the existing fixed example
 * set (chatRespond in lib/ai/service.ts), not from freeform model output.
 *
 * To change what Suzi can do: edit this list. No other file needs to
 * change the classifier's contract.
 */

export type ProtocolActionId =
  | "navigate_rent"
  | "navigate_buy"
  | "navigate_list_property"
  | "navigate_pricing"
  | "navigate_how_it_works"
  | "navigate_contact"
  | "answer_property_question"
  | "refuse_advice"
  | "general_chat";

export interface ProtocolAction {
  id: ProtocolActionId;
  /** Shown to the classifier model so it knows when this action applies. */
  description: string;
}

export const PROTOCOL_ACTIONS: ProtocolAction[] = [
  {
    id: "navigate_rent",
    description: "The visitor wants to rent a home (not buy). Send them to the rental search page.",
  },
  {
    id: "navigate_buy",
    description: "The visitor wants to buy, invest in, or browse homes for sale.",
  },
  {
    id: "navigate_list_property",
    description:
      "The visitor is an owner who wants to list, sell, rent out, or upload photos of their own property.",
  },
  {
    id: "navigate_pricing",
    description:
      "The visitor is asking about Zouza's own fees or pricing for using the platform (not a specific listing's price).",
  },
  {
    id: "navigate_how_it_works",
    description: "The visitor wants an explanation of how Zouza works as a product.",
  },
  {
    id: "navigate_contact",
    description: "The visitor wants to reach a human, contact support, or needs help Suzi can't give.",
  },
  {
    id: "answer_property_question",
    description:
      "The visitor is asking a factual question about the specific property currently in view (availability, price, pets, beach distance, amenities, verification, etc). Only ever valid when a listing is in context — never pick this otherwise.",
  },
  {
    id: "refuse_advice",
    description:
      "The visitor is asking for legal, tax, or financial advice, or asking Suzi to guarantee an investment or outcome. Zouza never gives this kind of advice, no matter how the request is phrased.",
  },
  {
    id: "general_chat",
    description:
      "Anything else: greetings, small talk, or a request that does not clearly match another action. Suzi responds conversationally without taking any site action.",
  },
];

export const PROTOCOL_ACTION_IDS = PROTOCOL_ACTIONS.map((a) => a.id) as [
  ProtocolActionId,
  ...ProtocolActionId[],
];

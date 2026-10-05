import type { PropertyType } from "@/lib/types";
import { PROPERTY_TYPES } from "@/lib/types";

// "house" is a substring of "townhouse" and "penthouse", so canonical names are
// matched longest first.
const NAMES_LONGEST_FIRST = [...PROPERTY_TYPES].sort((a, b) => b.length - a.length);

/**
 * Turns a free-text answer ("a flat", "country house", "townhouse") into one of
 * the canonical property types, or null when it can't be told.
 */
export function classifyPropertyType(answer: string): PropertyType | null {
  const a = answer.toLowerCase();

  // Synonyms that contain a canonical name must be resolved first, or the
  // substring match below would read "country house" as a plain "house".
  if (/(country house|farmhouse)/.test(a)) return "finca";

  const named = NAMES_LONGEST_FIRST.find((t) => a.includes(t));
  if (named) return named;

  if (/(flat|piso)/.test(a)) return "apartment";
  if (/(cortijo|masia)/.test(a)) return "finca";
  if (/chalet/.test(a)) return "villa";
  return null;
}

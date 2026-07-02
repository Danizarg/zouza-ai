"use client";

import { Button } from "@/components/ui/button";
import { CheckboxRow, Input, Label, Select, Textarea } from "@/components/ui/field";
import { PROPERTY_TYPES, type ListingFacts } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  townhouse: "Townhouse",
  penthouse: "Penthouse",
  finca: "Finca",
  studio: "Studio",
};

export function StepFacts({
  facts,
  onChange,
  onBack,
  onContinue,
}: {
  facts: ListingFacts;
  onChange: (facts: ListingFacts) => void;
  onBack: () => void;
  onContinue: () => void;
}) {
  function set<K extends keyof ListingFacts>(key: K, value: ListingFacts[K]) {
    onChange({ ...facts, [key]: value });
  }

  const forRent = facts.intent === "rent_out";
  const canContinue = facts.city.trim() && facts.address_area.trim() && facts.size_m2 > 0 && facts.price > 0;

  return (
    <div>
      <h1 className="text-2xl font-semibold text-navy-950 sm:text-3xl">Basic property facts</h1>
      <p className="mt-2 text-navy-600">
        A few simple details — Aurora turns these into a full listing.
      </p>

      <div className="mt-8 space-y-8">
        <div>
          <Label htmlFor="title" hint="optional">Property title</Label>
          <Input
            id="title"
            placeholder="Leave blank and Aurora will write one for you"
            value={facts.title}
            onChange={(e) => set("title", e.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="area">Address / area</Label>
            <Input id="area" required value={facts.address_area} onChange={(e) => set("address_area", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" required value={facts.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <div>
            <Label htmlFor="country">Country</Label>
            <Input id="country" required value={facts.country} onChange={(e) => set("country", e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <Label htmlFor="ptype">Property type</Label>
            <Select id="ptype" value={facts.property_type} onChange={(e) => set("property_type", e.target.value as ListingFacts["property_type"])}>
              {PROPERTY_TYPES.map((t) => (
                <option key={t} value={t}>{TYPE_LABEL[t]}</option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="beds">Bedrooms</Label>
            <Input id="beds" type="number" min={0} value={facts.bedrooms} onChange={(e) => set("bedrooms", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="baths">Bathrooms</Label>
            <Input id="baths" type="number" min={0} value={facts.bathrooms} onChange={(e) => set("bathrooms", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="size">Size (m²)</Label>
            <Input id="size" required type="number" min={0} value={facts.size_m2} onChange={(e) => set("size_m2", Number(e.target.value))} />
          </div>
        </div>

        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-5">
          <CheckboxRow id="pool" label="Pool" checked={facts.pool} onChange={(v) => set("pool", v)} />
          <CheckboxRow id="sea" label="Sea view" checked={facts.sea_view} onChange={(v) => set("sea_view", v)} />
          <CheckboxRow id="garage" label="Garage" checked={facts.garage} onChange={(v) => set("garage", v)} />
          <CheckboxRow id="pets" label="Pets allowed" checked={facts.pets_allowed} onChange={(v) => set("pets_allowed", v)} />
          <CheckboxRow id="furnished" label="Furnished" checked={facts.furnished} onChange={(v) => set("furnished", v)} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="price">{forRent ? "Monthly rent (€)" : "Sale price (€)"}</Label>
            <Input id="price" required type="number" min={0} value={facts.price} onChange={(e) => set("price", Number(e.target.value))} />
          </div>
          <div>
            <Label htmlFor="avail">Availability date</Label>
            <Input id="avail" type="date" value={facts.available_from} onChange={(e) => set("available_from", e.target.value)} />
          </div>
        </div>

        {forRent ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="utilities">Utilities (€/month)</Label>
              <Input id="utilities" type="number" min={0} value={facts.utilities_monthly ?? ""} onChange={(e) => set("utilities_monthly", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="deposit">Deposit (€)</Label>
              <Input id="deposit" type="number" min={0} value={facts.deposit ?? ""} onChange={(e) => set("deposit", e.target.value ? Number(e.target.value) : null)} />
            </div>
            <div>
              <Label htmlFor="fee">Platform fee estimate (%)</Label>
              <Input id="fee" type="number" min={0} max={10} step={0.5} value={facts.platform_fee_percent} onChange={(e) => set("platform_fee_percent", Number(e.target.value))} />
            </div>
          </div>
        ) : null}

        <div>
          <Label htmlFor="rules" hint="optional">Owner rules</Label>
          <Textarea id="rules" placeholder="e.g. No smoking indoors, quiet hours after 22:00" value={facts.owner_rules} onChange={(e) => set("owner_rules", e.target.value)} />
        </div>

        <div>
          <Label htmlFor="notes" hint="optional">Anything else Aurora should know</Label>
          <Textarea id="notes" placeholder="Nearby transport, recent renovations, why you love this home..." value={facts.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button disabled={!canContinue} onClick={onContinue}>Generate my listing</Button>
      </div>
    </div>
  );
}

"use client";

import { CheckboxRow, Input, Label, Select } from "@/components/ui/field";
import type { ListingFilters } from "@/lib/listing-filters";
import { PROPERTY_TYPES } from "@/lib/types";

const TYPE_LABEL: Record<string, string> = {
  apartment: "Apartment",
  house: "House",
  villa: "Villa",
  townhouse: "Townhouse",
  penthouse: "Penthouse",
  finca: "Finca",
  studio: "Studio",
};

interface FilterPanelProps {
  mode: "rent" | "buy";
  filters: ListingFilters;
  onChange: (next: ListingFilters) => void;
}

export function FilterPanel({ mode, filters, onChange }: FilterPanelProps) {
  function set<K extends keyof ListingFilters>(key: K, value: ListingFilters[K]) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <div className="space-y-6 rounded-2xl border border-line bg-white p-5">
      <div>
        <Label htmlFor="f-query">Location</Label>
        <Input
          id="f-query"
          placeholder="City, area or country"
          value={filters.query ?? ""}
          onChange={(e) => set("query", e.target.value)}
        />
      </div>

      <div>
        <Label>{mode === "rent" ? "Monthly budget (€)" : "Price range (€)"}</Label>
        <div className="flex gap-2">
          <Input
            type="number"
            min={0}
            placeholder="Min"
            aria-label="Minimum price"
            value={filters.priceMin ?? ""}
            onChange={(e) => set("priceMin", e.target.value ? Number(e.target.value) : undefined)}
          />
          <Input
            type="number"
            min={0}
            placeholder="Max"
            aria-label="Maximum price"
            value={filters.priceMax ?? ""}
            onChange={(e) => set("priceMax", e.target.value ? Number(e.target.value) : undefined)}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="f-beds">Bedrooms</Label>
          <Select
            id="f-beds"
            value={filters.bedrooms ?? 0}
            onChange={(e) => set("bedrooms", Number(e.target.value))}
          >
            <option value={0}>Any</option>
            {[1, 2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="f-baths">Bathrooms</Label>
          <Select
            id="f-baths"
            value={filters.bathrooms ?? 0}
            onChange={(e) => set("bathrooms", Number(e.target.value))}
          >
            <option value={0}>Any</option>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>
                {n}+
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="f-type">Property type</Label>
        <Select
          id="f-type"
          value={filters.propertyType ?? "any"}
          onChange={(e) => set("propertyType", e.target.value as ListingFilters["propertyType"])}
        >
          <option value="any">Any type</option>
          {PROPERTY_TYPES.map((t) => (
            <option key={t} value={t}>
              {TYPE_LABEL[t]}
            </option>
          ))}
        </Select>
      </div>

      {mode === "rent" ? (
        <div>
          <Label htmlFor="f-avail">Availability from</Label>
          <Input
            id="f-avail"
            type="date"
            value={filters.availableFrom ?? ""}
            onChange={(e) => set("availableFrom", e.target.value || undefined)}
          />
        </div>
      ) : null}

      {mode === "rent" ? (
        <div>
          <Label htmlFor="f-term">Stay length</Label>
          <Select
            id="f-term"
            value={filters.term ?? "any"}
            onChange={(e) => set("term", e.target.value as ListingFilters["term"])}
          >
            <option value="any">Any length</option>
            <option value="short_term">Short-term (weeks–3 months)</option>
            <option value="medium_term">Medium-term (3–12 months)</option>
            <option value="long_term">Long-term (12 months+)</option>
          </Select>
        </div>
      ) : null}

      <div className="space-y-2">
        <Label>Features</Label>
        <div className="grid grid-cols-2 gap-2">
          <CheckboxRow
            id="f-pool"
            label="Pool"
            checked={Boolean(filters.pool)}
            onChange={(v) => set("pool", v)}
          />
          <CheckboxRow
            id="f-sea"
            label="Sea view"
            checked={Boolean(filters.seaView)}
            onChange={(v) => set("seaView", v)}
          />
          <CheckboxRow
            id="f-garage"
            label="Garage"
            checked={Boolean(filters.garage)}
            onChange={(v) => set("garage", v)}
          />
          {mode === "rent" ? (
            <>
              <CheckboxRow
                id="f-pets"
                label="Pets allowed"
                checked={Boolean(filters.petsAllowed)}
                onChange={(v) => set("petsAllowed", v)}
              />
              <CheckboxRow
                id="f-furnished"
                label="Furnished"
                checked={Boolean(filters.furnished)}
                onChange={(v) => set("furnished", v)}
              />
            </>
          ) : (
            <>
              <CheckboxRow
                id="f-newbuild"
                label="New build"
                checked={Boolean(filters.newBuild)}
                onChange={(v) => set("newBuild", v)}
              />
              <CheckboxRow
                id="f-direct"
                label="Direct owner"
                checked={Boolean(filters.directOwner)}
                onChange={(v) => set("directOwner", v)}
              />
            </>
          )}
          <CheckboxRow
            id="f-verified"
            label="Verified only"
            checked={Boolean(filters.verifiedOnly)}
            onChange={(v) => set("verifiedOnly", v)}
          />
        </div>
      </div>
    </div>
  );
}

import { describe, expect, it } from "vitest";
import { classifyPropertyType } from "@/lib/property-type";
import { PROPERTY_TYPES } from "@/lib/types";

describe("classifyPropertyType", () => {
  it.each(PROPERTY_TYPES)("accepts the canonical name %s as typed", (type) => {
    expect(classifyPropertyType(type)).toBe(type);
  });

  it("is not fooled by 'house' hiding inside a longer type name", () => {
    expect(classifyPropertyType("townhouse")).toBe("townhouse");
    expect(classifyPropertyType("penthouse")).toBe("penthouse");
    expect(classifyPropertyType("a lovely Townhouse")).toBe("townhouse");
    expect(classifyPropertyType("It's a PENTHOUSE with a terrace")).toBe("penthouse");
  });

  it("still reads a plain house as house", () => {
    expect(classifyPropertyType("house")).toBe("house");
    expect(classifyPropertyType("a detached house")).toBe("house");
  });

  it("maps 'country house' and 'farmhouse' to finca, not house", () => {
    expect(classifyPropertyType("country house")).toBe("finca");
    expect(classifyPropertyType("farmhouse")).toBe("finca");
    expect(classifyPropertyType("An old Farmhouse")).toBe("finca");
  });

  it("maps the other aliases onto the canonical types", () => {
    expect(classifyPropertyType("cortijo")).toBe("finca");
    expect(classifyPropertyType("masia")).toBe("finca");
    expect(classifyPropertyType("chalet")).toBe("villa");
    expect(classifyPropertyType("flat")).toBe("apartment");
    expect(classifyPropertyType("piso")).toBe("apartment");
  });

  it("keeps a named type ahead of a loose synonym", () => {
    expect(classifyPropertyType("studio flat")).toBe("studio");
    expect(classifyPropertyType("penthouse flat")).toBe("penthouse");
  });

  it("returns null when it can't tell", () => {
    expect(classifyPropertyType("")).toBeNull();
    expect(classifyPropertyType("a castle")).toBeNull();
  });
});

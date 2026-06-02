import { describe, expect, it } from "vitest";

import { parseDataset } from "@/lib/schema/infer";

function fieldsOf(input: unknown) {
  const res = parseDataset(JSON.stringify(input), "Data");
  if (!res.ok) throw new Error(res.error);
  return Object.fromEntries(res.source.fields.map((f) => [f.name, f]));
}

describe("parseDataset / inferSchema", () => {
  it("infers a field type per column", () => {
    const fields = fieldsOf([
      { title: "A", price: 10, active: true, day: "2020-01-02", tier: "gold" },
      {
        title: "B",
        price: 20,
        active: false,
        day: "2021-05-06",
        tier: "silver",
      },
      { title: "C", price: 30, active: true, day: "2022-09-10", tier: "gold" },
    ]);

    expect(fields.title.type).toBe("string"); // all distinct → not an enum
    expect(fields.price.type).toBe("number");
    expect(fields.active.type).toBe("boolean");
    expect(fields.day.type).toBe("date");
    expect(fields.tier.type).toBe("enum");
    expect(fields.tier.values).toEqual(["gold", "silver"]);
  });

  it("humanizes field labels", () => {
    const fields = fieldsOf([{ releaseDate: "2020-01-01", first_name: "Ada" }]);
    expect(fields.releaseDate.label).toBe("Release date");
    expect(fields.first_name.label).toBe("First name");
  });

  it("accepts a bare array and marks the source custom", () => {
    const res = parseDataset(JSON.stringify([{ a: 1 }, { a: 2 }]), "Nums");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.source.name).toBe("Nums");
      expect(res.source.custom).toBe(true);
      expect(res.source.rows).toHaveLength(2);
    }
  });

  it("accepts an object with name + rows, name override wins", () => {
    const fromDoc = parseDataset(
      JSON.stringify({ name: "People", rows: [{ n: "x" }] }),
      "",
    );
    expect(fromDoc.ok && fromDoc.source.name).toBe("People");

    const overridden = parseDataset(
      JSON.stringify({ name: "People", rows: [{ n: "x" }] }),
      "Customers",
    );
    expect(overridden.ok && overridden.source.name).toBe("Customers");
  });

  it("coerces nested values to bounded strings", () => {
    const res = parseDataset(JSON.stringify([{ meta: { a: 1 } }]), "x");
    expect(res.ok).toBe(true);
    if (res.ok) {
      expect(res.source.fields[0].type).toBe("string");
      expect(typeof res.source.rows[0].meta).toBe("string");
    }
  });

  it("rejects malformed input", () => {
    expect(parseDataset("{not json", "x").ok).toBe(false);
    expect(parseDataset("[]", "x").ok).toBe(false);
    expect(parseDataset(JSON.stringify([1, 2, 3]), "x").ok).toBe(false);
    expect(parseDataset(JSON.stringify({ rows: "nope" }), "x").ok).toBe(false);
  });
});

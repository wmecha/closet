import { describe, expect, it } from "vitest";
import { isProductAvailable } from "@/lib/store/types";
import { formatKsh } from "@/lib/format";

describe("isProductAvailable (one of one inventory)", () => {
  const now = new Date("2026-06-20T12:00:00Z");

  it("treats an available piece as buyable", () => {
    expect(
      isProductAvailable({ status: "available", reservedUntil: null }, now),
    ).toBe(true);
  });

  it("treats a sold piece as unavailable", () => {
    expect(
      isProductAvailable({ status: "sold", reservedUntil: null }, now),
    ).toBe(false);
  });

  it("treats a hidden piece as unavailable", () => {
    expect(
      isProductAvailable({ status: "hidden", reservedUntil: null }, now),
    ).toBe(false);
  });

  it("blocks a piece reserved within the active window", () => {
    expect(
      isProductAvailable(
        { status: "reserved", reservedUntil: "2026-06-20T12:10:00Z" },
        now,
      ),
    ).toBe(false);
  });

  it("frees a piece whose reservation has lapsed", () => {
    expect(
      isProductAvailable(
        { status: "reserved", reservedUntil: "2026-06-20T11:50:00Z" },
        now,
      ),
    ).toBe(true);
  });

  it("blocks a reserved piece with no expiry recorded", () => {
    expect(
      isProductAvailable({ status: "reserved", reservedUntil: null }, now),
    ).toBe(false);
  });
});

describe("formatKsh", () => {
  it("formats whole shillings with the KSh symbol and thousands separators", () => {
    expect(formatKsh(1500)).toBe("KSh 1,500");
    expect(formatKsh(0)).toBe("KSh 0");
    expect(formatKsh(9500)).toBe("KSh 9,500");
  });

  it("rounds to whole shillings", () => {
    expect(formatKsh(1499.6)).toBe("KSh 1,500");
  });
});

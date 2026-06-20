import crypto from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  fromSubunit,
  isSuccessfulCharge,
  toSubunit,
  verifyWebhookSignature,
} from "@/lib/paystack";

describe("paystack money conversion", () => {
  it("converts whole shillings to the subunit", () => {
    expect(toSubunit(1500)).toBe(150000);
    expect(toSubunit(0)).toBe(0);
  });

  it("converts the subunit back to whole shillings", () => {
    expect(fromSubunit(150000)).toBe(1500);
  });
});

describe("isSuccessfulCharge", () => {
  const expectedKes = 1500;

  it("accepts a matching successful KES charge", () => {
    expect(
      isSuccessfulCharge(
        { status: "success", amount: 150000, currency: "KES" },
        expectedKes,
      ),
    ).toBe(true);
  });

  it("rejects a charge that is not successful", () => {
    expect(
      isSuccessfulCharge(
        { status: "failed", amount: 150000, currency: "KES" },
        expectedKes,
      ),
    ).toBe(false);
  });

  it("rejects an underpaid charge", () => {
    expect(
      isSuccessfulCharge(
        { status: "success", amount: 149900, currency: "KES" },
        expectedKes,
      ),
    ).toBe(false);
  });

  it("rejects a wrong currency", () => {
    expect(
      isSuccessfulCharge(
        { status: "success", amount: 150000, currency: "NGN" },
        expectedKes,
      ),
    ).toBe(false);
  });

  it("accepts an overpayment defensively", () => {
    expect(
      isSuccessfulCharge(
        { status: "success", amount: 160000, currency: "kes" },
        expectedKes,
      ),
    ).toBe(true);
  });

  it("rejects null data", () => {
    expect(isSuccessfulCharge(null, expectedKes)).toBe(false);
  });
});

describe("verifyWebhookSignature", () => {
  const secret = "sk_test_secret";
  const body = JSON.stringify({
    event: "charge.success",
    data: { reference: "X" },
  });

  function sign(payload: string, key: string) {
    return crypto
      .createHmac("sha512", key)
      .update(payload, "utf8")
      .digest("hex");
  }

  it("accepts a correctly signed body", () => {
    expect(verifyWebhookSignature(body, sign(body, secret), secret)).toBe(true);
  });

  it("rejects a tampered body", () => {
    const signature = sign(body, secret);
    expect(verifyWebhookSignature(body + " ", signature, secret)).toBe(false);
  });

  it("rejects a signature made with the wrong key", () => {
    expect(verifyWebhookSignature(body, sign(body, "wrong"), secret)).toBe(
      false,
    );
  });

  it("rejects a missing signature", () => {
    expect(verifyWebhookSignature(body, null, secret)).toBe(false);
  });
});

import type { Metadata } from "next";
import { PolicyPage } from "@/components/shawn/policy-page";

export const metadata: Metadata = { title: "Returns and exchange" };

export default function ReturnsPage() {
  return (
    <PolicyPage
      eyebrow="Care"
      title="Returns and exchange"
      intro="Because every piece is one of one, we want you to feel confident before you buy. Here is how returns and exchanges work."
      updated="20 June 2026"
      sections={[
        {
          heading: "Before you buy",
          paragraphs: [
            "Each product page lists measurements, size, and condition notes. Please review them carefully. If anything is unclear, message us before ordering and we will help you decide.",
          ],
        },
        {
          heading: "Returns",
          paragraphs: [
            "If a piece arrives not as described, contact us within 48 hours of delivery with photos and your order reference. Where a genuine fault or misdescription is confirmed, we will arrange a return and a full refund to your original payment method.",
            "As pieces are one of one, we are not able to offer change of mind returns. We would rather you ask first and buy with confidence.",
          ],
        },
        {
          heading: "Exchanges",
          paragraphs: [
            "Because no two pieces are the same, a like for like exchange is not always possible. Where we can help you find another piece from the current edit, we will gladly do so.",
          ],
        },
        {
          heading: "How to reach us",
          paragraphs: [
            "Start a return or ask a question through the contact page or on WhatsApp. Please have your order reference ready so we can help quickly.",
          ],
        },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { PolicyPage } from "@/components/shawn/policy-page";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Terms"
      title="Terms of service"
      intro="These terms cover how you use the SHAWN Apparel website and buy from our edits. By placing an order you agree to them."
      updated="20 June 2026"
      sections={[
        {
          heading: "One of one pieces",
          paragraphs: [
            "Every item is a single unit. Once a piece is sold it becomes unavailable and cannot be reordered. Descriptions, measurements, and condition notes are provided in good faith to help you choose well.",
          ],
        },
        {
          heading: "Orders and reservation",
          paragraphs: [
            "When you begin checkout, your selected piece is held for a short window while you complete payment. If payment is not completed within that window, the hold is released and the piece returns to the edit.",
            "An order is only confirmed once payment has cleared and we have verified it. We reserve the right to cancel an order and refund you in full if a piece becomes unavailable due to an error.",
          ],
        },
        {
          heading: "Pricing and payment",
          paragraphs: [
            "All prices are shown in Kenyan Shillings and include any applicable taxes unless stated otherwise. Delivery is calculated at checkout. Payments are processed securely by Paystack. We do not store your card details.",
          ],
        },
        {
          heading: "Delivery",
          paragraphs: [
            "We deliver across Kenya. Delivery timelines are estimates and may vary. We will keep you informed and do our best to get your piece to you with care.",
          ],
        },
        {
          heading: "Contact",
          paragraphs: [
            "Questions about these terms? Reach us through the contact page and we will be glad to help.",
          ],
        },
      ]}
    />
  );
}

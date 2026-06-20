import type { Metadata } from "next";
import { PolicyPage } from "@/components/shawn/policy-page";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Privacy"
      title="Privacy policy"
      intro="We keep things simple and respectful. This policy explains what we collect and how we use it."
      updated="20 June 2026"
      sections={[
        {
          heading: "What we collect",
          paragraphs: [
            "When you place an order we collect your name, email, phone number, delivery location, and any delivery notes you choose to share. We collect this only to fulfil your order and to keep you informed about it.",
          ],
        },
        {
          heading: "Payments",
          paragraphs: [
            "Payments are handled by Paystack. Your card or mobile money details are entered with Paystack and are never stored on our servers. We keep a payment reference so we can confirm and support your order.",
          ],
        },
        {
          heading: "How we use your information",
          paragraphs: [
            "We use your details to process orders, arrange delivery, and respond to questions. We do not sell your information. We may contact you about your order or, if you have asked, about new edits.",
          ],
        },
        {
          heading: "Your choices",
          paragraphs: [
            "You can ask us to update or remove your details at any time. Reach us through the contact page and we will take care of it.",
          ],
        },
      ]}
    />
  );
}

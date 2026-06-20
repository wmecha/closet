import { z } from "zod";

/** Customer details collected at checkout. Guest checkout, no account needed. */
export const checkoutCustomerSchema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name.").max(120),
  customerEmail: z
    .string()
    .trim()
    .email("Please enter a valid email so we can send your receipt."),
  customerPhone: z
    .string()
    .trim()
    .min(7, "Please enter a phone number we can reach you on.")
    .max(30),
  deliveryLocation: z
    .string()
    .trim()
    .min(3, "Please tell us where to deliver.")
    .max(240),
  deliveryNotes: z.string().trim().max(500),
});

export const checkoutInputSchema = checkoutCustomerSchema.extend({
  productIds: z
    .array(z.string().min(1))
    .min(1, "Your bag is empty.")
    .max(20, "That is a lot of pieces. Please check out in smaller groups."),
});

export type CheckoutCustomer = z.infer<typeof checkoutCustomerSchema>;
export type CheckoutInput = z.infer<typeof checkoutInputSchema>;

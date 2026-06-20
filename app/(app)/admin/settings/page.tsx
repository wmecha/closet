import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { getStoreSettingsAdmin } from "@/lib/store/admin-queries";
import { AdminNotConfigured } from "../not-configured";
import { updateStoreSettings } from "../actions";

export const metadata = { title: "Store settings" };

export default async function AdminSettingsPage() {
  if (!isSupabaseConfigured()) return <AdminNotConfigured />;
  const settings = await getStoreSettingsAdmin();

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-muted-foreground text-sm">
        Back to admin
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">
        Store settings
      </h1>
      <p className="text-muted-foreground mt-2">
        Delivery fee and support contacts shown across the storefront.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateStoreSettings} className="grid gap-5">
            <div className="grid gap-2">
              <Label htmlFor="delivery_fee">Delivery fee (KSh)</Label>
              <Input
                id="delivery_fee"
                name="delivery_fee"
                type="number"
                min="0"
                defaultValue={settings.deliveryFee}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp_number">WhatsApp number</Label>
              <Input
                id="whatsapp_number"
                name="whatsapp_number"
                defaultValue={settings.whatsappNumber}
                placeholder="254700000000"
              />
              <p className="text-muted-foreground text-xs">
                Use the international format without the plus sign.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="support_email">Support email</Label>
              <Input
                id="support_email"
                name="support_email"
                type="email"
                defaultValue={settings.supportEmail}
                placeholder="hello@shawn.co.ke"
              />
            </div>
            <div>
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

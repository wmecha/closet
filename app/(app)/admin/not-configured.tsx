import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function AdminNotConfigured() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-semibold tracking-tight">Store admin</h1>
      <Alert className="mt-6">
        <AlertTitle>Connect Supabase to manage the store</AlertTitle>
        <AlertDescription>
          The storefront is running in preview mode with sample data. Add
          NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and
          SUPABASE_SERVICE_ROLE_KEY, then run the migrations to enable drops,
          products, orders, and payments.
        </AlertDescription>
      </Alert>
    </div>
  );
}

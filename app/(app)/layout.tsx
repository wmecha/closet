import { AppShell } from "@/components/app-shell";
import { isDemoMode, isSupabaseConfigured } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const localMode = isDemoMode() || !isSupabaseConfigured();
  let userLabel = "Local operator";

  if (!localMode) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    userLabel = String(data?.claims?.email ?? "Signed-in operator");
  }

  return (
    <AppShell userLabel={userLabel} localMode={localMode}>
      {children}
    </AppShell>
  );
}

import { Suspense } from "react";
import { redirect } from "next/navigation";
import { AuthForm } from "@/components/auth-form";
import { isDemoMode, isSupabaseConfigured } from "@/lib/supabase/env";

export default function LoginPage() {
  if (isDemoMode() || !isSupabaseConfigured()) redirect("/planner");

  return (
    <main className="grid min-h-screen place-items-center bg-[radial-gradient(circle_at_top_left,var(--color-accent),transparent_35%)] px-4 py-10">
      <div className="w-full">
        <div className="mx-auto mb-8 max-w-md">
          <p className="text-primary text-sm font-semibold">Cognexa Limited</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            Thrift operations, with the numbers visible.
          </h1>
        </div>
        <Suspense>
          <div className="flex justify-center">
            <AuthForm />
          </div>
        </Suspense>
      </div>
    </main>
  );
}

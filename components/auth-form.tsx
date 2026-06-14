"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Mail, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

export function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const fullName = String(form.get("fullName") ?? "");
    const supabase = createClient();

    const result =
      mode === "signup"
        ? await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          })
        : await supabase.auth.signInWithPassword({ email, password });

    setLoading(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === "signup" && !result.data.session) {
      toast.success("Check your email to confirm your account.");
      return;
    }

    router.replace(searchParams.get("next") || "/planner");
    router.refresh();
  }

  return (
    <Card className="shadow-primary/5 w-full max-w-md shadow-xl">
      <CardHeader>
        <div className="bg-primary text-primary-foreground mb-2 grid size-11 place-items-center rounded-xl">
          <LockKeyhole className="size-5" />
        </div>
        <CardTitle>
          {mode === "login" ? "Welcome back" : "Create your workspace"}
        </CardTitle>
        <CardDescription>
          {mode === "login"
            ? "Sign in to continue planning your next stock buy."
            : "The first account becomes the Owner/Admin of a new business workspace."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={submit}>
          {mode === "signup" ? (
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <div className="relative">
                <UserRound className="text-muted-foreground absolute top-2.5 left-3 size-4" />
                <Input
                  id="fullName"
                  name="fullName"
                  className="pl-9"
                  required
                />
              </div>
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="text-muted-foreground absolute top-2.5 left-3 size-4" />
              <Input
                id="email"
                name="email"
                type="email"
                className="pl-9"
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {mode === "login" ? (
                <Link
                  href="/forgot-password"
                  className="text-primary text-xs hover:underline"
                >
                  Forgot password?
                </Link>
              ) : null}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              minLength={8}
              required
            />
          </div>
          {error ? (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button className="w-full" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : "Create account"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setMode((current) => (current === "login" ? "signup" : "login"));
              setError("");
            }}
          >
            {mode === "login"
              ? "Create a new account"
              : "I already have an account"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

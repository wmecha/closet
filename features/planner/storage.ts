"use client";

import type { PlannerScenario } from "./schema";
import { createClient } from "@/lib/supabase/client";

const LOCAL_STORAGE_KEY = "cognexa-thrift-scenarios-v1";

function hasSupabaseEnvironment() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY &&
    process.env.NEXT_PUBLIC_DEMO_MODE !== "true",
  );
}

function loadLocal(): PlannerScenario[] {
  const value = window.localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!value) return [];
  try {
    return JSON.parse(value) as PlannerScenario[];
  } catch {
    return [];
  }
}

function saveLocal(scenarios: PlannerScenario[]) {
  window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(scenarios));
}

async function getIdentity() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Your session has expired. Please sign in again.");

  const { data: memberships, error } = await supabase
    .from("user_roles")
    .select("business_id")
    .eq("user_id", user.id)
    .limit(1);
  if (error) throw error;
  const businessId = memberships?.[0]?.business_id as string | undefined;
  if (!businessId) throw new Error("No business membership was found.");

  return { supabase, userId: user.id, businessId };
}

export async function loadScenarios(): Promise<PlannerScenario[]> {
  if (!hasSupabaseEnvironment()) return loadLocal();

  const { supabase, businessId } = await getIdentity();
  const { data, error } = await supabase
    .from("stock_scenarios")
    .select("data")
    .eq("business_id", businessId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((row) => row.data as PlannerScenario);
}

export async function saveScenario(
  scenario: PlannerScenario,
): Promise<PlannerScenario[]> {
  const updated = { ...scenario, updatedAt: new Date().toISOString() };

  if (!hasSupabaseEnvironment()) {
    const existing = loadLocal();
    const next = [
      updated,
      ...existing.filter((item) => item.id !== updated.id),
    ];
    saveLocal(next);
    return next;
  }

  const { supabase, userId, businessId } = await getIdentity();
  const { error } = await supabase.from("stock_scenarios").upsert({
    id: updated.id,
    business_id: businessId,
    created_by: userId,
    name: updated.name,
    description: updated.description,
    status: updated.status,
    planning_mode: updated.mode,
    total_capital: updated.totalCapital,
    planned_stock_budget: updated.plannedStockBudget,
    data: updated,
    archived_at:
      updated.status === "archived" ? new Date().toISOString() : null,
  });
  if (error) throw error;
  return loadScenarios();
}

export async function deleteScenario(id: string): Promise<PlannerScenario[]> {
  if (!hasSupabaseEnvironment()) {
    const next = loadLocal().filter((item) => item.id !== id);
    saveLocal(next);
    return next;
  }

  const { supabase } = await getIdentity();
  const { error } = await supabase
    .from("stock_scenarios")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return loadScenarios();
}

export function isLocalPlanningMode() {
  return !hasSupabaseEnvironment();
}

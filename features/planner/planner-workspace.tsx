"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import {
  Archive,
  Check,
  Copy,
  Download,
  FileSpreadsheet,
  MoreHorizontal,
  Plus,
  Printer,
  Save,
  Share2,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { createDefaultScenario } from "./defaults";
import {
  exportBuyingChecklist,
  exportCategoryCsv,
  exportScenarioCsv,
  whatsappSummary,
} from "./exports";
import {
  CapitalSection,
  CategoriesSection,
  ExpensesSection,
  PricingSection,
} from "./planner-sections";
import { ComparisonPanel } from "./comparison-panel";
import { ResultsPanel } from "./results-panel";
import { SensitivityPanel } from "./sensitivity-panel";
import { scenarioSchema, type PlannerScenario } from "./schema";
import {
  deleteScenario,
  isLocalPlanningMode,
  loadScenarios,
  saveScenario,
} from "./storage";
import { calculateScenario } from "@/lib/calculations/scenario";
import { formatKes } from "@/lib/format";

type SaveState = "loading" | "saved" | "saving" | "invalid" | "error";

export function PlannerWorkspace() {
  const form = useForm<PlannerScenario>({
    resolver: zodResolver(scenarioSchema),
    defaultValues: createDefaultScenario(),
    mode: "onChange",
  });
  const [savedScenarios, setSavedScenarios] = useState<PlannerScenario[]>([]);
  const [saveState, setSaveState] = useState<SaveState>("loading");
  const initialized = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scenario = useWatch({ control: form.control }) as PlannerScenario;
  const result = useMemo(() => calculateScenario(scenario), [scenario]);
  const localMode = isLocalPlanningMode();

  useEffect(() => {
    let cancelled = false;
    async function initialize() {
      try {
        let scenarios = await loadScenarios();
        if (!scenarios.length) {
          const first = createDefaultScenario();
          scenarios = await saveScenario(first);
        }
        if (cancelled) return;
        setSavedScenarios(scenarios);
        form.reset(scenarios[0]);
        initialized.current = true;
        setSaveState("saved");
      } catch (error) {
        if (cancelled) return;
        setSaveState("error");
        toast.error(
          error instanceof Error ? error.message : "Could not load scenarios.",
        );
      }
    }
    initialize();
    return () => {
      cancelled = true;
    };
  }, [form]);

  useEffect(() => {
    if (!initialized.current) return;
    if (timer.current) clearTimeout(timer.current);
    setSaveState("saving");
    timer.current = setTimeout(async () => {
      const parsed = scenarioSchema.safeParse(scenario);
      if (!parsed.success) {
        setSaveState("invalid");
        return;
      }
      try {
        const next = await saveScenario(parsed.data);
        setSavedScenarios(next);
        setSaveState("saved");
      } catch (error) {
        setSaveState("error");
        toast.error(
          error instanceof Error ? error.message : "Autosave failed.",
        );
      }
    }, 900);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [scenario]);

  async function handleSave() {
    const parsed = scenarioSchema.safeParse(form.getValues());
    if (!parsed.success) {
      setSaveState("invalid");
      toast.error(
        parsed.error.issues[0]?.message ?? "Check the scenario inputs.",
      );
      return;
    }
    setSaveState("saving");
    try {
      const next = await saveScenario(parsed.data);
      setSavedScenarios(next);
      setSaveState("saved");
      toast.success("Scenario saved.");
    } catch (error) {
      setSaveState("error");
      toast.error(error instanceof Error ? error.message : "Save failed.");
    }
  }

  function openScenario(id: string) {
    const selected = savedScenarios.find((item) => item.id === id);
    if (selected) form.reset(selected);
  }

  async function createScenario() {
    const newScenario = createDefaultScenario({
      name: `New plan ${savedScenarios.length + 1}`,
    });
    const next = await saveScenario(newScenario);
    setSavedScenarios(next);
    form.reset(newScenario);
    toast.success("New scenario created.");
  }

  async function duplicateScenario() {
    const copy = {
      ...form.getValues(),
      id: crypto.randomUUID(),
      name: `${form.getValues("name")} copy`,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      expenses: form.getValues("expenses").map((expense) => ({
        ...expense,
        id: crypto.randomUUID(),
      })),
      categories: form.getValues("categories").map((category) => ({
        ...category,
        id: crypto.randomUUID(),
      })),
    };
    const next = await saveScenario(copy);
    setSavedScenarios(next);
    form.reset(copy);
    toast.success("Scenario duplicated.");
  }

  async function archiveScenario() {
    const archived = { ...form.getValues(), status: "archived" as const };
    const next = await saveScenario(archived);
    setSavedScenarios(next);
    form.reset(archived);
    toast.success("Scenario archived.");
  }

  async function removeScenario() {
    try {
      const currentId = form.getValues("id");
      let next = await deleteScenario(currentId);
      if (!next.length) {
        const replacement = createDefaultScenario();
        next = await saveScenario(replacement);
      }
      setSavedScenarios(next);
      form.reset(next[0]);
      toast.success("Draft scenario deleted.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Only draft scenarios can be deleted.",
      );
    }
  }

  async function copySummary() {
    await navigator.clipboard.writeText(whatsappSummary(scenario, result));
    toast.success("WhatsApp summary copied.");
  }

  const stateLabel = {
    loading: "Loading",
    saving: "Saving draft",
    saved: "Draft saved",
    invalid: "Needs attention",
    error: "Save failed",
  }[saveState];

  return (
    <div className="min-h-screen">
      <div data-print-hidden="true" className="bg-card border-b">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-4 py-5 sm:px-6 xl:flex-row xl:items-center xl:justify-between xl:px-8">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Milestone 1</Badge>
              {localMode ? (
                <Badge variant="outline">Local planning mode</Badge>
              ) : null}
            </div>
            <h1 className="mt-2 text-2xl font-semibold tracking-tight">
              Stock Buy Planner
            </h1>
            <p className="text-muted-foreground text-sm">
              Decide what to buy before cash leaves the business.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Select value={scenario.id} onValueChange={openScenario}>
              <SelectTrigger className="w-[240px]">
                <SelectValue placeholder="Select scenario" />
              </SelectTrigger>
              <SelectContent>
                {savedScenarios.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="text-muted-foreground flex items-center gap-1 text-xs">
              {saveState === "saved" ? (
                <Check className="size-3.5 text-emerald-600" />
              ) : null}
              {stateLabel}
            </div>
            <Button type="button" variant="outline" onClick={createScenario}>
              <Plus /> New
            </Button>
            <Button type="button" onClick={handleSave}>
              <Save /> Save
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="More scenario actions"
                >
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={duplicateScenario}>
                  <Copy /> Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => window.print()}>
                  <Printer /> Print report
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportScenarioCsv(scenario, result)}
                >
                  <Download /> Scenario CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportCategoryCsv(scenario, result)}
                >
                  <FileSpreadsheet /> Category CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => exportBuyingChecklist(scenario, result)}
                >
                  <FileSpreadsheet /> Buying checklist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copySummary}>
                  <Share2 /> Copy WhatsApp summary
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={archiveScenario}>
                  <Archive /> Archive
                </DropdownMenuItem>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(event) => event.preventDefault()}
                      className="text-destructive"
                    >
                      <Trash2 /> Delete draft
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Delete this draft scenario?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This is only allowed for draft scenarios. Approved
                        financial records should be archived.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={removeScenario}>
                        Delete draft
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="hidden print:block">
        <div className="mb-8 border-b pb-4">
          <p className="text-sm font-semibold">Cognexa Thrift Operations</p>
          <h1 className="mt-2 text-3xl font-semibold">{scenario.name}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            {scenario.description}
          </p>
        </div>
        <ResultsPanel result={result} compact />
      </div>

      <div
        data-print-hidden="true"
        className="mx-auto grid max-w-[1600px] gap-6 px-4 py-6 sm:px-6 xl:grid-cols-[minmax(0,1fr)_340px] xl:px-8"
      >
        <Tabs defaultValue="capital" className="min-w-0">
          <TabsList className="bg-card h-auto w-full justify-start overflow-x-auto p-1">
            {[
              ["capital", "Capital"],
              ["expenses", "Expenses"],
              ["categories", "Category allocation"],
              ["pricing", "Pricing"],
              ["results", "Results"],
              ["sensitivity", "Sensitivity"],
              ["comparison", "Comparison"],
            ].map(([value, label]) => (
              <TabsTrigger key={value} value={value} className="shrink-0">
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
          <TabsContent value="capital" className="mt-6">
            <CapitalSection form={form} result={result} />
          </TabsContent>
          <TabsContent value="expenses" className="mt-6">
            <ExpensesSection form={form} result={result} />
          </TabsContent>
          <TabsContent value="categories" className="mt-6">
            <CategoriesSection form={form} result={result} />
          </TabsContent>
          <TabsContent value="pricing" className="mt-6">
            <PricingSection form={form} result={result} />
          </TabsContent>
          <TabsContent value="results" className="mt-6">
            <ResultsPanel result={result} />
          </TabsContent>
          <TabsContent value="sensitivity" className="mt-6">
            <SensitivityPanel scenario={scenario} />
          </TabsContent>
          <TabsContent value="comparison" className="mt-6">
            <ComparisonPanel scenarios={savedScenarios} />
          </TabsContent>
        </Tabs>

        <aside className="hidden xl:block">
          <div className="sticky top-6 space-y-4">
            <div className="bg-card rounded-xl border p-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Live position
              </p>
              <div className="mt-3 flex items-end justify-between">
                <div>
                  <p className="text-muted-foreground text-xs">Cash reserve</p>
                  <p className="font-mono text-lg font-semibold">
                    {formatKes(result.capital.remainingCashReserve)}
                  </p>
                </div>
                <Badge
                  variant={
                    result.capital.overBudget > 0 ? "destructive" : "secondary"
                  }
                >
                  {result.capital.overBudget > 0
                    ? "Over budget"
                    : "Within budget"}
                </Badge>
              </div>
            </div>
            <ResultsPanel result={result} compact />
          </div>
        </aside>
      </div>
    </div>
  );
}

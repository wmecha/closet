"use client";

import { Controller, useFieldArray, type UseFormReturn } from "react-hook-form";
import { CircleHelp, Plus, Trash2 } from "lucide-react";
import type { PlannerScenario } from "./schema";
import type { ScenarioResult } from "@/lib/calculations/scenario";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { blankCategory, blankExpense } from "./defaults";
import { formatKes } from "@/lib/format";

const numberValue = {
  setValueAs: (value: string) => (value === "" ? 0 : Number(value)),
};

function TermHelp({ children }: { children: React.ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger type="button" className="text-muted-foreground">
        <CircleHelp className="size-3.5" />
      </TooltipTrigger>
      <TooltipContent className="max-w-xs">{children}</TooltipContent>
    </Tooltip>
  );
}

function MoneyField({
  id,
  label,
  registration,
  help,
}: {
  id: string;
  label: string;
  registration: ReturnType<UseFormReturn<PlannerScenario>["register"]>;
  help?: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1.5">
        <Label htmlFor={id}>{label}</Label>
        {help ? <TermHelp>{help}</TermHelp> : null}
      </div>
      <div className="relative">
        <span className="text-muted-foreground absolute top-2.5 left-3 text-xs font-medium">
          KES
        </span>
        <Input
          id={id}
          type="number"
          min={0}
          step={1}
          className="pl-12 tabular-nums"
          {...registration}
        />
      </div>
    </div>
  );
}

export function CapitalSection({
  form,
  result,
}: {
  form: UseFormReturn<PlannerScenario>;
  result: ScenarioResult;
}) {
  const { register, control } = form;
  return (
    <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
      <Card>
        <CardHeader>
          <CardTitle>Scenario and capital</CardTitle>
          <CardDescription>
            Set the cash ceiling first. All other planning decisions roll up to
            it.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="scenario-name">Scenario name</Label>
            <Input id="scenario-name" {...register("name")} />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={2} {...register("description")} />
          </div>
          <MoneyField
            id="total-capital"
            label="Available startup capital"
            registration={register("totalCapital", numberValue)}
            help="The maximum cash available for stock, sourcing, preparation and operating costs."
          />
          <MoneyField
            id="stock-budget"
            label="Planned stock budget"
            registration={register("plannedStockBudget", numberValue)}
            help="The amount reserved for purchasing clothing before acquisition costs."
          />
          <div className="space-y-2">
            <Label>Calculation mode</Label>
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="budget">Budget-driven</SelectItem>
                    <SelectItem value="quantity">Quantity-driven</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>Scenario status</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="under_review">Under review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="used_for_buying_trip">
                      Used for buying trip
                    </SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sourcing-date">Planned sourcing date</Label>
            <Input
              id="sourcing-date"
              type="date"
              {...register("plannedSourcingDate")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="launch-date">Planned launch date</Label>
            <Input
              id="launch-date"
              type="date"
              {...register("plannedLaunchDate")}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="notes">Planning notes</Label>
            <Textarea id="notes" rows={3} {...register("notes")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Capital position</CardTitle>
          <CardDescription>Live view of committed cash.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            ["Available capital", result.capital.totalCapital],
            ["Direct stock cost", result.inventory.directStockCost],
            ["All planned expenses", result.capital.totalExpenses],
            ["Planned cash outlay", result.capital.totalPlannedCashOutlay],
            ["Remaining reserve", result.capital.remainingCashReserve],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="flex items-center justify-between border-b pb-3 last:border-0"
            >
              <span className="text-muted-foreground text-sm">{label}</span>
              <span className="font-mono text-sm font-semibold">
                {formatKes(Number(value))}
              </span>
            </div>
          ))}
          {result.capital.overBudget > 0 ? (
            <Alert variant="destructive">
              <AlertTitle>Over budget</AlertTitle>
              <AlertDescription>
                Reduce planned spending by{" "}
                {formatKes(result.capital.overBudget)}.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert>
              <AlertTitle>Within capital limit</AlertTitle>
              <AlertDescription>
                The current plan retains{" "}
                {formatKes(result.capital.remainingCashReserve)} in cash.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function ExpensesSection({
  form,
  result,
}: {
  form: UseFormReturn<PlannerScenario>;
  result: ScenarioResult;
}) {
  const { register, control } = form;
  const { fields, append, remove } = useFieldArray({
    control,
    name: "expenses",
    keyName: "_key",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Startup and sourcing expenses</CardTitle>
          <CardDescription>
            Mark acquisition costs that should be included in landed cost.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(blankExpense())}
        >
          <Plus /> Add expense
        </Button>
      </CardHeader>
      <CardContent>
        <div className="mb-5 grid gap-3 sm:grid-cols-4">
          {[
            ["Total expenses", result.capital.totalExpenses],
            ["Allocated to stock", result.capital.allocatedExpenses],
            ["Operating expenses", result.capital.operatingExpenses],
            [
              "Stock cash remaining",
              Math.max(
                0,
                form.getValues("totalCapital") - result.capital.totalExpenses,
              ),
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="bg-muted/30 rounded-lg border p-3"
            >
              <p className="text-muted-foreground text-xs">{label}</p>
              <p className="mt-1 font-mono text-sm font-semibold">
                {formatKes(Number(value))}
              </p>
            </div>
          ))}
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-56">Expense</TableHead>
                <TableHead className="min-w-36">Category</TableHead>
                <TableHead className="min-w-36">Amount</TableHead>
                <TableHead className="min-w-28">Type</TableHead>
                <TableHead className="min-w-40">Landed cost</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => (
                <TableRow key={field._key}>
                  <TableCell>
                    <Input
                      aria-label={`Expense ${index + 1} name`}
                      {...register(`expenses.${index}.name`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label={`Expense ${index + 1} category`}
                      {...register(`expenses.${index}.category`)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      aria-label={`Expense ${index + 1} amount`}
                      type="number"
                      min={0}
                      className="font-mono"
                      {...register(`expenses.${index}.amount`, numberValue)}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`expenses.${index}.costType`}
                      render={({ field: selectField }) => (
                        <Select
                          value={selectField.value}
                          onValueChange={selectField.onChange}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fixed">Fixed</SelectItem>
                            <SelectItem value="variable">Variable</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Controller
                      control={control}
                      name={`expenses.${index}.allocateToInventory`}
                      render={({ field: checkboxField }) => (
                        <label className="flex items-center gap-2 text-sm">
                          <Checkbox
                            checked={checkboxField.value}
                            onCheckedChange={checkboxField.onChange}
                          />
                          Allocate
                        </label>
                      )}
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      aria-label={`Remove ${field.name}`}
                    >
                      <Trash2 />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function CategoriesSection({
  form,
  result,
}: {
  form: UseFormReturn<PlannerScenario>;
  result: ScenarioResult;
}) {
  const { register, control, watch } = form;
  const mode = watch("mode");
  const { fields, append, remove } = useFieldArray({
    control,
    name: "categories",
    keyName: "_key",
  });

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Category allocation</CardTitle>
          <CardDescription>
            {mode === "budget"
              ? "Enter budget and average buying cost; quantity is calculated down to whole pieces."
              : "Enter quantity and average buying cost; required budget is calculated."}
          </CardDescription>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append(blankCategory())}
        >
          <Plus /> Add category
        </Button>
      </CardHeader>
      <CardContent>
        {result.capital.categoryBudget > result.capital.stockBudget ? (
          <Alert variant="destructive" className="mb-5">
            <AlertTitle>Allocation exceeds stock budget</AlertTitle>
            <AlertDescription>
              Categories exceed the stock budget by{" "}
              {formatKes(
                result.capital.categoryBudget - result.capital.stockBudget,
              )}
              .
            </AlertDescription>
          </Alert>
        ) : null}
        <div className="overflow-x-auto">
          <Table className="min-w-[1720px]">
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-52">Category</TableHead>
                <TableHead className="min-w-32">
                  {mode === "budget" ? "Budget" : "Required budget"}
                </TableHead>
                <TableHead className="min-w-24">Qty</TableHead>
                <TableHead className="min-w-28">Buy min</TableHead>
                <TableHead className="min-w-28">Buy avg</TableHead>
                <TableHead className="min-w-28">Buy max</TableHead>
                <TableHead className="min-w-32">Avg landed</TableHead>
                <TableHead className="min-w-28">Online price</TableHead>
                <TableHead className="min-w-36">
                  Seller minimum return
                </TableHead>
                <TableHead className="min-w-28">Clearance</TableHead>
                <TableHead className="min-w-28">Online %</TableHead>
                <TableHead className="min-w-28">Market %</TableHead>
                <TableHead className="min-w-28">Clearance %</TableHead>
                <TableHead className="min-w-24">Damage %</TableHead>
                <TableHead className="min-w-24">Unsold %</TableHead>
                <TableHead className="w-12">
                  <span className="sr-only">Remove</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, index) => {
                const categoryResult = result.categories[index];
                return (
                  <TableRow key={field._key}>
                    <TableCell>
                      <Input
                        aria-label={`Category ${index + 1} name`}
                        {...register(`categories.${index}.name`)}
                      />
                    </TableCell>
                    <TableCell>
                      {mode === "budget" ? (
                        <Input
                          type="number"
                          min={0}
                          className="font-mono"
                          {...register(
                            `categories.${index}.budget`,
                            numberValue,
                          )}
                        />
                      ) : (
                        <span className="font-mono text-sm font-semibold">
                          {formatKes(categoryResult?.budget ?? 0)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {mode === "quantity" ? (
                        <Input
                          type="number"
                          min={0}
                          className="font-mono"
                          {...register(
                            `categories.${index}.quantity`,
                            numberValue,
                          )}
                        />
                      ) : (
                        <span className="font-mono text-sm font-semibold">
                          {categoryResult?.quantity ?? 0}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="font-mono"
                        aria-label={`Category ${index + 1} minimum buying price`}
                        {...register(
                          `categories.${index}.minBuyingPrice`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="font-mono"
                        aria-label={`Category ${index + 1} average buying price`}
                        {...register(
                          `categories.${index}.averageBuyingPrice`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="font-mono"
                        aria-label={`Category ${index + 1} maximum buying price`}
                        {...register(
                          `categories.${index}.maxBuyingPrice`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatKes(categoryResult?.averageLandedCost ?? 0)}
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="font-mono"
                        aria-label={`Category ${index + 1} online selling price`}
                        {...register(
                          `categories.${index}.onlinePrice`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="font-mono"
                        aria-label={`Category ${index + 1} seller minimum return`}
                        {...register(
                          `categories.${index}.marketPrice`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        className="font-mono"
                        {...register(
                          `categories.${index}.clearancePrice`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...register(
                          `categories.${index}.onlinePercent`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...register(
                          `categories.${index}.marketPercent`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...register(
                          `categories.${index}.clearancePercent`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...register(
                          `categories.${index}.damagedPercent`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        {...register(
                          `categories.${index}.unsoldPercent`,
                          numberValue,
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => remove(index)}
                        aria-label={`Remove ${field.name}`}
                      >
                        <Trash2 />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-wrap gap-5 text-sm">
          <span>
            Allocated:{" "}
            <strong>{formatKes(result.capital.categoryBudget)}</strong>
          </span>
          <span>
            Unallocated:{" "}
            <strong>{formatKes(result.capital.unallocatedStockBudget)}</strong>
          </span>
          <span>
            Planned pieces: <strong>{result.inventory.totalItems}</strong>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function PricingSection({
  form,
  result,
}: {
  form: UseFormReturn<PlannerScenario>;
  result: ScenarioResult;
}) {
  const { register, control } = form;
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pricing and sales assumptions</CardTitle>
          <CardDescription>
            Online prices are controlled by the business. For seller-led market
            sales, enter only the minimum amount the business must receive back
            per item.
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-0">
          <Alert>
            <AlertTitle>Seller minimum-return model</AlertTitle>
            <AlertDescription>
              A seller may charge the customer more than the minimum return and
              keep that difference as their markup. The planner counts only the
              minimum return as business revenue. M-PESA customers use the
              business paybill; cash collected by a seller must be deposited to
              the designated agent and reconciled against the items sold.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardContent className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <Label>Pricing approach</Label>
            <Controller
              control={control}
              name="targetPricingMethod"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="markup">Markup-based</SelectItem>
                    <SelectItem value="margin">Margin-based</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-rate">Target rate (%)</Label>
            <Input
              id="target-rate"
              type="number"
              min={0}
              max={1000}
              {...register("targetRatePercent", numberValue)}
            />
          </div>
          <div className="space-y-2">
            <Label>Price rounding</Label>
            <Controller
              control={control}
              name="priceRounding"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nearest_10">Nearest KES 10</SelectItem>
                    <SelectItem value="nearest_50">Nearest KES 50</SelectItem>
                    <SelectItem value="nearest_100">Nearest KES 100</SelectItem>
                    <SelectItem value="end_49">End in 49</SelectItem>
                    <SelectItem value="end_99">End in 99</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sell-through">Expected sell-through (%)</Label>
            <Input
              id="sell-through"
              type="number"
              min={0}
              max={100}
              {...register("expectedSellThroughPercent", numberValue)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-charge">Online payment charge (%)</Label>
            <Input
              id="payment-charge"
              type="number"
              min={0}
              max={100}
              {...register("paymentChargePercent", numberValue)}
            />
          </div>
          <div className="space-y-2">
            <Label>Additional seller cost (optional)</Label>
            <Controller
              control={control}
              name="sellerCommission.type"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">
                      None - seller keeps markup above minimum
                    </SelectItem>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed_per_item">
                      Fixed per item
                    </SelectItem>
                    <SelectItem value="daily_allowance">
                      Daily allowance
                    </SelectItem>
                    <SelectItem value="after_target">After target</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <MoneyField
            id="commission-amount"
            label="Additional rate / amount"
            registration={register("sellerCommission.amount", numberValue)}
          />
          <MoneyField
            id="commission-target"
            label="Additional-cost target"
            registration={register(
              "sellerCommission.targetAmount",
              numberValue,
            )}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Category pricing guide</CardTitle>
          <CardDescription>
            Recommended prices are derived from average landed cost.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Avg purchase</TableHead>
                <TableHead>Avg landed</TableHead>
                <TableHead>Seller minimum return</TableHead>
                <TableHead>Minimum safe</TableHead>
                <TableHead>Recommended</TableHead>
                <TableHead>Premium</TableHead>
                <TableHead>Online profit</TableHead>
                <TableHead>Online margin</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {result.categories.map((category, index) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">{category.name}</TableCell>
                  <TableCell>
                    {formatKes(
                      form.getValues(`categories.${index}.averageBuyingPrice`),
                    )}
                  </TableCell>
                  <TableCell>{formatKes(category.averageLandedCost)}</TableCell>
                  <TableCell>
                    {formatKes(
                      form.getValues(`categories.${index}.marketPrice`),
                    )}
                  </TableCell>
                  <TableCell>{formatKes(category.minimumSafePrice)}</TableCell>
                  <TableCell className="text-primary font-semibold">
                    {formatKes(category.recommendedPrice)}
                  </TableCell>
                  <TableCell>{formatKes(category.premiumPrice)}</TableCell>
                  <TableCell>
                    {formatKes(category.profitAtOnlinePrice)}
                  </TableCell>
                  <TableCell>{category.marginAtOnlinePrice}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

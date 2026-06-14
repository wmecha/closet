import type { PlannerScenario } from "@/features/planner/schema";
import { calculateScenario } from "./scenario";

export function compareScenarios(scenarios: PlannerScenario[]) {
  const rows = scenarios.slice(0, 4).map((scenario) => ({
    scenario,
    result: calculateScenario(scenario),
  }));

  const highest = (selector: (row: (typeof rows)[number]) => number) =>
    rows.length ? Math.max(...rows.map(selector)) : 0;
  const lowest = (selector: (row: (typeof rows)[number]) => number) =>
    rows.length ? Math.min(...rows.map(selector)) : 0;

  return {
    rows,
    highlights: {
      highestProfit: highest((row) => row.result.profit.netProfit),
      lowestBreakEven: lowest(
        (row) => row.result.profit.breakEvenSellThroughPercent,
      ),
      lowestCapital: lowest((row) => row.scenario.totalCapital),
      highestReturn: highest((row) => row.result.profit.returnOnCapitalPercent),
    },
  };
}

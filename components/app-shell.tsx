"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  ChevronRight,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  LayoutDashboard,
  Menu,
  PackageSearch,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  Tags,
  Truck,
  Users,
  WalletCards,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin", label: "Store Admin", icon: ShoppingBag },
  { href: "/planner", label: "Stock Buy Planner", icon: ClipboardList },
  { href: "/buying-trips", label: "Buying Trips", icon: Truck },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/drops", label: "Drops", icon: Tags },
  { href: "/orders", label: "Orders", icon: ShoppingBag },
  { href: "/payments", label: "Payments", icon: CreditCard },
  { href: "/market-sales", label: "Market Sales", icon: Store },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/expenses", label: "Expenses", icon: ReceiptText },
  { href: "/reports", label: "Reports", icon: BarChart3 },
  { href: "/team", label: "Team", icon: PackageSearch },
  { href: "/settings", label: "Settings", icon: Settings },
];

function Navigation({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();

  return (
    <nav className="space-y-1 px-3">
      {navigation.map((item) => {
        const active = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
              active
                ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/70 hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-4" />
            <span className="flex-1">{item.label}</span>
            {active ? <ChevronRight className="size-3.5" /> : null}
          </Link>
        );
      })}
    </nav>
  );
}

export function AppShell({
  children,
  userLabel,
  localMode,
}: {
  children: React.ReactNode;
  userLabel: string;
  localMode: boolean;
}) {
  return (
    <div className="bg-background min-h-screen">
      <aside
        data-print-hidden="true"
        className="bg-sidebar text-sidebar-foreground fixed inset-y-0 left-0 z-30 hidden w-64 flex-col lg:flex"
      >
        <div className="flex h-20 items-center gap-3 px-6">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground grid size-10 place-items-center rounded-xl">
            <WalletCards className="size-5" />
          </div>
          <div>
            <p className="text-sm font-semibold">Cognexa Thrift</p>
            <p className="text-sidebar-foreground/55 text-xs">Operations</p>
          </div>
        </div>
        <Navigation />
        <div className="border-sidebar-border mt-auto border-t p-4">
          <div className="bg-sidebar-accent/60 rounded-lg p-3">
            <p className="truncate text-xs font-medium">{userLabel}</p>
            <p className="text-sidebar-foreground/55 mt-1 text-[11px]">
              {localMode ? "Local planning mode" : "Secure workspace"}
            </p>
          </div>
        </div>
      </aside>

      <div data-print-main="true" className="lg:pl-64">
        <header
          data-print-hidden="true"
          className="bg-background/90 sticky top-0 z-20 flex h-16 items-center border-b px-4 backdrop-blur lg:hidden"
        >
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open navigation"
              >
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              className="bg-sidebar text-sidebar-foreground w-72 p-0"
            >
              <SheetTitle className="sr-only">
                Application navigation
              </SheetTitle>
              <div className="flex h-20 items-center gap-3 px-6">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground grid size-10 place-items-center rounded-xl">
                  <CircleDollarSign className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Cognexa Thrift</p>
                  <p className="text-sidebar-foreground/55 text-xs">
                    Operations
                  </p>
                </div>
              </div>
              <Navigation />
            </SheetContent>
          </Sheet>
          <p className="ml-3 text-sm font-semibold">
            Cognexa Thrift Operations
          </p>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}

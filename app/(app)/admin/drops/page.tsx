import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { listDrops } from "@/lib/store/admin-queries";
import { AdminNotConfigured } from "../not-configured";
import { createDrop, updateDropStatus } from "../actions";

export const metadata = { title: "Drops" };

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  draft: "secondary",
  archived: "outline",
};

export default async function AdminDropsPage() {
  if (!isSupabaseConfigured()) return <AdminNotConfigured />;
  const drops = await listDrops();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-muted-foreground text-sm">
        Back to admin
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Drops</h1>
      <p className="text-muted-foreground mt-2">
        A new drop arrives roughly every two weeks. Only one active drop shows
        on the storefront at a time.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">New drop</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDrop} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="The Second Edit"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input id="slug" name="slug" placeholder="the-second-edit" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="description">Story</Label>
              <Textarea
                id="description"
                name="description"
                rows={2}
                placeholder="A short edit of considered pieces."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="launch_date">Launch date (optional)</Label>
              <Input id="launch_date" name="launch_date" type="date" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                defaultValue="draft"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Create drop</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {drops.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  No drops yet. Create your first edit above.
                </TableCell>
              </TableRow>
            ) : (
              drops.map((drop) => (
                <TableRow key={drop.id}>
                  <TableCell className="font-medium">{drop.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {drop.slug}
                  </TableCell>
                  <TableCell>
                    <Badge variant={statusVariant[drop.status] ?? "secondary"}>
                      {drop.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {drop.status !== "active" ? (
                        <form action={updateDropStatus}>
                          <input type="hidden" name="id" value={drop.id} />
                          <input type="hidden" name="status" value="active" />
                          <Button type="submit" size="sm" variant="outline">
                            Activate
                          </Button>
                        </form>
                      ) : null}
                      {drop.status !== "archived" ? (
                        <form action={updateDropStatus}>
                          <input type="hidden" name="id" value={drop.id} />
                          <input type="hidden" name="status" value="archived" />
                          <Button type="submit" size="sm" variant="ghost">
                            Archive
                          </Button>
                        </form>
                      ) : null}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

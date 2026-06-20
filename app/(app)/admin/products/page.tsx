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
import { listDrops, listProducts } from "@/lib/store/admin-queries";
import { formatKsh } from "@/lib/format";
import { AdminNotConfigured } from "../not-configured";
import { createProduct, updateProductStatus } from "../actions";

export const metadata = { title: "Products" };

const statusVariant: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  available: "default",
  reserved: "secondary",
  sold: "outline",
  hidden: "destructive",
};

export default async function AdminProductsPage() {
  if (!isSupabaseConfigured()) return <AdminNotConfigured />;
  const [drops, products] = await Promise.all([listDrops(), listProducts()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="text-muted-foreground text-sm">
        Back to admin
      </Link>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight">Products</h1>
      <p className="text-muted-foreground mt-2">
        Each piece is one of one. Quantity is always a single unit.
      </p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">New piece</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createProduct} className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                required
                placeholder="Ivory Silk Blouse"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="price">Price (KSh)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min="0"
                required
                placeholder="3800"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="drop_id">Drop</Label>
              <select
                id="drop_id"
                name="drop_id"
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                defaultValue={
                  drops.find((d) => d.status === "active")?.id ?? ""
                }
              >
                <option value="">No drop</option>
                {drops.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.title} ({d.status})
                  </option>
                ))}
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                name="status"
                className="border-input bg-background h-9 rounded-md border px-3 text-sm"
                defaultValue="available"
              >
                <option value="available">Available</option>
                <option value="hidden">Hidden</option>
                <option value="sold">Sold</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="size">Size</Label>
              <Input id="size" name="size" placeholder="M" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" placeholder="Tops" />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="condition">Condition</Label>
              <Input
                id="condition"
                name="condition"
                placeholder="Excellent, gently worn"
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" rows={2} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="image_color">Tonal placeholder colour</Label>
              <Input
                id="image_color"
                name="image_color"
                placeholder="#E2D3BC"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="images">Image URLs (one per line)</Label>
              <Textarea
                id="images"
                name="images"
                rows={2}
                placeholder="https://..."
              />
            </div>
            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="measurements">
                Measurements (one per line, Label: value)
              </Label>
              <Textarea
                id="measurements"
                name="measurements"
                rows={3}
                placeholder={"Chest: 96 cm\nLength: 62 cm"}
              />
            </div>
            <div className="sm:col-span-2">
              <Button type="submit">Add piece</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-8 rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Piece</TableHead>
              <TableHead>Drop</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-muted-foreground">
                  No pieces yet. Add your first above.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{product.title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {product.dropTitle ?? "Unassigned"}
                  </TableCell>
                  <TableCell>{formatKsh(product.price)}</TableCell>
                  <TableCell>
                    <Badge
                      variant={statusVariant[product.status] ?? "secondary"}
                    >
                      {product.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {product.status !== "sold" ? (
                        <StatusButton
                          id={product.id}
                          status="sold"
                          label="Mark sold"
                        />
                      ) : null}
                      {product.status !== "available" ? (
                        <StatusButton
                          id={product.id}
                          status="available"
                          label="Make available"
                          variant="outline"
                        />
                      ) : null}
                      {product.status !== "hidden" ? (
                        <StatusButton
                          id={product.id}
                          status="hidden"
                          label="Hide"
                          variant="ghost"
                        />
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

function StatusButton({
  id,
  status,
  label,
  variant = "outline",
}: {
  id: string;
  status: string;
  label: string;
  variant?: "outline" | "ghost" | "default";
}) {
  return (
    <form action={updateProductStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}

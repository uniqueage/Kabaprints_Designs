import { ArrowUpRight, Package, FileText, ShoppingBag, Users } from "@/lib/icons";
import Link from "next/link";
import { adminListOrders } from "@/app/lib/orders.server";
import { adminListUploads } from "@/app/lib/uploads.server";
import { listServices, listProductsForService } from "@/lib/supabase/admin";
import type { Order, OrderStatus } from "@/supabase/lib/types";

export const metadata = { title: "Dashboard · Admin" };

const STATUS_LABEL: Record<OrderStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  reviewing: "Reviewing",
  quoted: "Quoted",
  approved: "Approved",
  in_production: "In Production",
  ready: "Ready",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default async function AdminDashboardPage() {
  const [orders, uploads, services] = await Promise.all([
    adminListOrders(100),
    adminListUploads(200),
    listServices(),
  ]);

  const productsTotal = await Promise.allSettled(
    services.map(async (s) => {
      const prods = await listProductsForService(s.id);
      return prods.length;
    }),
  );
  const productCount = productsTotal.reduce((acc, r) => acc + (r.status === "fulfilled" ? r.value : 0), 0);

  const recentOrders = orders.slice(0, 8);
  const statusCounts = (() => {
    const m: Record<string, number> = {};
    for (const o of orders) {
      m[o.status] = (m[o.status] ?? 0) + 1;
    }
    return m;
  })();

  const activeCount = orders.filter((o) => !["delivered", "cancelled"].includes(o.status)).length;

  return (
    <div>
      <div className="mb-2">
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Dashboard</h1>
        <p className="mt-1 text-ink-soft">
          Overview of orders, products and design uploads across the shop.
        </p>
      </div>

      {/* stat cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label="Orders"
          value={orders.length}
          sub={`${activeCount} active`}
          href="/admin/orders"
        />
        <StatCard
          icon={Package}
          label="Products"
          value={productCount}
          sub={`${services.length} services`}
          href="/admin/products"
        />
        <StatCard
          icon={FileText}
          label="Design uploads"
          value={uploads.length}
          sub="awaiting review"
          href="/admin/designs"
        />
        <StatCard
          icon={Users}
          label="Customers"
          value={new Set(orders.map((o) => o.customer_name)).size}
          sub="unique names in orders"
          href="/admin/orders"
        />
      </div>

      {/* status breakdown */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
        <div className="border-b border-silver-light/60 px-5 py-4">
          <h2 className="text-sm font-black uppercase tracking-wider text-muted">Orders by status</h2>
        </div>
        <div className="divide-y divide-silver-light/40">
          {Object.entries(statusCounts).map(([key, count]) => {
            const statusKey = key as OrderStatus;
            const label = STATUS_LABEL[statusKey] ?? statusKey;
            return (
              <div key={key} className="flex items-center justify-between px-5 py-3 text-sm">
                <span className="flex items-center gap-2 font-medium text-ink">{label}</span>
                <span className="rounded-full bg-silver-light/60 px-3 py-0.5 text-xs font-semibold text-muted">
                  {count}
                </span>
              </div>
            );
          })}
          {Object.keys(statusCounts).length === 0 && (
            <div className="px-5 py-6 text-center text-sm text-muted">No orders yet.</div>
          )}
        </div>
      </div>

      {/* recent orders */}
      <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
        <div className="border-b border-silver-light/60 px-5 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black uppercase tracking-wider text-muted">Recent orders</h2>
            <Link
              href="/admin/orders"
              className="flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              View all <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        <div className="divide-y divide-silver-light/40">
          {recentOrders.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-muted">No orders yet.</div>
          ) : (
            recentOrders.map((order) => (
              <div key={order.id} className="flex items-start gap-4 px-5 py-4 text-sm">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-light text-brand font-black text-xs">
                  {order.customer_name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{order.customer_name}</p>
                  <p className="mt-0.5 text-xs text-muted">{order.service_tag} · {order.customer_phone}</p>
                </div>
                <div className="ml-auto shrink-0 text-right">
                  <StatusBadge status={order.status} />
                  <p className="mt-1 text-xs text-muted">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* quick links */}
      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/admin/orders" className="rounded-xl border border-silver-light bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand hover:bg-brand-light">
          Manage orders
        </Link>
        <Link href="/admin/products" className="rounded-xl border border-silver-light bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand hover:bg-brand-light">
          Manage products
        </Link>
        <Link href="/admin/designs" className="rounded-xl border border-silver-light bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand hover:bg-brand-light">
          Review designs
        </Link>
        <Link href="/admin/settings" className="rounded-xl border border-silver-light bg-white px-4 py-2.5 text-sm font-semibold text-ink-soft transition hover:border-brand hover:text-brand hover:bg-brand-light">
          Site settings
        </Link>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  href,
}: {
  icon: typeof ShoppingBag;
  label: string;
  value: number;
  sub: string;
  href: string;
}) {
  return (
    <Link href={href} className="group block overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm transition hover:shadow-md hover:border-brand/40">
      <div className="px-5 py-5 sm:px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted">{label}</p>
            <p className="mt-1 text-3xl font-black text-ink">{value}</p>
            <p className="mt-0.5 text-xs text-muted">{sub}</p>
          </div>
          <div className="rounded-full bg-brand-light p-2 text-brand transition group-hover:bg-brand group-hover:text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </div>
    </Link>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const isActive = !["delivered", "cancelled"].includes(status);
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
        isActive
          ? "bg-brand-light text-brand-dark"
          : status === "delivered"
          ? "bg-green-100 text-green-800"
          : "bg-silver-light/80 text-silver-dark"
      }`}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}

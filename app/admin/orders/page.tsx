import type { Metadata } from "next";
import Link from "next/link";
import { ShoppingBag, ArrowUpRight, Eye } from "@/lib/icons";
import { adminListOrders } from "@/app/lib/orders.server";
import { updateOrderStatusAction } from "./actions";
import type { Order, OrderStatus } from "@/supabase/lib/types";

export const metadata: Metadata = { title: "Orders · Admin" };

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

const STATUS_OPTIONS: OrderStatus[] = [
  "draft",
  "submitted",
  "reviewing",
  "quoted",
  "approved",
  "in_production",
  "ready",
  "shipped",
  "delivered",
  "cancelled",
];

export default async function AdminOrdersPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const ok = params["ok"];
  const error = params["error"];
  const orders = await adminListOrders(200);

  return (
    <div>
      {ok && (
        <div className="mb-4 rounded-xl bg-green-50 border border-green-200 p-4 text-sm font-semibold text-green-800">
          {ok}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded-xl bg-coral-light border border-coral/30 p-4 text-sm font-semibold text-coral-dark">
          {error}
        </div>
      )}

      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight sm:text-4xl">Orders</h1>
          <p className="mt-1 text-ink-soft">
            All quote requests and orders, newest first. Update the status as work progresses.
          </p>
        </div>
        <div className="text-sm text-muted">
          <span className="font-semibold text-ink">{orders.length} order{orders.length === 1 ? "" : "s"}</span>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-silver-light/60 shadow-sm">
        <div className="border-b border-silver-light/60 px-5 py-4">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-ink">{orders.length} order{orders.length === 1 ? "" : "s"}</span>
            <Link
              href="/admin"
              className="flex items-center gap-1 text-xs font-bold text-brand hover:underline"
            >
              Back to dashboard <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-muted">
            <ShoppingBag className="mx-auto h-10 w-10 text-muted" />
            <p className="mt-3 font-semibold text-ink">No orders yet</p>
            <p className="mt-1">Orders will appear here once customers submit a quote.</p>
          </div>
        ) : (
          <div className="divide-y divide-silver-light/40">
            {orders.map((order) => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OrderRow({ order }: { order: Order }) {
  return (
    <div className="group flex items-start gap-4 px-5 py-4 transition hover:bg-cream/50">
      <div className="mt-1 shrink-0">
        <StatusBadge status={order.status} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink">{order.customer_name}</p>
        <p className="mt-0.5 text-sm text-muted">{order.customer_phone}</p>
        {order.customer_email && (
          <p className="mt-0.5 text-xs text-muted">{order.customer_email}</p>
        )}
        <div className="mt-2 flex items-center gap-2 text-sm">
          <span className="rounded bg-brand-light px-2 py-0.5 text-xs font-semibold text-brand-dark">
            {order.service_tag}
          </span>
          {order.quantity && (
            <span className="text-xs text-muted">Qty: {order.quantity}</span>
          )}
          {order.deadline && (
            <span className="flex items-center gap-1 text-xs text-muted">
              <Eye className="h-3 w-3" />
              Due: {new Date(order.deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
        <p className="mt-2 text-sm text-ink-soft line-clamp-2">{order.details}</p>
      </div>

      <div className="ml-auto shrink-0 flex flex-col items-end gap-3">
        <div className="text-right text-xs text-muted">
          <p className="font-semibold">{new Date(order.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</p>
          {order.customer_id && (
            <p className="mt-0.5 text-muted">Signed in</p>
          )}
        </div>

        <StatusSelect orderId={order.id} currentStatus={order.status} />
      </div>
    </div>
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

function StatusSelect({ orderId, currentStatus }: { orderId: string; currentStatus: OrderStatus }) {
  return (
    <form action={updateOrderStatusAction} className="inline">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="next" value="/admin/orders" />
      <div className="flex items-center gap-1">
        <select
          name="status"
          defaultValue={currentStatus}
          className="rounded-lg border border-silver-light bg-white px-2 py-1.5 text-xs font-semibold text-ink focus:border-brand focus:outline-none"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABEL[s]}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="shrink-0 rounded-lg bg-brand px-2.5 py-1.5 text-xs font-bold text-white transition hover:bg-brand-dark"
        >
          Update
        </button>
      </div>
    </form>
  );
}

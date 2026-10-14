/**
 * Quote / order server functions for Kabaprints.
 *
 * These create and list orders in the Supabase `orders` table. They are meant
 * to be called from Server Actions, Route Handlers, or Server Components.
 *
 * Two access patterns:
 *  - Guest / signed-out: an order can be created with customer_id = null so a
 *    signed-out visitor can request a quote. That row is readable only by admin
 *    (or later by the customer once they sign in and re-link it — out of scope
 *    for this release).
 *  - Signed-in customer: an order is created with customer_id = auth.uid() and
 *    the customer can list their own rows via RLS.
 *
 * The form payload mirrors the QuoteForm component in the frontend:
 *   { name, phone, email?, service, quantity?, deadline?, details, message? }
 *
 * On success we also build the WhatsApp message text (message_json) so the
 * frontend can hand off to wa.me with one click — same behaviour as the
 * existing client-side QuoteForm, but now the brief is persisted in Supabase.
 */

import { z } from "zod";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "@/lib/supabase/env";
import type {
  Order,
  OrderStatus,
  PhonesJson,
  SiteSettings,
  Service,
} from "@/supabase/lib/types";

// ---------- payload validation ----------
const CreateOrderSchema = z.object({
  customer_name: z.string().min(1, "Name is required"),
  customer_phone: z.string().min(7, "Phone is required"),
  customer_email: z.string().email("Invalid email").optional(),
  service_tag: z.string().min(1, "Service is required"),
  quantity: z.string().optional(),
  deadline: z.string().optional(), // YYYY-MM-DD from date input
  details: z.string().min(10, "Job details are required"),
});

export type CreateOrderInput = z.infer<typeof CreateOrderSchema>;

// ---------- helpers ----------
function OrderFromSupabase(row: unknown): Order {
  return row as Order;
}

function toDate(v: string | undefined): Date | null {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * Build the WhatsApp message text from an order, matching the frontend
 * QuoteForm format exactly so the hand-off link works unchanged.
 */
function buildWhatsappMessage(order: Order, site: SiteSettings): string {
  const lines: string[] = [
    `Hello Kabaprints! Quote request:\n` +
      `Name: ${order.customer_name}\n` +
      `Phone: ${order.customer_phone}${order.customer_email ? `\nEmail: ${order.customer_email}` : ""}\n` +
      `Service: ${order.service_tag}\n` +
      `Quantity: ${order.quantity ?? "TBC"}\n` +
      (order.deadline ? `Deadline: ${order.deadline}` : "") +
      `\nDetails: ${order.details}`,
  ];
  return lines.join("\n");
}

// ---------- admin getters for catalog (used to build the WhatsApp service list) ----------
// We don't need the full services list in the action; the frontend already has it.
// But we do want to confirm the chosen service_tag exists so we reject typos.
async function validateServiceTag(client: SupabaseClient, tag: string): Promise<boolean> {
  const { data, error } = await client
    .from("services")
    .select("id")
    .eq("tag", tag)
    .maybeSingle();
  return !error && !!data;
}

// ---------- create order ----------
export async function createOrder(input: CreateOrderInput): Promise<Order> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }

  // Use the anon client so the new row is inserted under the caller's RLS
  // context. If there's no signed-in user, RLS still allows INSERT with
  // customer_id = null (see the "orders: customers insert own" policy).
  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  // Validate service tag against catalog (so we never silently store a typo).
  const isValidService = await validateServiceTag(client, input.service_tag);
  if (!isValidService) {
    throw new Error(`Unknown service: "${input.service_tag}". Please pick a service from the site.`);
  }

  // Snapshot current site settings so the quoted message text stays stable even
  // if the site phone/email changes later.
  const { data: site } = await client
    .from("site_settings")
    .select("*")
    .eq("id", "a0000000-0000-0000-0000-000000000001")
    .maybeSingle();

  const phones: PhonesJson[] = site?.phones_json ?? [
    { display: "0803 296 1171", tel: "+2348032961171" },
    { display: "0915 281 2526", tel: "+2349152812526" },
  ];

  const message = buildWhatsappMessage(
    {
      id: "pending",
      customer_id: null,
      customer_name: input.customer_name,
      customer_phone: input.customer_phone,
      customer_email: input.customer_email ?? null,
      service_tag: input.service_tag,
      quantity: input.quantity ?? null,
      deadline: toDate(input.deadline)?.toISOString().slice(0, 10) ?? null,
      details: input.details,
      status: "draft" as OrderStatus,
      message_json: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    site ?? {
      id: "a0000000-0000-0000-0000-000000000001",
      site_name: "Kabaprints",
      tagline: "Printshop + Design",
      vision: "",
      hours: "9:00 am – 7:00 pm",
      hours_days: "Mondays – Saturdays",
      whatsapp_number: "2348032961171",
      email: "hello@kabaprints.com",
      phones_json: phones,
      updated_at: new Date().toISOString(),
    }
  );

  const payload = {
    customer_name: input.customer_name,
    customer_phone: input.customer_phone,
    customer_email: input.customer_email ?? null,
    service_tag: input.service_tag,
    quantity: input.quantity ?? null,
    deadline: toDate(input.deadline),
    details: input.details,
    status: "submitted" as OrderStatus,
    message_json: { text: message, phones },
  };

  const { data: order, error } = await client.from("orders").insert(payload).select().single();

  if (error || !order) {
    throw new Error(`Failed to create order: ${error?.message ?? "unknown error"}`);
  }

  return OrderFromSupabase(order);
}

// ---------- list my orders (signed-in customer) ----------
export async function listMyOrders(): Promise<Order[]> {
  const env = getSupabaseEnv();
  if (!env) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel environment variables."
    );
  }

  const client = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data, error } = await client
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`Failed to list orders: ${error.message}`);
  }

  return (data ?? []) as unknown as Order[];
}

// ---------- admin: list all orders (service role) ----------
export async function adminListOrders(limit = 100): Promise<Order[]> {
  const env = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!env || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
    );
  }

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
  const { data, error } = await admin
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to list orders (admin): ${error.message}`);
  }

  return (data ?? []) as unknown as Order[];
}

// ---------- admin: update an order status ----------
export async function adminUpdateOrderStatus(
  orderId: string,
  status: OrderStatus,
  notes?: string
): Promise<Order> {
  const env = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();
  if (!env || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in Vercel environment variables."
    );
  }

  const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, serviceRoleKey);
  const { data, error } = await admin
    .from("orders")
    .update({ status, details: notes ? `${notes}\n\n[Status updated to ${status} by admin]` : undefined })
    .eq("id", orderId)
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to update order ${orderId}: ${error?.message ?? "not found"}`);
  }

  return data as unknown as Order;
}

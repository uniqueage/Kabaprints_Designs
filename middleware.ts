import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseEnv } from "@/lib/supabase/env";

export async function middleware(request: NextRequest) {
  const env = getSupabaseEnv();
  if (!env?.NEXT_PUBLIC_SUPABASE_URL || !env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next();
  }
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          for (const { name, value, options } of cookiesToSet) {
            supabaseResponse.cookies.set(name, value, options as Parameters<typeof supabaseResponse.cookies.set>[2]);
          }
        },
      },
    },
  );

  // Validate the session on every request. Token refresh is handled client-side
  // by the browser Supabase client; the middleware only validates the current token.
  await supabase.auth.getUser().catch(() => {});

  // Protect the admin section: only signed-in admins may enter.
  const adminPath = /^\/admin(\/|$)/;
  if (adminPath.test(request.nextUrl.pathname)) {
    const { data: { user } } = await supabase.auth.getUser().catch(() => ({
      data: { user: null },
    }));
    if (!user) {
      const signInUrl = new URL("/admin/sign-in", request.url);
      signInUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    if (error || profile?.role !== "admin") {
      const signInUrl = new URL("/admin/sign-in", request.url);
      signInUrl.searchParams.set("next", request.nextUrl.pathname);
      return NextResponse.redirect(signInUrl);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|assets|images|products-images|sw.js|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

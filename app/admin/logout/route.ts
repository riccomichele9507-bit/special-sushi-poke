// POST /admin/logout — logout + redirect a /login (per riaccesso rapido admin).

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(
    new URL(
      "/login",
      process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    ),
    { status: 303 }, // 303 = converte POST in GET sulla redirect
  );
}

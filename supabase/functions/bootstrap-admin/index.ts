const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "npm:@supabase/supabase-js@2";

type Ok = { success: true; recoveryLink?: string };
type Fail = { success: false; error: string };

function json(data: Ok | Fail, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body?.email || "").trim().toLowerCase();
    const redirectTo = String(body?.redirectTo || "").trim();
    if (!email) return json({ success: false, error: "email is required" }, 400);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return json({ success: false, error: "backend_not_configured" }, 500);
    }

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Allow ONLY if no admins exist yet.
    const { count, error: countErr } = await admin
      .from("user_roles")
      .select("id", { count: "exact", head: true })
      .eq("role", "admin");

    if (countErr) return json({ success: false, error: "failed_to_check_admins" }, 500);
    if ((count ?? 0) > 0) return json({ success: false, error: "admin_already_configured" }, 403);

    // Create user (email already confirmed to simplify first access).
    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
    });

    if (createErr || !created?.user?.id) {
      return json({ success: false, error: createErr?.message || "failed_to_create_user" }, 400);
    }

    const userId = created.user.id;

    // Assign admin role (roles MUST live in user_roles).
    const { error: roleErr } = await admin.from("user_roles").insert({ user_id: userId, role: "admin" });
    if (roleErr) return json({ success: false, error: "failed_to_assign_role" }, 500);

    // Best-effort: create profile row (optional, but helps scoping later).
    await admin.from("profiles").insert({ user_id: userId, display_name: "Admin" });

    // Generate a recovery link so the user can set their password.
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: "recovery",
      email,
      options: redirectTo ? { redirectTo } : undefined,
    });

    if (linkErr) return json({ success: true }, 200);

    const recoveryLink = (linkData as any)?.properties?.action_link as string | undefined;
    return json({ success: true, recoveryLink }, 200);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "bootstrap_admin_failed";
    console.error("bootstrap-admin error:", msg);
    return json({ success: false, error: msg }, 500);
  }
});

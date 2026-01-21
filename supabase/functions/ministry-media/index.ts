const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

import { createClient } from "npm:@supabase/supabase-js@2";

type ScrapeResult = {
  success?: boolean;
  data?: {
    html?: string;
    links?: string[];
    metadata?: Record<string, unknown>;
  };
  html?: string;
  links?: string[];
  metadata?: Record<string, unknown>;
  error?: string;
};

function uniq<T>(arr: T[]) {
  return Array.from(new Set(arr));
}

function extractOgImages(html?: string) {
  if (!html) return [];

  const images: string[] = [];
  const ogRe = /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
  const twRe = /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi;

  let m: RegExpExecArray | null;
  while ((m = ogRe.exec(html))) images.push(m[1]);
  while ((m = twRe.exec(html))) images.push(m[1]);

  return images;
}

function looksLikeImage(url: string) {
  return /(\.(png|jpe?g|webp|gif)(\?.*)?$)/i.test(url);
}

async function firecrawlScrape(url: string) {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) throw new Error("FIRECRAWL_API_KEY not configured");

  const res = await fetch("https://api.firecrawl.dev/v1/scrape", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["html", "links"],
      onlyMainContent: false,
      // Facebook/Instagram are dynamic; give a little time
      waitFor: 1500,
    }),
  });

  const json = (await res.json()) as ScrapeResult;
  if (!res.ok) {
    throw new Error(json?.error || `Firecrawl request failed (${res.status})`);
  }
  return json;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const action = (body?.action || "get") as "get" | "refresh";
    const slug = body?.slug as string | undefined;
    const title = body?.title as string | undefined;
    const sources = body?.sources as { facebook?: string; instagram?: string } | undefined;
    const limit = body?.limit;

    if (!slug) {
      return new Response(JSON.stringify({ success: false, error: "slug is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    // Lovable Cloud provides SUPABASE_PUBLISHABLE_KEY; some setups use SUPABASE_ANON_KEY.
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
      // Return 200 to avoid blank-screen crashes; frontend will fall back to default images.
      return new Response(
        JSON.stringify({
          success: true,
          slug,
          images: [],
          warning: "backend_not_configured",
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: {
        headers: {
          Authorization: req.headers.get("Authorization") || "",
        },
      },
    });

    // GET: only reads cached images (no scraping)
    if (action === "get") {
      const { data: ministry } = await anon
        .from("ministries")
        .select("id, slug")
        .eq("slug", slug)
        .maybeSingle();

      if (!ministry?.id) {
        return new Response(JSON.stringify({ success: true, slug, images: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const { data: cache } = await anon
        .from("ministry_image_cache")
        .select("images, updated_at")
        .eq("ministry_id", ministry.id)
        .maybeSingle();

      return new Response(JSON.stringify({ success: true, slug, images: cache?.images || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // REFRESH: admin only
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: claimsRes, error: claimsErr } = await anon.auth.getClaims(token);
    const userId = claimsRes?.claims?.sub;
    if (claimsErr || !userId) {
      return new Response(JSON.stringify({ success: false, error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: isAdmin } = await anon.rpc("has_role", {
      _user_id: userId,
      _role: "admin",
    });

    if (!isAdmin) {
      return new Response(JSON.stringify({ success: false, error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const facebook = sources?.facebook;
    const instagram = sources?.instagram;

    const urls = [facebook, instagram].filter((u): u is string => typeof u === "string" && u.length > 0);
    if (!urls.length) {
      return new Response(JSON.stringify({ success: false, error: "sources are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scraped = await Promise.all(urls.map((u) => firecrawlScrape(u)));

    const imagesFromHtml = scraped.flatMap((r) => extractOgImages(r.data?.html || r.html));
    const imagesFromLinks = scraped
      .flatMap((r) => (r.data?.links || r.links || []).filter((l) => typeof l === "string"))
      .filter((l) => looksLikeImage(l));

    const images = uniq([...imagesFromHtml, ...imagesFromLinks])
      .filter((u) => typeof u === "string" && u.startsWith("http"))
      .slice(0, Number(limit) || 24);

    const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { data: ministryRow, error: ministryErr } = await admin
      .from("ministries")
      .upsert({ slug, title: title || slug }, { onConflict: "slug" })
      .select("id")
      .single();

    if (ministryErr || !ministryRow?.id) {
      throw new Error("Failed to upsert ministry");
    }

    await admin
      .from("ministry_image_cache")
      .upsert(
        {
          ministry_id: ministryRow.id,
          images,
          sources: { facebook, instagram },
        },
        { onConflict: "ministry_id" },
      );

    return new Response(JSON.stringify({ success: true, slug, images }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to fetch media";
    console.error("ministry-media error:", msg);
    return new Response(JSON.stringify({ success: false, error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// Lovable Cloud Function: church-assistant
// - Requires authenticated user
// - Creates/uses a conversation scoped by RLS (church)
// - Stores user + assistant messages

import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type Body = {
  conversationId?: string | null;
  conversationTitle?: string;
  message: string;
};

function systemPrompt() {
  return [
    "Você é um assistente de gerenciamento de igreja pequena, ajudando pastores, líderes e voluntários a organizar a igreja com simplicidade, responsabilidade e princípios cristãos.",
    "Objetivo: auxiliar na administração, organização e cuidado pastoral de uma igreja pequena (até 100 membros), com poucos recursos e equipes reduzidas.",
    "Estilo: linguagem simples e cristã; soluções práticas; priorize o essencial; use listas/modelos/passo a passo.",
    "Sempre que necessário, pergunte: quantos membros a igreja possui; quantos líderes/voluntários ativos; principais dificuldades; objetivo da solicitação.",
  ].join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const authHeader = req.headers.get("Authorization") ?? "";
    const userClient = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user },
      error: userErr,
    } = await userClient.auth.getUser();

    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = (await req.json()) as Body;
    const message = (body.message ?? "").trim();
    if (!message) {
      return new Response(JSON.stringify({ error: "Missing message" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Use the user's auth context for DB ops so RLS is enforced.
    const db = createClient(supabaseUrl, supabaseServiceKey, {
      global: { headers: { Authorization: authHeader } },
    });

    let conversationId = body.conversationId ?? null;

    if (!conversationId) {
      const { data: conv, error: convErr } = await db
        .from("assistant_conversations")
        .insert({ title: body.conversationTitle?.trim() || "Conversa", created_by: user.id })
        .select("id")
        .single();
      if (convErr) throw convErr;
      conversationId = conv.id;
    }

    // Store user message
    const { error: insertUserErr } = await db.from("assistant_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: message,
    });
    if (insertUserErr) throw insertUserErr;

    // Load recent context (last 30 messages)
    const { data: recent, error: recentErr } = await db
      .from("assistant_messages")
      .select("role,content,created_at")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true })
      .limit(30);
    if (recentErr) throw recentErr;

    const messages = [
      { role: "system", content: systemPrompt() },
      ...(recent ?? []).map((m) => ({ role: m.role, content: m.content })),
    ];

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages,
        temperature: 0.4,
      }),
    });

    if (!aiRes.ok) {
      const text = await aiRes.text();
      return new Response(JSON.stringify({ error: "AI request failed", details: text }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiJson = await aiRes.json();
    const assistantContent = aiJson?.choices?.[0]?.message?.content?.trim?.() ?? "";

    if (assistantContent) {
      const { error: insertAiErr } = await db.from("assistant_messages").insert({
        conversation_id: conversationId,
        role: "assistant",
        content: assistantContent,
      });
      if (insertAiErr) throw insertAiErr;

      // Touch conversation updated_at by updating title to itself (keeps policies simple).
      await db
        .from("assistant_conversations")
        .update({ title: body.conversationTitle?.trim() || "Conversa" })
        .eq("id", conversationId);
    }

    return new Response(JSON.stringify({ conversationId }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

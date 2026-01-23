import * as React from "react";
import { Download, Loader2, MessageSquarePlus, RefreshCcw, Send } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

type Conversation = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

type Message = {
  id: string;
  role: string;
  content: string;
  created_at: string;
  conversation_id: string;
};

function toCsvRow(values: string[]) {
  return (
    values
      .map((v) => {
        const s = String(v ?? "");
        const escaped = s.replace(/\"/g, '""');
        return `"${escaped}"`;
      })
      .join(",") + "\n"
  );
}

function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function ChurchAssistant() {
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [titleDraft, setTitleDraft] = React.useState("Conversa");
  const [text, setText] = React.useState("");
  const [loadingList, setLoadingList] = React.useState(false);
  const [loadingMessages, setLoadingMessages] = React.useState(false);
  const [sending, setSending] = React.useState(false);

  const loadConversations = React.useCallback(async () => {
    setLoadingList(true);
    try {
      const { data, error } = await supabase
        .from("assistant_conversations")
        .select("id,title,created_at,updated_at")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      setConversations((data ?? []) as Conversation[]);
      if (!activeConversationId && data && data.length) setActiveConversationId(data[0].id);
    } finally {
      setLoadingList(false);
    }
  }, [activeConversationId]);

  const loadMessages = React.useCallback(async (conversationId: string) => {
    setLoadingMessages(true);
    try {
      const { data, error } = await supabase
        .from("assistant_messages")
        .select("id,role,content,created_at,conversation_id")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      setMessages((data ?? []) as Message[]);
    } finally {
      setLoadingMessages(false);
    }
  }, []);

  React.useEffect(() => {
    void loadConversations();
  }, [loadConversations]);

  React.useEffect(() => {
    if (!activeConversationId) return;
    void loadMessages(activeConversationId);
  }, [activeConversationId, loadMessages]);

  const createConversation = async () => {
    const { data: auth } = await supabase.auth.getUser();
    const userId = auth.user?.id;
    if (!userId) return;

    const { data, error } = await supabase
      .from("assistant_conversations")
      .insert({ title: titleDraft.trim() || "Conversa", created_by: userId })
      .select("id,title,created_at,updated_at")
      .single();

    if (error) throw error;
    const conv = data as Conversation;
    setConversations((prev) => [conv, ...prev]);
    setActiveConversationId(conv.id);
    setMessages([]);
  };

  const sendMessage = async () => {
    const content = text.trim();
    if (!content) return;

    setSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("church-assistant", {
        body: {
          conversationId: activeConversationId,
          conversationTitle: titleDraft.trim() || "Conversa",
          message: content,
        },
      });
      if (error) throw error;

      // The function returns updated conversationId; refresh local state.
      const conversationId = (data?.conversationId as string | undefined) ?? activeConversationId;
      if (conversationId && conversationId !== activeConversationId) {
        setActiveConversationId(conversationId);
      }

      setText("");
      await loadConversations();
      if (conversationId) await loadMessages(conversationId);
    } finally {
      setSending(false);
    }
  };

  const exportActiveConversation = () => {
    if (!activeConversationId) return;
    const conv = conversations.find((c) => c.id === activeConversationId);

    let csv = "";
    csv += toCsvRow(["conversation_id", "conversation_title", "created_at", "role", "content"]);
    for (const m of messages) {
      csv += toCsvRow([
        activeConversationId,
        conv?.title ?? "Conversa",
        m.created_at,
        m.role,
        m.content,
      ]);
    }

    const safeTitle = (conv?.title ?? "conversa").toLowerCase().replace(/[^a-z0-9]+/gi, "-");
    downloadCsv(`assistente-${safeTitle || "conversa"}.csv`, csv);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-2xl">Assistente da Igreja</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Apoio prático para uma igreja pequena: organização, comunicação e cuidado pastoral.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => void loadConversations()} disabled={loadingList}>
            {loadingList ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            <span className="ml-2">Atualizar</span>
          </Button>
          <Button variant="outline" onClick={exportActiveConversation} disabled={!activeConversationId || !messages.length}>
            <Download className="h-4 w-4" />
            <span className="ml-2">Exportar CSV</span>
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Conversas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input value={titleDraft} onChange={(e) => setTitleDraft(e.target.value)} placeholder="Título (ex: Reunião de líderes)" />
              <Button className="w-full" onClick={() => void createConversation()}>
                <MessageSquarePlus className="h-4 w-4" />
                <span className="ml-2">Nova conversa</span>
              </Button>
            </div>

            <Separator />

            <div className="space-y-2">
              {conversations.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma conversa ainda. Crie a primeira.</p>
              ) : (
                <div className="grid gap-2">
                  {conversations.map((c) => {
                    const active = c.id === activeConversationId;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveConversationId(c.id)}
                        className={
                          "w-full rounded-lg border px-3 py-2 text-left transition-colors " +
                          (active ? "bg-accent text-accent-foreground" : "bg-card hover:bg-muted")
                        }
                      >
                        <div className="text-sm font-semibold">{c.title}</div>
                        <div className="text-xs text-muted-foreground">
                          Atualizado em {new Date(c.updated_at).toLocaleString()}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-elev">
          <CardHeader>
            <CardTitle>Chat</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-xl border bg-card p-4">
              {loadingMessages ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens…
                </div>
              ) : messages.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Sem mensagens ainda. Envie uma pergunta para começar.
                </p>
              ) : (
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className="grid gap-1">
                      <div className="text-xs text-muted-foreground">
                        {m.role} • {new Date(m.created_at).toLocaleString()}
                      </div>
                      <div className="whitespace-pre-wrap text-sm">{m.content}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Ex: Crie um aviso curto para o culto de domingo, ou me ajude a organizar uma escala de voluntários."
                rows={4}
              />
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs text-muted-foreground">Acesso: equipe. Histórico é salvo automaticamente.</p>
                <Button onClick={() => void sendMessage()} disabled={sending}>
                  {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="ml-2">Enviar</span>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

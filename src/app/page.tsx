"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession, signOut } from "next-auth/react";
import {
  Activity, ArrowDown, ArrowUp, AudioLines, BookOpen, Check, ChevronDown,
  ChevronLeft, ChevronRight, CircleHelp, Command, Copy, Ellipsis, FileText,
  Folder, Globe2, ImagePlus, Loader2, LogOut, Menu, MessageSquare, Moon, MoreHorizontal,
  PanelLeftClose, PanelLeftOpen, Plus, Search, Send, Settings2, Sparkles,
  Square, SquarePen, Sun, ThumbsDown, ThumbsUp, Trash2, WandSparkles, X, Zap
} from "lucide-react";
import type { Model } from "@/lib/types";
import { AuthModal } from "@/components/auth-modal";

type Message = { id: string; role: "user" | "assistant"; content: string };
type Conversation = { id: string; title: string; group: string; messageCount?: number };

const fallbackModels: Model[] = [
  { id: "gpt-3.5-turbo", name: "GPT 3.5 Turbo", detail: "Fallback model" },
  { id: "gpt-4", name: "GPT 4", detail: "Fallback model" },
];

const starters = [
  { icon: WandSparkles, title: "Create something", desc: "Turn an idea into a plan or project." },
  { icon: BookOpen, title: "Learn something", desc: "Understand a topic step by step." },
  { icon: Activity, title: "Solve a problem", desc: "Work through a tricky question." },
  { icon: FileText, title: "Write anything", desc: "Draft, refine, or organize your thoughts." },
];

export default function Home() {
  const { data: session, status } = useSession();
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [conversations, setConversations] = useState<Record<string, Conversation[]>>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [models, setModels] = useState<Model[]>([]);
  const [model, setModel] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [mode, setMode] = useState<"chat" | "research" | "code">("chat");
  const [notice, setNotice] = useState("");
  const [modelsError, setModelsError] = useState("");
  const [modelsLoading, setModelsLoading] = useState(true);
  const [conversationsLoading, setConversationsLoading] = useState(false);

  // Manual chat state management
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Show auth modal if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      setShowAuthModal(true);
    }
  }, [status]);

  // Fetch models from API on mount
  useEffect(() => {
    setModelsLoading(true);
    fetch("/api/models")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch models");
        return res.json();
      })
      .then((data) => {
        if (data.data && Array.isArray(data.data)) {
          const fetchedModels = data.data.map((m: any) => {
            const parts = m.id.split("/");
            const lastName = parts[parts.length - 1];

            let displayName = lastName
              .replace(/-/g, " ")
              .split(" ")
              .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            if (displayName.length < 3) {
              displayName = m.id;
            }

            return {
              id: m.id,
              name: displayName,
              detail: m.owned_by || "Available via 9Router",
            };
          });

          console.log(`✅ Loaded ${fetchedModels.length} models from 9Router:`, fetchedModels.map(m => m.id));
          setModels(fetchedModels);

          if (fetchedModels.length > 0) {
            setModel(fetchedModels[0].id);
          }
          setModelsLoading(false);
        }
      })
      .catch((err) => {
        console.error("❌ Failed to load models:", err);
        setModelsError("Could not connect to 9Router. Using fallback models.");
        setModels(fallbackModels);
        setModel(fallbackModels[0].id);
        setModelsLoading(false);
      });
  }, []);

  // Fetch conversations when authenticated
  useEffect(() => {
    if (session?.user) {
      loadConversations();
    }
  }, [session]);

  async function loadConversations() {
    setConversationsLoading(true);
    try {
      const res = await fetch("/api/conversations");
      if (!res.ok) throw new Error("Failed to load conversations");
      const data = await res.json();
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setConversationsLoading(false);
    }
  }

  const selectedModel = models.find((item) => item.id === model) ?? models[0] ?? { id: "", name: "Loading...", detail: "" };
  const activeConversation = Object.values(conversations)
    .flat()
    .find(c => c.id === activeConversationId);

  function newChat() {
    setActiveConversationId(null);
    setMessages([]);
    setInput("");
    setNotice("");
    setError(null);
    if (abortController) abortController.abort();
  }

  async function openChat(conversationId: string) {
    setActiveConversationId(conversationId);
    setMessages([]);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/conversations/${conversationId}`);
      if (!res.ok) throw new Error("Failed to load conversation");

      const data = await res.json();
      const loadedMessages = data.messages.map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));

      setMessages(loadedMessages);
    } catch (err) {
      console.error("Failed to load conversation:", err);
      setNotice("Failed to load conversation messages");
    } finally {
      setIsLoading(false);
    }
  }

  async function sendMessage() {
    const value = input.trim();
    if (!value || isLoading) return;

    let conversationId = activeConversationId;

    // Create new conversation if needed
    if (!conversationId) {
      try {
        const res = await fetch("/api/conversations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: value.slice(0, 50) }),
        });

        if (!res.ok) throw new Error("Failed to create conversation");

        const newConv = await res.json();
        conversationId = newConv.id;
        setActiveConversationId(conversationId);

        // Reload conversations list
        loadConversations();
      } catch (err) {
        console.error("Failed to create conversation:", err);
        setNotice("Failed to create conversation");
        return;
      }
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: value,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    const controller = new AbortController();
    setAbortController(controller);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          model,
          conversationId,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.details || `API error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No response body");

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMessage]);

      let fullText = "";
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim() || line.startsWith(":")) continue;

          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;

              if (content) {
                fullText += content;
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id ? { ...m, content: fullText } : m
                  )
                );
              }
            } catch (e) {
              console.warn("Failed to parse SSE chunk:", data);
            }
          }
        }
      }

      // Reload conversations to update timestamp
      loadConversations();
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err);
        console.error("Chat error:", err);
      }
    } finally {
      setIsLoading(false);
      setAbortController(null);
    }
  }

  function stop() {
    if (abortController) {
      abortController.abort();
      setIsLoading(false);
    }
  }

  async function deleteConversation(id: string) {
    if (!confirm("Delete this conversation? This cannot be undone.")) return;

    try {
      const res = await fetch(`/api/conversations/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");

      if (activeConversationId === id) {
        newChat();
      }

      loadConversations();
      setNotice("Conversation deleted");
    } catch (err) {
      console.error("Failed to delete:", err);
      setNotice("Failed to delete conversation");
    }
  }

  function copyText(text: string) {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => setNotice("Copied to clipboard."));
    }
  }

  // Show auth modal if not authenticated
  if (status === "loading") {
    return (
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        background: "var(--bg)"
      }}>
        <Loader2 size={32} className="animate-spin" style={{ color: "var(--accent)" }} />
      </div>
    );
  }

  if (!session) {
    return showAuthModal ? <AuthModal onClose={() => {}} /> : null;
  }

  return (
    <main className={dark ? "app-shell dark" : "app-shell"}>
      {sidebarOpen && (
        <aside className="sidebar">
          <div className="brand-row">
            <button className="brand-mark" onClick={newChat} aria-label="KiLi Assistant home"><Sparkles size={17} /></button>
            <span className="brand-name">kili<span>.</span></span>
            <button className="icon-button sidebar-collapse" onClick={() => setSidebarOpen(false)} aria-label="Collapse sidebar"><PanelLeftClose size={17} /></button>
          </div>

          <button className="new-chat-button" onClick={newChat}><SquarePen size={16} /><span>New chat</span><kbd>⌘ K</kbd></button>

          <div className="sidebar-tools">
            <button onClick={() => setSearchOpen(true)}><Search size={16} /> Search chats <span>⌘ /</span></button>
            <button onClick={() => setNotice("Projects workspace is coming in Phase C.")}><Folder size={16} /> Projects</button>
          </div>

          <div className="history-label">YOUR CHATS</div>
          <div className="chat-history">
            {conversationsLoading ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "10px" }}>
                <Loader2 size={16} className="animate-spin" style={{ margin: "0 auto 8px" }} />
                Loading conversations...
              </div>
            ) : Object.keys(conversations).length === 0 ? (
              <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "10px" }}>
                No conversations yet.<br />Start a new chat!
              </div>
            ) : (
              Object.entries(conversations).map(([group, items]) => (
                <div className="history-group" key={group}>
                  <div className="history-date">{group}</div>
                  {items.map((chat) => (
                    <button
                      key={chat.id}
                      onClick={() => openChat(chat.id)}
                      className={`history-item ${activeConversationId === chat.id ? "active" : ""}`}
                    >
                      <MessageSquare size={14} />
                      <span>{chat.title}</span>
                      <button
                        className="history-more"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteConversation(chat.id);
                        }}
                        aria-label="Delete conversation"
                      >
                        <Trash2 size={14} />
                      </button>
                    </button>
                  ))}
                </div>
              ))
            )}
          </div>

          <div className="sidebar-bottom">
            <div className="workspace-card">
              <div className="workspace-icon"><Zap size={15} /></div>
              <div><strong>{session.user?.name || "User"}</strong><span>{session.user?.email}</span></div>
              <span className="online-dot" />
            </div>
            <button className="profile-button" onClick={() => setSettingsOpen(true)}>
              <div className="avatar">{session.user?.name?.charAt(0).toUpperCase() || "U"}</div>
              <div className="profile-copy"><strong>{session.user?.name || "User"}</strong><span>Personal account</span></div>
              <Ellipsis size={17} />
            </button>
          </div>
        </aside>
      )}

      <section className="main-panel">
        <header className="topbar">
          <div className="topbar-left">
            {!sidebarOpen && <button className="icon-button" onClick={() => setSidebarOpen(true)} aria-label="Open sidebar"><PanelLeftOpen size={18} /></button>}
            <div className="breadcrumb">
              <span>Workspace</span>
              <ChevronRight size={14} />
              <strong>{activeConversation?.title || "New chat"}</strong>
            </div>
          </div>
          <div className="topbar-actions">
            <div className="model-wrap">
              <button className={`model-trigger ${modelOpen ? "selected" : ""}`} onClick={() => setModelOpen(!modelOpen)} disabled={modelsLoading}>
                <span className="model-spark">{modelsLoading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}</span>
                {modelsLoading ? "Loading..." : selectedModel.name}
                <ChevronDown size={14} />
              </button>
              {modelOpen && <div className="model-menu">
                <div className="menu-eyebrow">SELECT MODEL ({models.length} available)</div>
                {models.map((item) => <button key={item.id} onClick={() => { setModel(item.id); setModelOpen(false); }}>
                  <span className="model-option-icon"><Sparkles size={14} /></span>
                  <span className="model-option-copy"><strong>{item.name}</strong><small>{item.detail}</small></span>
                  {model === item.id && <Check size={15} />}
                </button>)}
                {modelsError && <div className="menu-footnote" style={{ color: "#d4a574" }}>{modelsError}</div>}
                {!modelsError && <div className="menu-footnote">Models from your 9Router gateway.</div>}
              </div>}
            </div>
            <button className="icon-button hide-mobile" onClick={() => setSettingsOpen(true)} aria-label="Settings"><Settings2 size={18} /></button>
            <button className="icon-button hide-mobile" onClick={() => setDark(!dark)} aria-label="Toggle theme">{dark ? <Sun size={18} /> : <Moon size={18} />}</button>
          </div>
        </header>

        <div className="content-scroll">
          {messages.length === 0 ? (
            <div className="welcome-wrap">
              <div className="welcome-orb">
                <div className="orb-core"><Sparkles size={25} /></div>
                <span className="orb-ring ring-one" />
                <span className="orb-ring ring-two" />
              </div>
              <div className="welcome-kicker"><span className="kicker-line" /> YOUR SPACE TO THINK <span className="kicker-line" /></div>
              <h1>Good to have you<br /><em>here.</em></h1>
              <p className="welcome-subtitle">A little curiosity can take you a long way.<br />What would you like to explore today?</p>
              <div className="starter-grid">
                {starters.map(({ icon: Icon, title, desc }) => (
                  <button className="starter-card" key={title} onClick={() => setInput(`${title}: `)}>
                    <span className="starter-icon"><Icon size={17} /></span>
                    <strong>{title}</strong>
                    <small>{desc}</small>
                    <ArrowUp size={14} className="starter-arrow" />
                  </button>
                ))}
              </div>
              <div className="welcome-footnote"><span className="tiny-spark">✳</span> Thoughtful by design. Powered by your models.</div>
            </div>
          ) : (
            <div className="conversation">
              <div className="conversation-meta"><span className="meta-dot" /> PRIVATE CONVERSATION <span>·</span> {selectedModel.name}</div>
              {messages.map((message) => (
                <article key={message.id} className={`message-row ${message.role}`}>
                  {message.role === "assistant" ? (
                    <div className="assistant-avatar"><Sparkles size={15} /></div>
                  ) : (
                    <div className="user-avatar">{session.user?.name?.charAt(0).toUpperCase() || "U"}</div>
                  )}
                  <div className="message-body">
                    <div className="message-author">
                      {message.role === "assistant" ? "KiLi" : "You"}
                      <span>{message.role === "assistant" ? "· Assistant" : "· Just now"}</span>
                    </div>
                    <div className="message-content">
                      {message.content.split("\n").map((line, index) => <p key={index}>{line}</p>)}
                    </div>
                    {message.role === "assistant" && (
                      <div className="message-actions">
                        <button onClick={() => copyText(message.content)} aria-label="Copy response"><Copy size={14} /></button>
                        <button onClick={() => setNotice("Thanks for the feedback.")} aria-label="Good response"><ThumbsUp size={14} /></button>
                        <button onClick={() => setNotice("Feedback noted.")} aria-label="Bad response"><ThumbsDown size={14} /></button>
                        <button aria-label="More response actions"><MoreHorizontal size={15} /></button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
              {isLoading && (
                <article className="message-row assistant">
                  <div className="assistant-avatar"><Loader2 size={15} className="animate-spin" /></div>
                  <div className="message-body">
                    <div className="message-author">KiLi <span>· Thinking...</span></div>
                  </div>
                </article>
              )}
              {error && <div className="inline-notice">Error: {error.message}. Check your configuration.</div>}
              {notice && <div className="inline-notice">{notice}</div>}
            </div>
          )}
        </div>

        <div className="composer-area">
          <div className="composer-shell">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="Message KiLi..."
              rows={1}
              disabled={isLoading}
            />
            <div className="composer-toolbar">
              <div className="composer-tools">
                <button className="tool-button" onClick={() => setNotice("File attachments will be enabled in Phase C.")}><Plus size={17} /><span>Add</span></button>
                <button className={`tool-button mode-button ${mode === "research" ? "tool-active" : ""}`} onClick={() => setMode(mode === "research" ? "chat" : "research")}><Globe2 size={15} /><span>Research</span></button>
                <button className={`tool-button mode-button ${mode === "code" ? "tool-active" : ""}`} onClick={() => setMode(mode === "code" ? "chat" : "code")}><Command size={15} /><span>Code</span></button>
              </div>
              <div className="composer-right">
                <span className="composer-hint">↵ to send · shift + ↵ for new line</span>
                {isLoading ? (
                  <button className="send-button" onClick={stop} aria-label="Stop generation"><Square size={16} /></button>
                ) : (
                  <button className="send-button" onClick={sendMessage} disabled={!input.trim()} aria-label="Send message"><Send size={16} /></button>
                )}
              </div>
            </div>
          </div>
          <div className="disclaimer">KiLi can make mistakes. Check important information. {modelsError && <span style={{ color: "#d4a574" }}>{modelsError}</span>}</div>
        </div>
      </section>

      {settingsOpen && (
        <div className="modal-backdrop" onClick={() => setSettingsOpen(false)}>
          <section className="settings-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div><span className="modal-kicker">PREFERENCES</span><h2>Settings</h2></div>
              <button className="icon-button" onClick={() => setSettingsOpen(false)}><X size={18} /></button>
            </div>
            <div className="settings-section">
              <h3>Appearance</h3>
              <p>Choose how KiLi looks on this device.</p>
              <div className="theme-choice">
                <button className={!dark ? "chosen" : ""} onClick={() => setDark(false)}><Sun size={17} /> Light</button>
                <button className={dark ? "chosen" : ""} onClick={() => setDark(true)}><Moon size={17} /> Dark</button>
              </div>
            </div>
            <div className="settings-section">
              <h3>Model preferences</h3>
              <p>Choose the default model for new conversations.</p>
              <select value={model} onChange={(e) => setModel(e.target.value)}>
                {models.map((item) => <option value={item.id} key={item.id}>{item.name}</option>)}
              </select>
            </div>
            <div className="settings-section">
              <h3>Account</h3>
              <p>Signed in as {session.user?.email}</p>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 12px",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: "10px",
                  cursor: "pointer",
                }}
              >
                <LogOut size={14} /> Sign out
              </button>
            </div>
            <div className="settings-section">
              <h3>About KiLi</h3>
              <p>Phase B: Conversations persist · Message history loaded.</p>
              <div className="settings-status">
                <span className="online-dot" />
                {modelsLoading ? "Loading models..." : models.length > 0 ? `Connected · ${models.length} models` : "Using fallback models"}
              </div>
            </div>
            <button className="modal-done" onClick={() => setSettingsOpen(false)}>Done</button>
          </section>
        </div>
      )}

      {searchOpen && (
        <div className="modal-backdrop" onClick={() => setSearchOpen(false)}>
          <section className="search-modal" onClick={(e) => e.stopPropagation()}>
            <div className="search-input-wrap">
              <Search size={18} />
              <input autoFocus placeholder="Search your conversations..." />
              <kbd>ESC</kbd>
              <button onClick={() => setSearchOpen(false)}><X size={17} /></button>
            </div>
            <div className="search-empty-label">RECENT CONVERSATIONS</div>
            {Object.values(conversations).flat().slice(0, 5).map((chat) => (
              <button className="search-result" key={chat.id} onClick={() => { openChat(chat.id); setSearchOpen(false); }}>
                <MessageSquare size={15} />
                <span>{chat.title}</span>
                <ChevronRight size={14} />
              </button>
            ))}
          </section>
        </div>
      )}

      {notice && messages.length === 0 && (
        <div className="toast">
          <span className="toast-dot" />
          {notice}
          <button onClick={() => setNotice("")}><X size={14} /></button>
        </div>
      )}
    </main>
  );
}

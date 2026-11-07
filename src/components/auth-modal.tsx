"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2, Sparkles, X } from "lucide-react";

type AuthModalProps = {
  onClose: () => void;
};

export function AuthModal({ onClose }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        // Register new user
        const res = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, name }),
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Registration failed");
        }

        // Auto-login after registration
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Registration successful, but login failed. Please try logging in.");
        }

        // Success - reload page to get session
        window.location.reload();
      } else {
        // Login
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        });

        if (result?.error) {
          throw new Error("Invalid email or password");
        }

        // Success - reload page to get session
        window.location.reload();
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section className="settings-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "420px" }}>
        <div className="modal-header">
          <div>
            <span className="modal-kicker">{mode === "login" ? "WELCOME BACK" : "GET STARTED"}</span>
            <h2>{mode === "login" ? "Sign in to KiLi" : "Create your account"}</h2>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === "register" && (
            <div className="settings-section" style={{ paddingTop: 0 }}>
              <h3>Your Name</h3>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your name"
                required
                style={{
                  width: "100%",
                  padding: "9px 10px",
                  border: "1px solid var(--line)",
                  borderRadius: "8px",
                  background: "var(--surface)",
                  color: "var(--text)",
                  fontSize: "11px",
                }}
              />
            </div>
          )}

          <div className="settings-section" style={{ paddingTop: mode === "register" ? "15px" : 0 }}>
            <h3>Email</h3>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              style={{
                width: "100%",
                padding: "9px 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: "11px",
              }}
            />
          </div>

          <div className="settings-section">
            <h3>Password</h3>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === "register" ? "At least 6 characters" : "Enter your password"}
              required
              minLength={6}
              style={{
                width: "100%",
                padding: "9px 10px",
                border: "1px solid var(--line)",
                borderRadius: "8px",
                background: "var(--surface)",
                color: "var(--text)",
                fontSize: "11px",
              }}
            />
          </div>

          {error && (
            <div style={{
              padding: "9px 12px",
              borderRadius: "8px",
              background: "#fef2f2",
              color: "#991b1b",
              fontSize: "10px",
              marginTop: "12px",
              border: "1px solid #fee2e2"
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            className="modal-done"
            disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
          >
            {loading ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                {mode === "login" ? "Signing in..." : "Creating account..."}
              </>
            ) : (
              <>
                <Sparkles size={14} />
                {mode === "login" ? "Sign in" : "Create account"}
              </>
            )}
          </button>

          <div style={{ textAlign: "center", marginTop: "16px", fontSize: "10px", color: "var(--muted)" }}>
            {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => {
                setMode(mode === "login" ? "register" : "login");
                setError("");
              }}
              style={{
                padding: 0,
                border: 0,
                background: "transparent",
                color: "var(--accent)",
                fontSize: "inherit",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {mode === "login" ? "Create one" : "Sign in"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

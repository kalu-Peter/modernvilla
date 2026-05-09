import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("adminSecret")) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        sessionStorage.setItem("adminSecret", data.secret);
        sessionStorage.setItem("adminUser", data.username);
        navigate("/admin/dashboard", { replace: true });
      } else {
        setError(data.error ?? "Invalid credentials. Please try again.");
      }
    } catch {
      setError("Connection error. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .al-root {
          min-height: 100vh;
          background: #f5f6fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: 'Inter', sans-serif;
          padding: 24px;
        }

        .al-card {
          width: 100%;
          max-width: 420px;
          padding: 48px 44px;
          background: #ffffff;
          border: 1px solid #eef0f4;
          border-radius: 20px;
          box-shadow: 0 4px 24px rgba(0,0,0,0.07);
        }

        .al-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 6px;
        }
        .al-brand-dot {
          width: 10px; height: 10px;
          background: #c9a84c;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .al-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.3rem;
          color: #1a1a2e;
          letter-spacing: 0.02em;
        }
        .al-logo span { color: #c9a84c; }

        .al-subtitle {
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #9098a9;
          margin-bottom: 36px;
          padding-left: 20px;
        }

        .al-field {
          margin-bottom: 18px;
        }

        .al-field label {
          display: block;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: #9098a9;
          margin-bottom: 8px;
        }

        .al-field input {
          width: 100%;
          background: #f9fafb;
          border: 1.5px solid #e5e7eb;
          border-radius: 10px;
          color: #1a1a2e;
          font-family: 'Inter', sans-serif;
          font-size: 0.92rem;
          font-weight: 400;
          padding: 13px 16px;
          outline: none;
          transition: border-color 0.18s, background 0.18s;
        }

        .al-field input:focus {
          border-color: #c9a84c;
          background: #ffffff;
        }

        .al-field input::placeholder { color: #c4c9d4; }

        .al-error {
          font-size: 0.78rem;
          font-weight: 500;
          color: #991b1b;
          margin-bottom: 18px;
          padding: 11px 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          border-radius: 8px;
        }

        .al-btn {
          width: 100%;
          background: #1a1a2e;
          color: #ffffff;
          border: none;
          border-radius: 10px;
          padding: 14px;
          font-family: 'Inter', sans-serif;
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.04em;
          cursor: pointer;
          transition: background 0.18s, transform 0.12s;
          margin-top: 6px;
        }

        .al-btn:hover:not(:disabled) { background: #2d2d4e; transform: translateY(-1px); }
        .al-btn:active:not(:disabled) { transform: translateY(0); }
        .al-btn:disabled { opacity: 0.45; cursor: not-allowed; }

        .al-back {
          display: block;
          text-align: center;
          margin-top: 24px;
          font-size: 0.75rem;
          font-weight: 500;
          color: #9098a9;
          text-decoration: none;
          transition: color 0.18s;
        }
        .al-back:hover { color: #1a1a2e; }
      `}</style>

      <div className="al-root">
        <div className="al-card">
          <div className="al-brand">
            <div className="al-brand-dot"></div>
            <div className="al-logo">Croc<span>odile</span> Lodge</div>
          </div>
          <div className="al-subtitle">Admin Portal</div>

          <form onSubmit={handleSubmit} autoComplete="off">
            <div className="al-field">
              <label htmlFor="al-username">Username</label>
              <input
                id="al-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
              />
            </div>

            <div className="al-field">
              <label htmlFor="al-password">Password</label>
              <input
                id="al-password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {error && <div className="al-error">{error}</div>}

            <button className="al-btn" type="submit" disabled={loading}>
              {loading ? "Verifying…" : "Sign In →"}
            </button>
          </form>

          <a className="al-back" href="/">← Back to site</a>
        </div>
      </div>
    </>
  );
};

export default AdminLoginPage;

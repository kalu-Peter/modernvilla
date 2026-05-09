import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

type Status = "checking" | "success" | "failed" | "missing";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<Status>("checking");
  const [message, setMessage] = useState("Verifying your payment…");

  const trackingId = searchParams.get("OrderTrackingId");

  useEffect(() => {
    if (!trackingId) {
      setStatus("missing");
      setMessage("No payment reference found.");
      return;
    }

    let attempts = 0;
    const maxAttempts = 12; // 1 minute

    const poll = async () => {
      attempts++;
      try {
        const res = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "pesapal-status", orderTrackingId: trackingId }),
        });
        const data = await res.json() as { status: string };

        if (data.status === "success") {
          setStatus("success");
          setMessage("Payment confirmed! Your booking is being processed.");
          clearInterval(timer);
        } else if (data.status === "failed") {
          setStatus("failed");
          setMessage("Payment was not completed. Please try again.");
          clearInterval(timer);
        } else if (attempts >= maxAttempts) {
          setStatus("failed");
          setMessage("We could not confirm your payment. If you were charged, please contact us.");
          clearInterval(timer);
        }
      } catch {
        if (attempts >= maxAttempts) {
          setStatus("failed");
          setMessage("Network error. Please contact us to confirm your booking.");
          clearInterval(timer);
        }
      }
    };

    poll();
    const timer = setInterval(poll, 5000);
    return () => clearInterval(timer);
  }, [trackingId]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f5f6fa",
      fontFamily: "'Inter', sans-serif",
      padding: "24px",
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16,
        padding: "48px 40px",
        maxWidth: 460,
        width: "100%",
        textAlign: "center",
        boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      }}>
        {/* Icon */}
        <div style={{ marginBottom: 24 }}>
          {status === "checking" && (
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              border: "4px solid #e5e7eb",
              borderTopColor: "#c9a84c",
              margin: "0 auto",
              animation: "spin 1s linear infinite",
            }} />
          )}
          {status === "success" && (
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#d1fae5",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto", fontSize: "1.8rem",
            }}>✓</div>
          )}
          {(status === "failed" || status === "missing") && (
            <div style={{
              width: 64, height: 64, borderRadius: "50%",
              background: "#fee2e2",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto", fontSize: "1.8rem",
            }}>✗</div>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: "1.25rem",
          fontWeight: 700,
          color: "#1a1a2e",
          margin: "0 0 12px",
        }}>
          {status === "checking" && "Verifying Payment"}
          {status === "success" && "Booking Confirmed!"}
          {status === "failed" && "Payment Unsuccessful"}
          {status === "missing" && "Invalid Reference"}
        </h1>

        {/* Message */}
        <p style={{
          fontSize: "0.9rem",
          color: "#6b7280",
          lineHeight: 1.6,
          margin: "0 0 32px",
        }}>
          {message}
        </p>

        {/* Reference */}
        {trackingId && (
          <p style={{
            fontSize: "0.72rem",
            color: "#9ca3af",
            marginBottom: 32,
            fontFamily: "monospace",
          }}>
            Ref: {trackingId}
          </p>
        )}

        {/* Actions */}
        {status === "success" && (
          <button
            onClick={() => navigate("/")}
            style={{
              background: "#1a1a2e",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "12px 28px",
              fontSize: "0.82rem",
              fontWeight: 600,
              letterSpacing: "0.05em",
              cursor: "pointer",
              width: "100%",
            }}
          >
            Back to Home
          </button>
        )}
        {(status === "failed" || status === "missing") && (
          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                flex: 1,
                background: "#1a1a2e",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: "0.82rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Try Again
            </button>
            <a
              href="https://wa.me/254700000000"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                background: "#25d366",
                color: "#fff",
                borderRadius: 8,
                padding: "12px 16px",
                fontSize: "0.82rem",
                fontWeight: 600,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              Contact Us
            </a>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

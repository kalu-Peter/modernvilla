import React, { useState, useRef } from "react";
import type { PaymentInfo } from "../types";

interface PaymentComponentProps {
  reservationId: string;
  amount: number;
  onPaymentComplete: (paymentInfo: PaymentInfo) => void;
  isProcessing?: boolean;
}

type Stage = "input" | "waiting" | "success" | "failed";

const POLL_INTERVAL_MS = 4000;
const POLL_TIMEOUT_MS  = 120_000; // 2 minutes

const PaymentComponent: React.FC<PaymentComponentProps> = ({
  reservationId,
  amount,
  onPaymentComplete,
}) => {
  const [phone, setPhone]       = useState("");
  const [error, setError]       = useState("");
  const [stage, setStage]       = useState<Stage>("input");
  const [statusMsg, setStatusMsg] = useState("Waiting for M-Pesa confirmation…");
  const pollRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const checkoutRequestIdRef = useRef<string>("");

  const validatePhone = (p: string) =>
    /^(\+254|0)[17]\d{8}$/.test(p.replace(/\s/g, ""));

  const stopPolling = () => {
    if (pollRef.current)  clearInterval(pollRef.current);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const startPolling = (checkoutRequestId: string) => {
    const start = Date.now();

    pollRef.current = setInterval(async () => {
      try {
        const res  = await fetch(`/api/mpesa/status?id=${encodeURIComponent(checkoutRequestId)}`);
        const data = await res.json();

        if (data.status === "completed") {
          stopPolling();
          setStage("success");
          onPaymentComplete({
            phoneNumber: phone.replace(/\s/g, ""),
            amount,
            reservationId,
            status: "completed",
          });
          return;
        }

        if (data.status === "cancelled") {
          stopPolling();
          setStage("failed");
          setError("Payment was cancelled. Please try again.");
          return;
        }

        if (data.status === "timeout") {
          stopPolling();
          setStage("failed");
          setError("Payment request timed out. Please try again.");
          return;
        }

        // still pending — check overall timeout
        if (Date.now() - start > POLL_TIMEOUT_MS) {
          stopPolling();
          setStage("failed");
          setError("Payment confirmation timed out. If you completed payment please contact us.");
        }
      } catch {
        // network hiccup — keep polling
      }
    }, POLL_INTERVAL_MS);
  };

  const handlePay = async () => {
    setError("");

    if (!phone.trim()) { setError("Please enter your phone number"); return; }
    if (!validatePhone(phone)) {
      setError("Enter a valid Kenyan number, e.g. 0712 345 678 or +254712345678");
      return;
    }

    setStage("waiting");
    setStatusMsg("Sending M-Pesa prompt to your phone…");

    try {
      const res = await fetch("/api/mpesa/stk-push", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, amount, reservationId }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStage("failed");
        setError(data.error || "Could not initiate payment. Please try again.");
        return;
      }

      checkoutRequestIdRef.current = data.checkoutRequestId;
      setStatusMsg("M-Pesa prompt sent! Enter your PIN on your phone to complete payment.");
      startPolling(data.checkoutRequestId);
    } catch {
      setStage("failed");
      setError("Network error. Please check your connection and try again.");
    }
  };

  const handleRetry = () => {
    stopPolling();
    setStage("input");
    setError("");
  };

  /* ── Input stage ── */
  if (stage === "input") return (
    <div className="payment-component">
      <div className="payment-header">
        <h3>M-Pesa Payment</h3>
        <p className="payment-amount">Amount: KES {amount.toLocaleString()}</p>
      </div>
      <div className="payment-form">
        <div className="form-group">
          <label htmlFor="phone">M-Pesa Phone Number</label>
          <input
            id="phone"
            type="tel"
            placeholder="+254712345678 or 0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="phone-input"
          />
          <p className="hint">Enter your M-Pesa registered phone number</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button className="btn-pay-mpesa" onClick={handlePay}>
          Pay with M-Pesa
        </button>

        <div className="payment-info">
          <h4>How it works:</h4>
          <ol>
            <li>Enter your M-Pesa registered phone number</li>
            <li>Click "Pay with M-Pesa"</li>
            <li>A prompt will appear on your phone</li>
            <li>Enter your M-Pesa PIN to confirm</li>
          </ol>
        </div>
      </div>
    </div>
  );

  /* ── Waiting for confirmation ── */
  if (stage === "waiting") return (
    <div className="payment-component">
      <div className="payment-header">
        <h3>M-Pesa Payment</h3>
        <p className="payment-amount">Amount: KES {amount.toLocaleString()}</p>
      </div>
      <div className="payment-waiting">
        <div className="mpesa-spinner" />
        <p className="waiting-msg">{statusMsg}</p>
        <p className="waiting-sub">
          Please <strong>do not close</strong> this page until confirmation.
        </p>
      </div>
    </div>
  );

  /* ── Failed ── */
  if (stage === "failed") return (
    <div className="payment-component">
      <div className="payment-header">
        <h3>Payment Failed</h3>
      </div>
      <div className="payment-failed">
        <p className="error-message">{error}</p>
        <button className="btn-pay-mpesa" onClick={handleRetry}>
          Try Again
        </button>
      </div>
    </div>
  );

  /* ── Success (briefly shown before parent navigates away) ── */
  return (
    <div className="payment-component">
      <div className="payment-waiting">
        <p className="waiting-msg" style={{ color: "#10b981" }}>✓ Payment confirmed!</p>
      </div>
    </div>
  );
};

export default PaymentComponent;

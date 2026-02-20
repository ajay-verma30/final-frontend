import React, { useState } from 'react';
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Loader2, ShieldCheck } from "lucide-react";

interface Props {
  amount: string;
  onSuccess: () => void;
}

const StripeCheckoutForm: React.FC<Props> = ({ amount, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Fallback redirect URL — only used if redirect is required (e.g. 3D Secure)
        return_url: `${window.location.origin}/orders`,
      },
      redirect: 'if_required',
    });

    if (error) {
      if (error.type === "card_error" || error.type === "validation_error") {
        setMessage(error.message || "Card error. Please try again.");
      } else {
        setMessage("An unexpected error occurred.");
      }
      setIsLoading(false);
      return;
    }

    if (paymentIntent && paymentIntent.status === 'succeeded') {
      // onSuccess clears the cart and navigates to /orders
      onSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
        <PaymentElement />
      </div>

      {message && (
        <div className="p-3 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !stripe || !elements}
        className="w-full py-4 rounded-2xl font-semibold text-base flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ background: "#2a1f14", color: "white", fontFamily: "'Jost', sans-serif", letterSpacing: "0.1em" }}
      >
        {isLoading
          ? <><Loader2 className="animate-spin" size={18} /> Processing...</>
          : <><ShieldCheck size={18} /> Pay ${amount}</>
        }
      </button>
    </form>
  );
};

export default StripeCheckoutForm;
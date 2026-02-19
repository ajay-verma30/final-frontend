// src/components/StripeWrapper.tsx
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckoutForm from "./StripeCheckoutForm";

// Instantiated once outside component so it's not recreated on re-renders
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

interface Props {
  clientSecret: string;
  amount: string;
  onSuccess: () => void;
}

const StripeWrapper: React.FC<Props> = ({ clientSecret, amount, onSuccess }) => {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#6366f1',
            colorBackground: '#f8fafc',
            borderRadius: '12px',
            fontFamily: 'Inter, sans-serif',
          },
        },
      }}
    >
      <StripeCheckoutForm amount={amount} onSuccess={onSuccess} />
    </Elements>
  );
};

export default StripeWrapper;
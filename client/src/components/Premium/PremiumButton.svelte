<script>
    import { fetchPost } from '../../utils/fetchApi.js';
    import { user } from '../../stores/authStore.js';
    import { loadStripe } from '@stripe/stripe-js';
  
    let stripe;
    const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    
    async function handlePremiumClick() {
        if (!stripe) {
            stripe = await loadStripe(stripePublishableKey);
        }
  
        const { id: sessionId } = await fetchPost('/auth/create-checkout-session', { userId: $user.id });
        await stripe.redirectToCheckout({ sessionId });
    }
  </script>
  
  {#if $user && !$user.premium_status}
      <button class="btn btn-success" onclick={handlePremiumClick}>Go Premium</button>
  {/if}
<script>
    import { fetchPost } from '../../utils/fetchApi.js';
    import { user } from '../../stores/authStore.js';
    import { loadStripe } from '@stripe/stripe-js';
  
    let stripe;
  
    async function handlePremiumClick() {
        if (!stripe) {
            stripe = await loadStripe('pk_test_51RQY8ARkqrA6nukbH9eJ6bQA5bC6oQ2zqzRdouqSSELk6o1uPrxHig2ZpMdbsCtvCjJYT5TLii2NsGhiYV23V6Ej00trL6piGu');
        }
  
        const { id: sessionId } = await fetchPost('/auth/create-checkout-session', { userId: $user.id });
        await stripe.redirectToCheckout({ sessionId });
    }
  </script>
  
  {#if $user && !$user.premium_status}
      <button class="btn btn-success" onclick={handlePremiumClick}>Go Premium</button>
  {/if}
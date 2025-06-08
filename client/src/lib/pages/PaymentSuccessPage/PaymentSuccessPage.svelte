<script>
    import { router as tinroRouter } from 'tinro';
    import { checkSession } from '../../stores/authStore.js'; // Import the checkSession function

    // Using Svelte 5's $effect to run code when the component is created
    $effect(() => {
        const handleSuccess = async () => {
            // 1. Force the auth store to refetch the user's session data from the server.
            //    This will get the new `premium_status: true`.
            await checkSession();

            // 2. Give the user a moment to see the success message.
            setTimeout(() => {
                // 3. Redirect to the dashboard where they will now see the premium content.
                tinroRouter.goto('/dashboard', { replace: true });
            }, 2500); // 2.5 second delay
        };

        handleSuccess();
    });
</script>

<div>
    <h2>Payment Successful!</h2>
    <p>Thank you for becoming a premium member. Your account has been upgraded.</p>
    <p>You will be redirected to your dashboard shortly...</p>
</div>

<style>
    div {
        text-align: center;
        padding: 2rem;
        background-color: #e8f5e9; /* Light green background */
        border: 1px solid #4caf50; /* Green border */
        border-radius: 8px;
        color: #2e7d32;
    }
</style>
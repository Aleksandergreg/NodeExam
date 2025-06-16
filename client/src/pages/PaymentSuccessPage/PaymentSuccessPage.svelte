<script>
    import { router as tinroRouter } from 'tinro';
    import { checkSession } from '../../stores/authStore.js'; 

    $effect(() => {
        const handleSuccess = async () => {
            await checkSession();

            setTimeout(() => {
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
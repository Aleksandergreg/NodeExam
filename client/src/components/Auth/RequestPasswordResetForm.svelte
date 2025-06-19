<script>
    import { toast } from 'svelte-5-french-toast';
    import { fetchPost } from '../../utils/fetchApi.js';
    import '../../styles/AuthForm.css';

    let email = $state('');
    let isLoading = $state(false);
    let message = $state(''); 
    let errorMessage = $state('');

    async function handleRequestReset(event) {
        event.preventDefault();
        isLoading = true;
        errorMessage = '';
        message = ''; 

        try {
            const data = await fetchPost('/auth/request-password-reset', { email });
            message = data.message || 'If an account with that email exists, a password reset link has been sent.';
            toast.success(message); 
            email = ''; 
        } catch (error) {
            console.error("Request password reset failed:", error);
            errorMessage = error.data?.message || 'Failed to request password reset. Please try again.';
            toast.error(errorMessage);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="auth-container">
    <div class="card auth-card"> 
        <h2>Forgot Password?</h2>
        <p>Enter your email address and we'll send you a link to reset your password.</p>
        
        <form onsubmit={handleRequestReset}>
            <div class="form-group">
                <input
                    type="email"
                    placeholder="Your Email Address"
                    required
                    bind:value={email}
                    disabled={isLoading}
                />
            </div>

            {#if errorMessage}
                <div class="error-message">{errorMessage}</div>
            {/if}
            {#if message}
                <div class="success-message">{message}</div> 
            {/if}

            <button type="submit" class="btn btn-primary" disabled={isLoading}>
                {#if isLoading}Sending...{:else}Send Reset Link{/if}
            </button>

            <a href="/login" class="toggle-link">Back to Login</a>
        </form>
    </div>
</div>
<script>
    import { toast } from 'svelte-5-french-toast';
    import { fetchPost } from '../utils/fetchApi.js';
    import '../styles/authForm.css'; 

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
            errorMessage = error.data?.message || error.message || 'Failed to request password reset. Please try again.';
            toast.error(errorMessage);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="auth-container">
    <div class="auth-main show-login"> 
        <div class="auth-form-section auth-login"> 
            <h2>Forgot Password?</h2>
            <p>Enter your email address below, and we'll send you a link to reset your password.</p>
            <form onsubmit={handleRequestReset}>
                <input
                    type="email"
                    name="email"
                    placeholder="Your Email Address"
                    required
                    bind:value={email}
                    disabled={isLoading}
                />
                {#if errorMessage}
                    <div class="error-message">{errorMessage}</div>
                {/if}
                 {#if message}
                    <div class="success-message">{message}</div> 
                {/if}
                <button type="submit" disabled={isLoading}>
                    {#if isLoading}Sending...{:else}Send Reset Link{/if}
                </button>
                 <a href="/login" class="view-toggle-button">Back to Login</a>
            </form>
        </div>
    </div>
</div>

<style>
    /* Add or reuse styles from authForm.css */
    .success-message {
        color: green;
        margin-top: 10px;
        font-size: 0.9em;
        text-align: center;
    }
     .view-toggle-button {
        margin-top: 15px; /* Add some space above the back button */
        display: inline-block; /* Allow margin */
        background: none;
        border: none;
        color: #007bff; /* Link color */
        text-decoration: underline;
        cursor: pointer;
        font-size: 0.9em;
    }
    .view-toggle-button:hover {
        color: #0056b3;
    }
    p {
        margin-bottom: 1rem;
        text-align: center;
        color: #555;
    }
     h2 {
        text-align: center;
        margin-bottom: 1rem;
        color: #333;
    }
</style>

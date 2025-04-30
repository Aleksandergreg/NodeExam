<script>
    import { toast } from 'svelte-5-french-toast';
    import { fetchPost } from '../utils/fetchApi.js';
    import { router as tinroRouter } from 'tinro'; 
    import '../styles/authForm.css';

    let newPassword = $state('');
    let confirmPassword = $state('');
    let isLoading = $state(false);
    let errorMessage = $state('');
    let successMessage = $state('');

    let token = $state('');
    let userId = $state('');

    $effect(() => {
        const currentQuery = $tinroRouter.query;
        token = currentQuery.token || '';
        userId = currentQuery.userId || '';

        if (!token || !userId) {
            errorMessage = "Invalid password reset link. Missing token or user ID.";
            console.error(errorMessage);
            // tinroRouter.goto('/login'); //same as before, would be nice, but not working currently
        } else {
             errorMessage = ''; 
        }
    });

    async function handleResetPassword(event) {
        event.preventDefault();

        if (!token || !userId) {
             errorMessage = "Cannot reset password. Link is invalid.";
             toast.error(errorMessage);
             return;
        }

        if (newPassword !== confirmPassword) {
            errorMessage = "Passwords do not match.";
            toast.error(errorMessage);
            return;
        }
        if (newPassword.length < 8) {
             errorMessage = "Password must be at least 8 characters long.";
             toast.error(errorMessage);
             return;
        }

        isLoading = true;
        errorMessage = '';
        successMessage = '';

        try {
            const data = await fetchPost('/auth/reset-password', {
                userId: parseInt(userId, 10) || userId,
                token,
                newPassword
            });
            successMessage = data.message || 'Password reset successfully!';
            toast.success(successMessage);
            setTimeout(() => {
                tinroRouter.goto('/login', { replace: true });
            }, 2000);

        } catch (error) {
            console.error("Reset password failed:", error);
            errorMessage = error.data?.message || error.message || 'Failed to reset password. The link might be invalid or expired.';
            toast.error(errorMessage);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="auth-container">
    <div class="auth-main show-login"> 
        <div class="auth-form-section auth-login"> 
            <h2>Set New Password</h2>
            {#if !token || !userId}
                 <div class="error-message">{errorMessage || 'Invalid or incomplete password reset link.'}</div>
                 <a href="/login" class="view-toggle-button">Go to Login</a>
            {:else}
                <form onsubmit={handleResetPassword}>
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password"
                        required
                        bind:value={newPassword}
                        disabled={isLoading}
                    />
                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        required
                        bind:value={confirmPassword}
                        disabled={isLoading}
                    />
                    {#if errorMessage}
                        <div class="error-message">{errorMessage}</div>
                    {/if}
                    {#if successMessage}
                        <div class="success-message">{successMessage} Redirecting to login...</div>
                    {/if}
                    <button type="submit" disabled={isLoading || !!successMessage}>
                        {#if isLoading}Updating...{:else}Reset Password{/if}
                    </button>
                </form>
            {/if}
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
     h2 {
        text-align: center;
        margin-bottom: 1rem;
        color: #333;
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
     .error-message {
        color: #dc3545; /* Bootstrap danger color */
        margin-top: 10px;
        margin-bottom: 10px;
        font-size: 0.9em;
        text-align: center;
        min-height: 1.2em; /* Prevent layout shift */
    }
</style>

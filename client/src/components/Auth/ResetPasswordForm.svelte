<script>
    import { toast } from 'svelte-5-french-toast';
    import { fetchPost } from '../../utils/fetchApi.js';
    import { router as tinroRouter } from 'tinro'; 
    import '../../styles/AuthForm.css';

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
            errorMessage = error.data?.message || 'Failed to reset password. The link might be invalid or expired.';
            toast.error(errorMessage);
        } finally {
            isLoading = false;
        }
    }
</script>

<div class="auth-container">
    <div class="card auth-card">
        <h2>Set New Password</h2>
        {#if !token || !userId}
             <div class="error-message">{errorMessage || 'Invalid or incomplete password reset link.'}</div>
             <a href="/login" class="toggle-link">Go to Login</a>
        {:else}
            <form onsubmit={handleResetPassword}>
                <div class="form-group">
                    <input
                        type="password"
                        placeholder="New Password"
                        required
                        bind:value={newPassword}
                        disabled={isLoading}
                    />
                </div>
                <div class="form-group">
                    <input
                        type="password"
                        placeholder="Confirm New Password"
                        required
                        bind:value={confirmPassword}
                        disabled={isLoading}
                    />
                </div>
                {#if errorMessage}
                    <div class="error-message">{errorMessage}</div>
                {/if}
                {#if successMessage}
                    <div class="success-message">{successMessage} Redirecting to login...</div>
                {/if}
                <button type="submit" class="btn btn-primary" disabled={isLoading || !!successMessage}>
                    {#if isLoading}Updating...{:else}Reset Password{/if}
                </button>
            </form>
        {/if}
    </div>
</div>
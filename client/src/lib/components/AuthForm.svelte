<script>
    import { toast } from 'svelte-5-french-toast';
    import { setUser } from '../stores/authStore.js';
    import { fetchPost } from '../utils/fetchApi.js';
    import { router as tinroRouter } from 'tinro';
    import '../styles/authForm.css';

    // --- Component State ---
    let isLoginView = $state(true);
    let email = $state('');
    let password = $state('');
    let username = $state('');
    let confirmPassword = $state('');
    let isLoading = $state(false);
    let errorMessage = $state('');

    function toggleView() {
        isLoginView = !isLoginView;
        errorMessage = '';
        email = '';
        password = '';
        username = '';
        confirmPassword = '';
    }

    async function handleLogin(event) {
        event.preventDefault();
        isLoading = true;
        errorMessage = '';
        try {
            const data = await fetchPost('/auth/login', { email, password });
            setUser(data.user);
            toast.success(data.message || 'Login successful!');
            tinroRouter.goto('/dashboard', { replace: true });
        } catch (error) {
            console.error("Login failed:", error);
             errorMessage = error.data?.message || error.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
        } finally {
            isLoading = false;
        }
    }

     async function handleSignup(event) {
         event.preventDefault();
         if (password !== confirmPassword) {
             errorMessage = "Passwords do not match.";
             toast.error(errorMessage);
             return;
         }
         isLoading = true;
         errorMessage = '';
         try {
             const data = await fetchPost('/auth/signup', { username, email, password });
             setUser(data.user);
             toast.success(data.message || 'Signup successful! Welcome!');
             tinroRouter.goto('/dashboard', { replace: true });
         } catch (error) {
             console.error("Signup failed:", error);
              errorMessage = error.data?.message || error.message || 'Signup failed. Please try again.';
             toast.error(errorMessage);
         } finally {
             isLoading = false;
         }
     }

</script>

<div class="auth-container">
    <div class="auth-main" class:show-login={isLoginView}>
        <div class="auth-form-section auth-signup">
            <form onsubmit={handleSignup}>
                <input type="text" name="txt" placeholder="User name" required bind:value={username} disabled={isLoading}>
                <input type="email" name="email" placeholder="Email" required bind:value={email} disabled={isLoading}>
                <input type="password" name="pswd" placeholder="Password (min 8 chars)" required bind:value={password} disabled={isLoading}>
                <input type="password" name="confirmPswd" placeholder="Confirm Password" required bind:value={confirmPassword} disabled={isLoading}>
                {#if errorMessage && !isLoginView}
                    <div class="error-message">{errorMessage}</div>
                {/if}
                <button type="submit" disabled={isLoading}>
                    {#if isLoading && !isLoginView}Signing up...{:else}Sign up{/if}
                </button>
                <button type="button" class="view-toggle-button" onclick={toggleView}>Already have an account? Log in</button>
            </form>
        </div>
        <div class="auth-form-section auth-login">
             <form onsubmit={handleLogin}>
                <input type="email" name="email" placeholder="Email" required bind:value={email} disabled={isLoading}>
                <input type="password" name="pswd" placeholder="Password" required bind:value={password} disabled={isLoading}>
                {#if errorMessage && isLoginView}
                    <div class="error-message">{errorMessage}</div>
                {/if}
                 <div class="forgot-password-link">
                     <a href="/forgot-password">Forgot Password?</a>
                 </div>
                 <button type="submit" disabled={isLoading}>
                     {#if isLoading && isLoginView}Logging in...{:else}Log in{/if}
                </button>
                <button type="button" class="view-toggle-button" onclick={toggleView}>Don't have an account? Sign up</button>
            </form>
        </div>
    </div>
</div>

<style>
    /* Add styles for the forgot password link */
    .forgot-password-link {
        text-align: right;
        margin-top: -5px; /* Adjust as needed */
        margin-bottom: 15px; /* Space before button */
        font-size: 0.85em;
    }
    .forgot-password-link a {
        color: #007bff;
        text-decoration: none;
    }
    .forgot-password-link a:hover {
        text-decoration: underline;
    }
     h2 {
        text-align: center;
        margin-bottom: 1.5rem; /* More space below heading */
        color: #333;
        font-weight: 500;
    }
    /* Ensure view-toggle-button has enough space */
    .view-toggle-button {
        margin-top: 15px;
        display: inline-block;
        background: none;
        border: none;
        color: #007bff;
        text-decoration: underline;
        cursor: pointer;
        font-size: 0.9em;
        padding: 5px; /* Add padding for easier clicking */
    }
    .view-toggle-button:hover {
        color: #0056b3;
    }
</style>

<script>
    import { toast } from 'svelte-5-french-toast';
    import { fetchPost } from '../utils/fetchApi.js';
    import { authStore } from '../stores/authStore.js';
    import { navigate } from 'svelte-routing'; // Import navigate for redirection

    let isLoginView = $state(true); // Controls which form is visually prominent

    // Form fields - using $state for reactivity
    let email = $state('');
    let password = $state('');
    let username = $state(''); // For signup
    let confirmPassword = $state(''); // For signup validation

    let isLoading = $state(false);
    let errorMessage = $state('');

    function toggleView() {
        isLoginView = !isLoginView;
        errorMessage = ''; // Clear errors on view switch
        // Reset fields on switch (optional, depends on desired UX)
        email = '';
        password = '';
        username = '';
        confirmPassword = '';
    }

    async function handleLogin(event) {
        event.preventDefault(); // Prevent default form submission
        isLoading = true;
        errorMessage = '';
        try {
            const data = await fetchPost('/auth/login', { email, password });
            authStore.setUser(data.user); // Update auth store
            toast.success(data.message || 'Login successful!');
            navigate('/dashboard'); // Redirect to dashboard after login
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
              // Signup response includes user data and logs them in via session
             authStore.setUser(data.user); // Update auth store
             toast.success(data.message || 'Signup successful! Welcome!');
              // Maybe send to dashboard or a "welcome" page
             navigate('/dashboard');
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
                 <label onclick={toggleView} aria-hidden="true">Sign up</label>
                <input type="text" name="txt" placeholder="User name" required bind:value={username} disabled={isLoading}>
                <input type="email" name="email" placeholder="Email" required bind:value={email} disabled={isLoading}>
                <input type="password" name="pswd" placeholder="Password" required bind:value={password} disabled={isLoading}>
                <input type="password" name="confirmPswd" placeholder="Confirm Password" required bind:value={confirmPassword} disabled={isLoading}>
                <div class="error-message">{errorMessage && !isLoginView ? errorMessage : ''}</div>
                <button type="submit" disabled={isLoading}>
                    {#if isLoading && !isLoginView}Signing up...{:else}Sign up{/if}
                </button>
            </form>
        </div>

        <div class="auth-form-section auth-login">
            <form onsubmit={handleLogin}>
                 <label onclick={toggleView} aria-hidden="true">Login</label>
                <input type="email" name="email" placeholder="Email" required bind:value={email} disabled={isLoading}>
                <input type="password" name="pswd" placeholder="Password" required bind:value={password} disabled={isLoading}>
                 <div class="error-message">{errorMessage && isLoginView ? errorMessage : ''}</div>
                <button type="submit" disabled={isLoading}>
                     {#if isLoading && isLoginView}Logging in...{:else}Login{/if}
                </button>
            </form>
        </div>

    </div>
</div>

<style src="../styles/authForm.css"></style>

<script>
    import { toast } from 'svelte-5-french-toast';
    import { setUser } from '../stores/authStore.js'; 
    import { fetchPost } from '../utils/fetchApi.js'; 
    import { navigate } from 'svelte-routing';
    import '../styles/authForm.css';


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
            navigate('/dashboard');
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
                <input type="text" name="txt" placeholder="User name" required bind:value={username} disabled={isLoading}>
                <input type="email" name="email" placeholder="Email" required bind:value={email} disabled={isLoading}>
                <input type="password" name="pswd" placeholder="Password" required bind:value={password} disabled={isLoading}>
                <input type="password" name="confirmPswd" placeholder="Confirm Password" required bind:value={confirmPassword} disabled={isLoading}>
                <div class="error-message">{errorMessage && !isLoginView ? errorMessage : ''}</div>
                <button type="submit" disabled={isLoading}>
                    {#if isLoading && !isLoginView}Signing up...{:else}Sign up{/if}
                </button>
                <button type="button" class="view-toggle-button" onclick={toggleView}>Go to log in</button>

            </form>
        </div>

        <div class="auth-form-section auth-login">
             <form onsubmit={handleLogin}>
                <input type="email" name="email" placeholder="Email" required bind:value={email} disabled={isLoading}>
                <input type="password" name="pswd" placeholder="Password" required bind:value={password} disabled={isLoading}>
                 <div class="error-message">{errorMessage && isLoginView ? errorMessage : ''}</div>
                <button type="submit" disabled={isLoading}>
                     {#if isLoading && isLoginView}Logging in...{:else}Log in{/if}
                </button>
                <button type="button" class="view-toggle-button" onclick={toggleView}>Sign up</button>

            </form>
        </div>

    </div>
</div>

<!-- <style src="../styles/authForm.css"></style> -->
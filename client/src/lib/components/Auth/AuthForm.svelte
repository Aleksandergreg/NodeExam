<script>
    import { toast } from 'svelte-5-french-toast';
    import { setUser } from '../../stores/authStore.js';
    import { fetchPost } from '../../utils/fetchApi.js';
    import { router as tinroRouter } from 'tinro';
    import { onMount } from 'svelte'; // 1. Import onMount
    import '../../styles/authForm.css'

    // --- Component State ---
    let isLoginView = $state(true);
    let email = $state('');
    let password = $state('');
    let username = $state('');
    let confirmPassword = $state(''); 
    let isLoading = $state(false);
    let errorMessage = $state('');

    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6LcGyForAAAAABZYBRSt49vSjwfEFL6ASo5YbMeK"; // Fallback for your hardcoded key

    let recaptchaWidgetContainer; 

    const renderRecaptcha = () => {
        if (recaptchaWidgetContainer && typeof window.grecaptcha?.render === 'function') {
            try {
                window.grecaptcha.render(recaptchaWidgetContainer, {
                    'sitekey': siteKey,
                });
            } catch (e) {
                console.error("Error rendering reCAPTCHA:", e);
            }
        }
    };

    onMount(() => {
        const interval = setInterval(() => {
            if (window.grecaptcha) {
                clearInterval(interval);
                renderRecaptcha();
            }
        }, 100);
    });
    
    function toggleView() {
        isLoginView = !isLoginView;
        errorMessage = '';
        email = '';
        password = '';
        username = '';
        confirmPassword = '';
        
        setTimeout(renderRecaptcha, 0);
    }

    async function handleLogin(event) {
        event.preventDefault();
        
        const captchaToken = window.grecaptcha.getResponse();
        if (!captchaToken) {
            errorMessage = "Please complete the CAPTCHA.";
            toast.error(errorMessage);
            return;
        }

        isLoading = true;
        errorMessage = '';
        try {
            const data = await fetchPost('/auth/login', { email, password, captchaToken });
            setUser(data.user);
            toast.success(data.message || 'Login successful!');
            tinroRouter.goto('/dashboard', { replace: true });
        } catch (error) {
            console.error("Login failed:", error);
            errorMessage = error.data?.message || error.message || 'Login failed. Please check your credentials.';
            toast.error(errorMessage);
        } finally {
            isLoading = false;
            window.grecaptcha.reset();
        }
    }

    async function handleSignup(event) {
        event.preventDefault();
        
        const captchaToken = window.grecaptcha.getResponse();
        if (!captchaToken) {
            errorMessage = "Please complete the CAPTCHA.";
            toast.error(errorMessage);
            return;
        }

        if (password !== confirmPassword) {
             errorMessage = "Passwords do not match.";
             toast.error(errorMessage);
             return;
        }
        isLoading = true;
        errorMessage = '';
        try {
             const data = await fetchPost('/auth/signup', { username, email, password, captchaToken });
             setUser(data.user);
             toast.success(data.message || 'Signup successful! Welcome!');
             tinroRouter.goto('/dashboard', { replace: true });
        } catch (error) {
             console.error("Signup failed:", error);
             errorMessage = error.data?.message || error.message || 'Signup failed. Please try again.';
             toast.error(errorMessage);
        } finally {
             isLoading = false;
             window.grecaptcha.reset();
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
                
                <div bind:this={recaptchaWidgetContainer} class="g-recaptcha"></div>

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

                <div bind:this={recaptchaWidgetContainer} class="g-recaptcha"></div>

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
    .g-recaptcha {
        margin: 15px auto;
        /* The widget is 304px wide, this helps center it */
        width: 304px; 
        /* The container itself might be empty before Google renders into it */
        min-height: 78px;
    }
    .forgot-password-link {
        text-align: right;
        margin-top: -5px;
        margin-bottom: 15px;
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
        margin-bottom: 1.5rem;
        color: #333;
        font-weight: 500;
    }
    .view-toggle-button {
        margin-top: 15px;
        display: inline-block;
        background: none;
        border: none;
        color: #007bff;
        text-decoration: underline;
        cursor: pointer;
        font-size: 0.9em;
        padding: 5px;
    }
    .view-toggle-button:hover {
        color: #0056b3;
    }
</style>
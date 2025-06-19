<script>
    import { toast } from 'svelte-5-french-toast';
    import { setUser } from '../../stores/authStore.js';
    import { fetchPost } from '../../utils/fetchApi.js';
    import { router as tinroRouter } from 'tinro';
    import { onMount } from 'svelte';
    import '../../styles/AuthForm.css';
  
    let isLoginView = $state(true);
    let email = $state('');
    let password = $state('');
    let username = $state('');
    let confirmPassword = $state('');
    let isLoading = $state(false);
    let errorMessage = $state('');
  
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;
  
    let recaptchaContainerEl = $state();
    let recaptchaId = null;
  
    const renderRecaptcha = () => {
      if (recaptchaContainerEl && typeof window.grecaptcha?.render === 'function') {
        try {
          // Clear previous instance if it exists to avoid reCAPTCHA errors
          recaptchaContainerEl.innerHTML = '';
          recaptchaId = window.grecaptcha.render(recaptchaContainerEl, {
            'sitekey': siteKey,
            'theme': 'dark'
          });
        } catch (e) {
          console.error("Error rendering reCAPTCHA:", e);
        }
      }
    };
  
    onMount(() => {
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
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
      const captchaToken = window.grecaptcha.getResponse(recaptchaId);
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
        tinroRouter.goto('/', { replace: true });
      } catch (error) {
        errorMessage = error.data?.message || 'Login failed. Please check your credentials.';
        toast.error(errorMessage);
      } finally {
        isLoading = false;
        window.grecaptcha.reset(recaptchaId);
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
        tinroRouter.goto('/', { replace: true });
      } catch (error) {
        errorMessage = error.data?.message || 'Signup failed. Please try again.';
        toast.error(errorMessage);
      } finally {
        isLoading = false;
      }
    }
  </script>
  
  <div class="auth-container">
    <div class="card auth-card">
      {#if isLoginView}
        <h2>Log In</h2>
        <form onsubmit={handleLogin}>
          <div class="form-group">
            <input type="email" placeholder="Email" required bind:value={email} disabled={isLoading} />
          </div>
          <div class="form-group">
            <input type="password" placeholder="Password" required bind:value={password} disabled={isLoading} />
          </div>
  
          {#if errorMessage}<div class="error-message">{errorMessage}</div>{/if}
  
          <div bind:this={recaptchaContainerEl} class="g-recaptcha"></div>
  
          <div class="auth-links">
            <span>&nbsp;</span> <a href="/forgot-password">Forgot Password?</a>
          </div>
  
          <button type="submit" class="btn btn-primary" disabled={isLoading}>
            {#if isLoading}Logging in...{:else}Log In{/if}
          </button>
  
          <button type="button" class="toggle-link" onclick={toggleView}>
            Don't have an account? Sign up
          </button>
        </form>
      {:else}
        <h2>Create Account</h2>
        <form onsubmit={handleSignup}>
          <div class="form-group">
            <input type="text" placeholder="Username" required bind:value={username} disabled={isLoading} />
          </div>
          <div class="form-group">
            <input type="email" placeholder="Email" required bind:value={email} disabled={isLoading} />
          </div>
          <div class="form-group">
            <input type="password" placeholder="Password (min 8 chars)" required bind:value={password} disabled={isLoading} />
          </div>
          <div class="form-group">
            <input type="password" placeholder="Confirm Password" required bind:value={confirmPassword} disabled={isLoading} />
          </div>
  
          {#if errorMessage}<div class="error-message">{errorMessage}</div>{/if}
  
          <button type="submit" class="btn btn-primary" disabled={isLoading}>
            {#if isLoading}Creating account...{:else}Sign Up{/if}
          </button>
  
          <button type="button" class="toggle-link" onclick={toggleView}>
            Already have an account? Log in
          </button>
        </form>
      {/if}
    </div>
  </div>
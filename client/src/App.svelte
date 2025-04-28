<script>
  import { Route, router as tinroRouter, active } from 'tinro';
  import { toast } from 'svelte-5-french-toast';


  import { user as userStore, loading as loadingStore, clearUser, checkSession } from './lib/stores/authStore.js';
  import { fetchPost } from './lib/utils/fetchApi.js';
  import HomePage from './lib/pages/HomePage.svelte';
  import LoginPage from './lib/pages/LoginPage.svelte';
  import DashboardPage from './lib/pages/DashboardPage.svelte';
  import Toaster from './lib/components/Toaster.svelte';

  let user = $state(null);
  let loading = $state(true);

  $effect(() => {
    const unsubUser = userStore.subscribe(value => user = value);
    const unsubLoading = loadingStore.subscribe(value => loading = value);
    return () => {
        unsubUser();
        unsubLoading();
    };
  });

  // --- Guards ---
  function isUserLoggedIn() {
      return !loading && !!user;
  }
  function isUserLoggedOut() {
      return !loading && !user;
  }

  // --- Redirection Effect ---
  $effect(() => {
    if (!loading) {
      const currentPath = window.location.pathname;
      if (user && currentPath === '/login') {
        console.log("Effect: User logged in, redirecting from /login");
        tinroRouter.goto('/dashboard', { replace: true });
      } else if (!user && currentPath === '/dashboard') {
        console.log("Effect: User not logged in, redirecting from /dashboard");
        toast.error("Please log in to access this page.");
        tinroRouter.goto('/login', { replace: true });
      }
    }
  });

  // --- Logout Handler ---
  async function handleLogout() {
    try {
        await fetchPost('/auth/logout');
        clearUser();
        toast.success('Logout successful!');
        tinroRouter.goto('/', { replace: true });
    } catch (error) {
        console.error('Logout failed:', error);
        toast.error(error.data?.message || error.message || 'Logout failed.');
    }
  }

</script>

{#if loading}
  <p>Loading application...</p>
{:else}
  <nav>
    <a href="/" use:active={{exact: true}}>Home</a>
    {#if user}
        <a href="/dashboard" use:active>Dashboard</a>
        <button class="logout-button" onclick={handleLogout}>Logout ({user.username})</button>
    {:else if !loading}
        <a href="/login" use:active>Login/Sign Up</a>
    {/if}
  </nav>

  <main>
      <Route path="/">
          <HomePage />
      </Route>
      <Route path="/login">
          {#if isUserLoggedOut()}
              <LoginPage />
          {/if}
      </Route>
      <Route path="/dashboard">
           {#if isUserLoggedIn()}
               <DashboardPage />
           {/if}
      </Route>
  </main>

  <Toaster position="bottom-center" />
{/if}

<style>
    a.active {
      font-weight: bold;

    }

    nav { display: flex; gap: 1rem; padding: 1rem; background-color: #eee; margin-bottom: 1rem; align-items: center; color: #333; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    nav a { color: #0056b3; text-decoration: none; padding: 0.5rem 0; }
    nav a:hover { text-decoration: underline; color: #003d80; }
    .logout-button { background: none; border: none; padding: 0.5rem 0; margin: 0; font: inherit; cursor: pointer; color: #c82333; margin-left: auto; }
    .logout-button:hover { text-decoration: underline; color: #a71d2a; }
    main { padding: 1rem; }
</style>
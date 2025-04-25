<script>
  import { Router, Link, Route, navigate } from "svelte-routing";
  import { toast } from 'svelte-5-french-toast';

  // Import individual stores and functions
  import { user, loading, clearUser, checkSession } from './lib/stores/authStore.js';
  import { fetchPost } from './lib/utils/fetchApi.js';
  // Import Pages and Components (ensure paths are correct)
  import HomePage from "./lib/pages/HomePage.svelte";
  import LoginPage from "./lib/pages/LoginPage.svelte";
  import DashboardPage from "./lib/pages/DashboardPage.svelte";
  import Toaster from "./lib/components/Toaster.svelte";

  export let url = "";

  // Use $ directly with the imported stores
  $: console.log("[App.svelte] Loading state:", $loading);
  $: console.log("[App.svelte] User state:", $user);

  function requireAuth() {
     // Access store values directly with $
     if (!$loading && !$user) { // Check $loading and $user
        toast.error("Please log in to access this page.");
        navigate('/login', { replace: true });
        return false;
     }
     return true;
  }

  function requireNoAuth() {
      // Access store values directly with $
      if (!$loading && $user) { // Check $loading and $user
          navigate('/dashboard', { replace: true });
          return false;
      }
      return true;
  }

  async function handleLogout() {
      try {
          await fetchPost('/auth/logout');
          clearUser(); // Call imported function directly
          toast.success('Logout successful!');
          navigate('/');
      } catch (error) {
          console.error("Logout failed:", error);
          toast.error(error.data?.message || error.message || 'Logout failed.');
      }
  }
</script>

<Router {url}>
  <nav>
    <Link to="/">Home</Link>
    {#if $user} <Link to="/dashboard">Dashboard</Link>
      <button class="logout-button" on:click={handleLogout}>Logout ({$user.username})</button>
    {:else if !$loading} <Link to="/login">Login/Sign Up</Link>
    {/if}
     {#if $loading} <span>&nbsp;Loading...</span>
     {/if}
  </nav>

  <main>
    {#if $loading} <p>Loading application...</p>
    {:else}
         <Route path="/" component={HomePage} />
         <Route path="/login" >
              {#if requireNoAuth()} <LoginPage /> {/if}
         </Route>
        <Route path="/dashboard">
             {#if requireAuth()} <DashboardPage /> {/if}
        </Route>
    {/if}
  </main>

  <Toaster position="bottom-center" />
</Router>

<style>
    /* ... styles remain the same ... */
    nav {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background-color: #eee;
        margin-bottom: 1rem;
        align-items: center; /* Align button vertically */
    }
    /* Style Links if needed, e.g., using :global or specific classes */
    /* nav :global(a) { ... } */

    .logout-button {
        background: none;
        border: none;
        padding: 0;
        font: inherit;
        cursor: pointer;
        color: #dc3545; /* Red color for logout */
        margin-left: auto; /* Push logout button to the right */
    }
    .logout-button:hover {
        text-decoration: underline;
    }

    main {
        padding: 1rem;
    }
</style>
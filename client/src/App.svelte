<script>
  import { Router, Link, Route, navigate } from "svelte-routing";
  import { toast } from 'svelte-5-french-toast';

import { authStore } from './lib/stores/authStore.js';
import { fetchPost } from './lib/utils/fetchApi.js';
import HomePage from "./lib/pages/HomePage.svelte";
import LoginPage from "./lib/pages/LoginPage.svelte";
import DashboardPage from "./lib/pages/DashboardPage.svelte";
import Toaster from "./lib/components/Toaster.svelte";
  export let url = ""; // Needed for svelte-routing

  // --- Protected Route Logic ---
  //$: user = authStore.user; // Subscribe to user changes Svelte 5 style - using the store directly is reactive

  function requireAuth() {
     // Use authStore directly inside functions/handlers
     if (!authStore.loading && !authStore.user) {
        toast.error("Please log in to access this page.");
        navigate('/login', { replace: true }); // Redirect to login
        return false; // Indicate auth failed
     }
     return true; // Indicate auth passed
  }

  function requireNoAuth() {
      // Redirect logged-in users away from login page
      if (!authStore.loading && authStore.user) {
          navigate('/dashboard', { replace: true });
          return false;
      }
      return true;
  }


  async function handleLogout() {
      try {
          await fetchPost('/auth/logout');
          authStore.clearUser(); // Clear user state in store
          toast.success('Logout successful!');
          navigate('/'); // Redirect to home page
      } catch (error) {
          console.error("Logout failed:", error);
          toast.error(error.data?.message || error.message || 'Logout failed.');
      }
  }

</script>

<Router {url}>
  <nav>
    <Link to="/">Home</Link>
    {#if authStore.user}
      <Link to="/dashboard">Dashboard</Link>
      <button class="logout-button" on:click={handleLogout}>Logout ({authStore.user.username})</button>
    {:else if !authStore.loading}
      <Link to="/login">Login/Sign Up</Link>
    {/if}
     {#if authStore.loading}
          <span>&nbsp;Loading...</span>
     {/if}
  </nav>

  <main>
    {#if authStore.loading}
        <p>Loading application...</p>
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
  nav {
    display: flex;
    gap: 1rem;
    padding: 1rem;
    background-color: #eee;
    margin-bottom: 1rem;
    align-items: center; /* Align button vertically */
  }
   nav a, nav button {
        text-decoration: none;
        color: #333;
   }
   nav a:hover {
       color: #007bff;
   }

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
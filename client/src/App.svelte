<script>
  import { Route, router as tinroRouter, active } from 'tinro';
  import { toast } from 'svelte-5-french-toast';

  import { user as userStore, loading as loadingStore, clearUser } from './lib/stores/authStore.js';
  import { fetchPost } from './lib/utils/fetchApi.js';
  import HomePage from './lib/pages/Homepage/HomePage.svelte';
  import LoginPage from './lib/pages/LoginPage/LoginPage.svelte';
  import DashboardPage from './lib/pages/DashboardPage/DashboardPage.svelte';
  import RequestPasswordResetPage from './lib/pages/Auth/RequestPasswordResetPage.svelte';
  import ResetPasswordPage from './lib/pages/Auth/ResetPasswordPage.svelte';
  import RacesPage from './lib/pages/Race/RacesPage.svelte';
  import Toaster from './lib/components/Toaster/Toaster.svelte';
  import PremiumButton from './lib/components/Premium/PremiumButton.svelte';
  import PremiumContent from './lib/components/Premium/PremiumContent.svelte';
  import PaymentSuccessPage from './lib/pages/PaymentSuccessPage/PaymentSuccessPage.svelte';
  import RankingsPage from './lib/pages/Race/RankingsPage.svelte';
  import RaceDetailPage from './lib/pages/Race/RaceDetailPage.svelte';
  import AdminPanelPage from './lib/pages/Admin/AdminPanelPage.svelte';
  import LiveCommentaryPage from './lib/pages/Race/LiveCommentaryPage.svelte'; // Import live page

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

  function isUserLoggedIn() { return !loading && !!user; }
  function isUserLoggedOut() { return !loading && !user; }
  function isUserAdmin() { return !loading && user?.role === 'admin'; }
  // Guard for premium users
  function isUserPremium() { return !loading && user?.premium_status; }

  // Enhanced Redirection Effect
  $effect(() => {
    if (!loading) {
      const currentPath = $tinroRouter.path;
      const isAuthPage = ['/login', '/forgot-password', '/reset-password'].some(p => currentPath.startsWith(p));
      const isAdminPage = currentPath.startsWith('/admin');
      const isLivePage = currentPath.startsWith('/race/live/');

      if (user && isAuthPage) {
        tinroRouter.goto('/dashboard', { replace: true });
      } else if (!user && (currentPath === '/dashboard' || isAdminPage || isLivePage)) {
        toast.error("Please log in to access this page.");
        tinroRouter.goto('/login', { replace: true });
      } else if (user && isAdminPage && user.role !== 'admin') {
        toast.error("Access Denied: Admin privileges required.");
        tinroRouter.goto('/dashboard', { replace: true });
      } else if (user && isLivePage && !user.premium_status) {
        toast.error("This is a premium feature. Please subscribe to view live commentary.");
        tinroRouter.goto('/dashboard', { replace: true });
      }
    }
  });

  async function handleLogout() {
    try {
        await fetchPost('/auth/logout');
        clearUser();
        toast.success('Logout successful!');
        tinroRouter.goto('/', { replace: true });
    } catch (error) {
        toast.error(error.data?.message || 'Logout failed.');
    }
  }

</script>

{#if loading}
  <p>Loading application...</p>
{:else}
  <nav>
    <a href="/" use:active={{exact: true}}>Home</a>
    <a href="/races" use:active>Races</a>
    <a href="/rankings" use:active>Rankings</a>
    {#if user}
        <a href="/dashboard" use:active>Dashboard</a>
        {#if user.role === 'admin'}
            <a href="/admin" use:active>Admin Panel</a>
        {/if}
        <PremiumButton />
        <button class="logout-button" onclick={handleLogout}>Logout ({user.username})</button>
    {:else if !loading}
        <a href="/login" use:active>Login/Sign Up</a>
    {/if}
  </nav>

  <main>
      <Route path="/"> <HomePage /> </Route>
      <Route path="/races"> <RacesPage /> </Route>
      <Route path="/race/:stageId" let:meta> <RaceDetailPage stageId={meta.params.stageId} /> </Route>
      <Route path="/rankings"> <RankingsPage /> </Route>
      <Route path="/login"> {#if isUserLoggedOut()} <LoginPage /> {/if} </Route>
      <Route path="/forgot-password"> {#if isUserLoggedOut()} <RequestPasswordResetPage /> {/if} </Route>
      <Route path="/reset-password"> {#if isUserLoggedOut()} <ResetPasswordPage /> {/if} </Route>
      <Route path="/dashboard"> {#if isUserLoggedIn()} <DashboardPage /> <PremiumContent /> {/if} </Route>
      <Route path="/admin"> {#if isUserAdmin()} <AdminPanelPage /> {/if} </Route>
      <Route path="/payment-success"> <PaymentSuccessPage /> </Route>
      
      <!-- Live Commentary Route with Guard -->
      <Route path="/race/live/:stageId" let:meta>
          {#if isUserPremium()}
              <LiveCommentaryPage stageId={meta.params.stageId} />
          {/if}
      </Route>

      <Route path="/*" fallback>
            <h2>404 - Not Found</h2>
            <a href="/">Go Home</a>
      </Route>
  </main>

  <Toaster position="bottom-center" />
{/if}

<style>
    /* Styles from your existing App.svelte */
    nav { display: flex; gap: 1rem; padding: 1rem; background-color: #f8f9fa; margin-bottom: 1rem; align-items: center; color: #343a40; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    nav a { color: #007bff; text-decoration: none; padding: 0.5rem 0; transition: color 0.2s ease-in-out, border-bottom 0.2s ease-in-out; }
    nav a:hover { text-decoration: none; color: #0056b3; }
    .logout-button { background: none; border: none; padding: 0.5rem 0; margin: 0; font: inherit; cursor: pointer; color: #dc3545; margin-left: auto; transition: color 0.2s ease-in-out; }
    .logout-button:hover { text-decoration: underline; color: #c82333; }
    main { padding: 1rem; max-width: 1200px; margin: 0 auto; }
    main h2 { color: #dc3545; text-align: center; margin-bottom: 1rem; }
    main p { text-align: center; margin-bottom: 1rem; }
    main a { display: block; text-align: center; color: #007bff; }</style>

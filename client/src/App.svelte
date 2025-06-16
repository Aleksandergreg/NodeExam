<script>
  import "./App.styles.css";
  import { Route, router as tinroRouter, active } from "tinro";
  import { toast } from "svelte-5-french-toast";

  import {
    user as userStore,
    loading as loadingStore,
    clearUser,
  } from "./stores/authStore.js";
  import { fetchPost } from "./utils/fetchApi.js";
  import HomePage from "./pages/Homepage/HomePage.svelte";
  import LoginPage from "./pages/LoginPage/LoginPage.svelte";
  import DashboardPage from "./pages/DashboardPage/DashboardPage.svelte";
  import RequestPasswordResetPage from "./pages/Auth/RequestPasswordResetPage.svelte";
  import ResetPasswordPage from "./pages/Auth/ResetPasswordPage.svelte";
  import RacesPage from "./pages/Race/RacesPage.svelte";
  import Toaster from "./components/Toaster/Toaster.svelte";
  import PremiumButton from "./components/Premium/PremiumButton.svelte";
  import PremiumContent from "./components/Premium/PremiumContent.svelte";
  import PaymentSuccessPage from "./pages/PaymentSuccessPage/PaymentSuccessPage.svelte";
  import RankingsPage from "./pages/Race/RankingsPage.svelte";
  import RaceDetailPage from "./pages/Race/RaceDetailPage.svelte";
  import AdminPanelPage from "./pages/Admin/AdminPanelPage.svelte";
  import LiveCommentaryPage from "./pages/Race/LiveCommentaryPage.svelte";
  import NewsPage from "./pages/News/NewsPage.svelte";
  import ArticleDiscussionPage from "./pages/News/ArticleDiscussionPage.svelte";
  import LocalSearchPage from "./pages/Race/LocalSearchPage.svelte";
  import Footer from "./components/Footer/Footer.svelte"; 


  let user = $state(null);
  let loading = $state(true);

  $effect(() => {
    const unsubUser = userStore.subscribe((value) => (user = value));
    const unsubLoading = loadingStore.subscribe((value) => (loading = value));
    return () => {
      unsubUser();
      unsubLoading();
    };
  });

  function isUserLoggedIn() {
    return !loading && !!user;
  }
  function isUserLoggedOut() {
    return !loading && !user;
  }
  function isUserAdmin() {
    return !loading && user?.role === "admin";
  }
  function isUserPremium() {
    return !loading && user?.premium_status;
  }

  $effect(() => {
    if (!loading) {
      const currentPath = $tinroRouter.path;
      const isAuthPage = ["/login", "/forgot-password", "/reset-password"].some(
        (p) => currentPath.startsWith(p)
      );
      const isAdminPage = currentPath.startsWith("/admin");
      const isLivePage = currentPath.startsWith("/race/live/");

      if (user && isAuthPage) {
        tinroRouter.goto("/dashboard", { replace: true });
      } else if (
        !user &&
        (currentPath === "/dashboard" || isAdminPage || isLivePage)
      ) {
        toast.error("Please log in to access this page.");
        tinroRouter.goto("/login", { replace: true });
      } else if (user && isAdminPage && user.role !== "admin") {
        toast.error("Access Denied: Admin privileges required.");
        tinroRouter.goto("/dashboard", { replace: true });
      } else if (user && isLivePage && !user.premium_status) {
        toast.error(
          "This is a premium feature. Please subscribe to view live commentary."
        );
        tinroRouter.goto("/dashboard", { replace: true });
      }
    }
  });

  async function handleLogout() {
    try {
      await fetchPost("/auth/logout");
      clearUser();
      toast.success("Logout successful!");
      tinroRouter.goto("/", { replace: true });
    } catch (error) {
      toast.error(error.data?.message || "Logout failed.");
    }
  }
</script>

{#if loading}
  <div class="loading-fullscreen">
    <p>Loading application...</p>
  </div>
{:else}
  <header class="app-header">
    <nav class="app-nav container">
      <div class="nav-left">
        <a href="/" use:active={{ exact: true }} class="nav-logo"
          >🚴 CyclingHub</a
        >
        <a href="/races" use:active>Races</a>
        <a href="/local-search" use:active>Search DB</a>
        <a href="/rankings" use:active>Rankings</a>
        <a href="/news" use:active>News</a>
        {#if user}
          <a href="/dashboard" use:active>Dashboard</a>
          {#if user.role === "admin"}
            <a href="/admin" use:active>Admin Panel</a>
          {/if}
        {/if}
      </div>
      <div class="nav-right">
        {#if user}
          <PremiumButton />
          <button class="logout-button" onclick={handleLogout}
            >Logout ({user.username})</button
          >
        {:else if !loading}
          <a href="/login" use:active class="btn btn-primary">Login / Sign Up</a
          >
        {/if}
      </div>
    </nav>
  </header>

  <main class="container">
    <Route path="/*">
      <Route path="/"><HomePage /></Route>

      <Route path="/races"><RacesPage /></Route>

      <Route path="/local-search"><LocalSearchPage /></Route>

      <Route path="/race/:stageId" let:meta>
        <RaceDetailPage stageId={meta.params.stageId} />
      </Route>

      <Route path="/rankings"><RankingsPage /></Route>

      <Route path="/login">
        {#if isUserLoggedOut()}
          <LoginPage />
        {/if}
      </Route>

      <Route path="/forgot-password">
        {#if isUserLoggedOut()}
          <RequestPasswordResetPage />
        {/if}
      </Route>

      <Route path="/reset-password">
        {#if isUserLoggedOut()}
          <ResetPasswordPage />
        {/if}
      </Route>

      <Route path="/dashboard">
        {#if isUserLoggedIn()}
          <DashboardPage />
          <PremiumContent />
        {/if}
      </Route>

      <Route path="/admin">
        {#if isUserAdmin()}
          <AdminPanelPage />
        {/if}
      </Route>

      <Route path="/payment-success"><PaymentSuccessPage /></Route>

      <Route path="/race/live/:stageId" let:meta>
        {#if isUserPremium()}
          <LiveCommentaryPage stageId={meta.params.stageId} />
        {/if}
      </Route>

      <Route path="/news"><NewsPage /></Route>

      <Route path="/news/:id" let:meta>
        <ArticleDiscussionPage articleId={meta.params.id} />
      </Route>

      <Route fallback>
        <div class="not-found">
          <h2>404 – Not Found</h2>
          <p>The page you're looking for doesn't seem to exist.</p>
          <a href="/" class="btn btn-primary">Go Home</a>
        </div>
      </Route>
    </Route>
  </main>

  <Footer />
  <Toaster position="bottom-center" />
{/if}
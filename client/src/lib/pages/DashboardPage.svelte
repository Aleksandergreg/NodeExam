<script>
    import { authStore } from '../stores/authStore.js';
    import { fetchGet, fetchPost } from '../utils/fetchApi.js';
    import { toast } from 'svelte-5-french-toast';
    import { onMount } from 'svelte'; // Use onMount for initial data fetching

    let dashboardMessage = $state('Loading dashboard data...');
    let adminMessage = $state('');
    let isLoadingData = $state(false);

    async function fetchDashboardData() {
         isLoadingData = true;
        try {
            const data = await fetchGet('/protected/dashboard-data');
            dashboardMessage = data.message || 'Successfully loaded dashboard data.';
        } catch (error) {
             dashboardMessage = `Error loading dashboard: ${error.data?.message || error.message || 'Unknown error'}`;
            toast.error(dashboardMessage);
        } finally {
             isLoadingData = false;
        }
    }

     // Example function to call an admin-only route
     async function fetchAdminData() {
         isLoadingData = true;
         adminMessage = 'Attempting to access admin data...';
         try {
             const data = await fetchGet('/protected/admin-only');
             adminMessage = data.message || 'Successfully accessed admin data.';
             toast.success('Admin access successful!');
         } catch (error) {
             adminMessage = `Admin access failed: ${error.data?.message || error.message || 'Unknown error'}`;
             // Don't necessarily show an error toast unless it's unexpected
             // toast.error('Admin access denied.'); // Could be too noisy
             console.warn("Admin access attempt result:", adminMessage);
         } finally {
             isLoadingData = false;
         }
     }


    // Fetch data when the component mounts
    onMount(() => {
         fetchDashboardData();
         // Optionally try fetching admin data if the user *might* be an admin
         // This demonstrates how protected routes respond
         if (authStore.user?.role === 'admin') {
             fetchAdminData();
         } else {
             adminMessage = 'You do not have admin privileges stored in the frontend state.';
         }
    });

</script>

<h2>User Dashboard</h2>

{#if authStore.loading}
    <p>Checking authentication status...</p>
{:else if authStore.user}
    <p>Welcome, <strong>{authStore.user.username}</strong>! (Role: {authStore.user.role || 'user'})</p>
    <p>Dashboard Status: {dashboardMessage}</p>

     {#if isLoadingData}
        <p><i>Loading more data...</i></p>
     {/if}

     {#if authStore.user.role === 'admin'}
          <button onclick={fetchAdminData} disabled={isLoadingData}>Fetch Admin Data</button>
          {#if adminMessage}<p>Admin Area Status: {adminMessage}</p>{/if}
     {:else}
          <p><i>Admin actions are not available for your role.</i></p>
          {/if}


{:else}
    <p>Error: You should not be able to see this page unless logged in.</p>
     {/if}
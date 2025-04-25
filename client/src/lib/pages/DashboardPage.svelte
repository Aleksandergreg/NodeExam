<script>
    import { user, loading } from '../stores/authStore.js'; // Corrected import
    import { fetchGet } from '../utils/fetchApi.js'; // Ensure path is correct
    import { toast } from 'svelte-5-french-toast';
    import { onMount } from 'svelte';

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

     async function fetchAdminData() {
         isLoadingData = true;
         adminMessage = 'Attempting to access admin data...';
         try {
             const data = await fetchGet('/protected/admin-only');
             adminMessage = data.message || 'Successfully accessed admin data.';
             toast.success('Admin access successful!');
         } catch (error) {
             adminMessage = `Admin access failed: ${error.data?.message || error.message || 'Unknown error'}`;
             console.warn("Admin access attempt result:", adminMessage);
         } finally {
             isLoadingData = false;
         }
     }

    // Fetch data when the component mounts
    onMount(() => {
         fetchDashboardData();
         // Check the role using the reactive $user store value
         if ($user?.role === 'admin') { // Use $user here
             fetchAdminData();
         } else {
             adminMessage = 'You do not have admin privileges according to the auth store.';
         }
    });

</script>

<h2>User Dashboard</h2>

{#if $loading}
    <p>Checking authentication status...</p>
{:else if $user}
    <p>Welcome, <strong>{$user.username}</strong>! (Role: {$user.role || 'user'})</p>
    <p>Dashboard Status: {dashboardMessage}</p>

     {#if isLoadingData}
        <p><i>Loading dashboard/admin data...</i></p>
     {/if}

     {#if $user.role === 'admin'}
          <button onclick={fetchAdminData} disabled={isLoadingData}>Fetch Admin Data</button>
          {#if adminMessage}<p>Admin Area Status: {adminMessage}</p>{/if}
     {:else}
          <p><i>Admin actions are not available for your role.</i></p>
          {#if adminMessage}<p>Admin Check Status: {adminMessage}</p>{/if} {/if}

{:else}
    <p>Error: You are not logged in. Access denied.</p>
{/if}
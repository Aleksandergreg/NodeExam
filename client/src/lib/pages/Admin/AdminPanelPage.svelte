<script>
    import { onMount } from 'svelte';
    import { fetchGet, fetchPut } from '../../utils/fetchApi.js';
    import { toast } from 'svelte-5-french-toast';

    let users = $state([]);
    let isLoading = $state(true);
    let error = $state(null);

    async function fetchUsers() {
        isLoading = true;
        error = null;
        try {
            const data = await fetchGet('/admin/users');
            users = data.map(u => ({ ...u, isEditing: false, originalRole: u.role, originalPremium: u.premium_status }));
        } catch (err) {
            error = err.data?.message || 'Failed to load user data.';
            toast.error(error);
        } finally {
            isLoading = false;
        }
    }

    async function handleUpdateUser(user) {
        try {
            const response = await fetchPut(`/admin/users/${user.id}`, {
                role: user.role,
                premium_status: user.premium_status
            });
            
            const updatedUser = response.user;
            const index = users.findIndex(u => u.id === user.id);
            if (index !== -1) {
                users[index] = { ...users[index], ...updatedUser, isEditing: false, originalRole: updatedUser.role, originalPremium: updatedUser.premium_status };
            }
            toast.success(`User '${user.username}' updated!`);
        } catch (err) {
            toast.error(err.data?.message || 'Failed to update user.');
            cancelEdit(user);
        }
    }

    function cancelEdit(user) {
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
            users[index].role = users[index].originalRole;
            users[index].premium_status = users[index].originalPremium;
            users[index].isEditing = false;
        }
    }

    onMount(fetchUsers);
</script>

<style>
    .admin-container { padding: 1rem; }
    .admin-container h1 { text-align: center; color: #343a40; margin-bottom: 2rem; }
    .loading, .error { text-align: center; font-size: 1.2rem; padding: 2rem; }
    .error { color: #dc3545; }
    .table-responsive { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; min-width: 800px; }
    th, td { padding: 12px 15px; border: 1px solid #dee2e6; text-align: left; }
    th { background-color: #f8f9fa; font-weight: bold; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    select, input, button {
        padding: 6px 10px; border-radius: 4px; border: 1px solid #ced4da;
        background-color: #fff; color: #495057; font-size: 0.95em;
    }
    button { cursor: pointer; margin-right: 5px; }
    .btn-save { background-color: #28a745; color: white; border-color: #28a745; }
    .btn-cancel { background-color: #6c757d; color: white; border-color: #6c757d; }
    .btn-edit { background-color: #007bff; color: white; border-color: #007bff; }
</style>

<div class="admin-container">
    <h1>Admin Panel - User Management</h1>

    {#if isLoading}
        <p class="loading">Loading users...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Premium</th>
                        <th>Expiry Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {#each users as user (user.id)}
                        <tr>
                            <td>{user.id}</td>
                            <td>{user.username}</td>
                            <td>{user.email}</td>
                            <td>
                                {#if user.isEditing}
                                    <select bind:value={user.role}>
                                        <option value="user">User</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                {:else}
                                    {user.role}
                                {/if}
                            </td>
                            <td>
                                {#if user.isEditing}
                                    <input type="checkbox" bind:checked={user.premium_status} />
                                {:else}
                                    {user.premium_status ? 'Yes' : 'No'}
                                {/if}
                            </td>
                            <td>{user.premium_expiry_date || 'N/A'}</td>
                            <td>
                                {#if user.isEditing}
                                    <button class="btn-save" onclick={() => handleUpdateUser(user)}>Save</button>
                                    <button class="btn-cancel" onclick={() => cancelEdit(user)}>Cancel</button>
                                {:else}
                                    <button class="btn-edit" onclick={() => user.isEditing = true}>Edit</button>
                                {/if}
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    {/if}
</div>
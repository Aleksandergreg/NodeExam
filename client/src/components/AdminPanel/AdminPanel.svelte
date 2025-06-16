<script>
    import '../../styles/AdminPanel.css';
    import { onMount } from 'svelte';
    import { fetchGet, fetchPut } from '../../utils/fetchApi';
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
            error = err.data?.message || 'Failed to load user data. You must be an admin to view this page.';
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
            toast.success('User updated successfully!');
        } catch (err) {
            toast.error(err.data?.message || 'Failed to update user.');
            cancelEdit(user); // 
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

<div class="admin-panel-container">
    <h1>User Management</h1>

    {#if isLoading}
        <p class="loading">Loading users...</p>
    {:else if error}
        <p class="error">{error}</p>
    {:else}
        <div class="card">
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
                                        <span class:premium-yes={user.premium_status} class:premium-no={!user.premium_status}>
                                            {user.premium_status ? 'Yes' : 'No'}
                                        </span>
                                    {/if}
                                </td>
                                <td>{user.premium_expiry_date || 'N/A'}</td>
                                <td>
                                    <div class="action-buttons">
                                        {#if user.isEditing}
                                            <button class="btn btn-success" onclick={() => handleUpdateUser(user)}>Save</button>
                                            <button class="btn btn-secondary" onclick={() => cancelEdit(user)}>Cancel</button>
                                        {:else}
                                            <button class="btn btn-primary" onclick={() => user.isEditing = true}>Edit</button>
                                        {/if}
                                    </div>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    {/if}
</div>
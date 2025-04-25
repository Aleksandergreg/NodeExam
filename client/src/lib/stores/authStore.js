// src/lib/stores/authStore.js (Corrected Export Structure)
import { writable } from 'svelte/store';
import { fetchGet } from '../utils/fetchApi.js'; // Make sure path is correct

// Create writable stores for user and loading state
export const user = writable(null); // Export store directly
export const loading = writable(true); // Export store directly

// Function to check session status on app load or refresh
async function checkSession() {
    loading.set(true);
    try {
        const data = await fetchGet('/auth/session');
        if (data.loggedIn && data.user) {
            user.set(data.user);
            console.log("Session check: Logged in as", data.user.username);
        } else {
            user.set(null);
            console.log("Session check: Not logged in.");
        }
    } catch (error) {
        console.error("Failed to check session:", error);
        user.set(null);
    } finally {
        loading.set(false);
    }
}

// Function to update user state after login/signup
// Export action functions directly
export function setUser(userData) {
    user.set(userData);
    console.log("AuthStore: User set", userData);
}

// Function to clear user state on logout
// Export action functions directly
export function clearUser() {
    user.set(null);
    console.log("AuthStore: User cleared");
}

// Run checkSession once when the module is first imported
checkSession();

// Optionally export checkSession if needed elsewhere
export { checkSession };
import { fetchGet } from '../utils/fetchApi.js';

let currentUser = $state(null); // Holds user object { id, username, role } or null
let isLoading = $state(true); // Track initial loading state

// Function to check session status on app load or refresh
async function checkSession() {
    isLoading = true;
    try {
        const data = await fetchGet('/auth/session');
        if (data.loggedIn && data.user) {
            currentUser = data.user;
            console.log("Session check: Logged in as", data.user.username);
        } else {
            currentUser = null;
            console.log("Session check: Not logged in.");
        }
    } catch (error) {
        console.error("Failed to check session:", error);
        currentUser = null; // Assume not logged in on error
    } finally {
        isLoading = false;
    }
}

// Function to update user state after login/signup
function setUser(userData) {
    currentUser = userData;
     console.log("AuthStore: User set", userData);
}

// Function to clear user state on logout
function clearUser() {
    currentUser = null;
     console.log("AuthStore: User cleared");
}

// Run checkSession once when the store is initialized
checkSession();

// Export state and actions
export const authStore = {
    get user() { return currentUser; },
    get loading() { return isLoading; },
    setUser,
    clearUser,
    checkSession // Expose checkSession if needed elsewhere
};
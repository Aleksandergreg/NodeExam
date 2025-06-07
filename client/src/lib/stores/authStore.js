import { writable } from 'svelte/store';
import { fetchGet } from '../utils/fetchApi.js';

export const user = writable(null);
export const loading = writable(true);

async function checkSession() {
    loading.set(true);
    try {
        const data = await fetchGet('/auth/session');
        if (data.loggedIn && data.user) {
            user.set(data.user);
        } else {
            user.set(null);
        }
    } catch (error) {
        console.error("Failed to check session:", error);
        user.set(null);
    } finally {
        loading.set(false);
    }
}

export function setUser(userData) {
    user.set(userData);
}

export function clearUser() {
    user.set(null);
}

checkSession();

export { checkSession };
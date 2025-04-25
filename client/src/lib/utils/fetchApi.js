// Simple fetch wrapper - enhance as needed (error handling, etc.)
const BASE_URL = 'http://localhost:8080'; // Your backend URL

async function fetchApi(path, options = {}) {
    const url = `<span class="math-inline">\{BASE\_URL\}</span>{path}`;

    // Ensure credentials (cookies) are sent with requests
    options.credentials = 'include';

    // Default headers if not provided
    options.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers, // Allow overriding headers
    };

    // Stringify body if it's an object
    if (options.body && typeof options.body === 'object') {
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(url, options);

        // Attempt to parse JSON, handle cases with no content (e.g., 204)
        let data = null;
        if (response.status !== 204) {
            try {
                data = await response.json();
            } catch (e) {
                // Handle cases where response is not JSON (e.g., plain text error)
                console.warn(`Response from ${url} was not valid JSON.`);
                // Optionally try to read as text: data = await response.text();
            }
        }


        if (!response.ok) {
            // Throw an error object including the status and parsed data (if any)
            // The calling code can then access error.status and error.data
            const error = new Error(data?.message || `HTTP error! status: ${response.status}`);
            error.status = response.status;
            error.data = data; // Attach parsed error data
            throw error;
        }

        // Return parsed data for successful responses
        return data;

    } catch (error) {
        console.error(`API Fetch Error (${options.method || 'GET'} ${path}):`, error);
        // Re-throw the error so the calling component can handle it
        throw error;
    }
}

// Helper methods for common request types
export const fetchGet = (path, options = {}) => fetchApi(path, { ...options, method: 'GET' });
export const fetchPost = (path, body, options = {}) => fetchApi(path, { ...options, method: 'POST', body });
export const fetchPut = (path, body, options = {}) => fetchApi(path, { ...options, method: 'PUT', body });
export const fetchDelete = (path, options = {}) => fetchApi(path, { ...options, method: 'DELETE' });
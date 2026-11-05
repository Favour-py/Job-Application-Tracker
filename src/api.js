export const fetchWithAuth = async (url, options, accessToken, setAccessToken) => {
    const isFormData = options.body instanceof FormData;
    const headers = {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        "Authorization": `Bearer ${accessToken}`,
        ...( !isFormData && options.headers),
    };

    const response = await fetch(url, {
        ...options,
        credentials: "include",
        headers
    });

    if (response.status === 401) {
        console.log("Access token expired or invalid. Please log in again.");

        const refreshResponse = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/refresh/`, {
            method: "POST",
            credentials: "include"
        });

        const refreshData = await refreshResponse.json();

        if (!refreshResponse.ok) {
            throw new Error("Refresh token expired or invalid. Please log in again.");
        }

        setAccessToken(refreshData.access);

        const retryResponse = await fetch(url, {
            ...options,
            credentials: "include",
            headers: {
                ...(isFormData ? {} : { "Content-Type": "application/json" }),
                "Authorization": `Bearer ${refreshData.access}`,
            }
        });

        if (!retryResponse.ok) {
            const errorData = await retryResponse.json().catch(() => ({}));
            console.error("Retry failed:", retryResponse.status, errorData);
            throw new Error("Retry request failed");
        }

        return retryResponse.status === 204 ? null : retryResponse.json();
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Request failed:", response.status, errorData);
        throw new Error("Failed to fetch data");
    }

    return response.status === 204 ? null : response.json();
};
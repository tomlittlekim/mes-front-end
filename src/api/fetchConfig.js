import { REST_URL, GRAPHQL_URL } from '../config';

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE";
type FetchOptions = Omit<RequestInit, "method" | "headers" | "body">;

const createFetch = (withAuth = true) => {
    const base = async <T>(
        method: FetchMethod,
        path: string,
        data?: any,
        options?: FetchOptions
    ): Promise<T> => {
        const headers = {
            "Content-Type": "application/json",
        };

        const fetchOptions: RequestInit = {
            method,
            headers,
            credentials: withAuth ? "include" : "same-origin",
            ...options,
        };

        if (data && method !== "GET") {
            fetchOptions.body = JSON.stringify(data);
        }

        const url = method === "GET" && data
            ? `${REST_URL}${path}?${new URLSearchParams(data).toString()}`
            : `${REST_URL}${path}`;

        const response = await fetch(url, fetchOptions);
        console.log(response);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }


        return response;
    };

    return {
        get: (path, params, options) => base("GET", path, params, options),
        post: (path, body, options) => base("POST", path, body, options),
        put: (path, body, options) => base("PUT", path, body, options),
        delete: (path, body, options) => base("DELETE", path, body, options),
    };
};

export const dontLoginFetch = createFetch(true);
export const apiFetch = createFetch(false);

interface GraphQLRequest {
    query: string;
    variables?: Record<string, any>;
}

export const graphFetch = async <T>(
    body: GraphQLRequest,
    options?: FetchOptions
): Promise<T> => {
    const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(body),
        ...options,
    };

    const response = await fetch(GRAPHQL_URL, fetchOptions);

    if (!response.ok) {
        throw new Error(`GraphQL HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
        console.error("GraphQL Errors:", json.errors);
        throw new Error(json.errors[0]?.message || "GraphQL Error");
    }

    return json.data;
};
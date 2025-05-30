import {handleTokenExpiration} from "../utils/auth";

type FetchMethod = "GET" | "POST" | "PUT" | "DELETE";
type FetchOptions = Omit<RequestInit, "method" | "headers" | "body">;

const GRAPHQL_URL = 'http://localhost:8080/graphql';
const REST_URL = 'http://localhost:8080';

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

        const queryString = method === "GET" && data
            ? `?${new URLSearchParams(data).toString()}`
            : "";

        const relativeUrl = `${path}${queryString}`;
        const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
        const fullUrl = isLocalhost ? REST_URL + relativeUrl : relativeUrl;

        const response = await fetch(fullUrl, fetchOptions);

        if (!response.ok) {
            const isUnAuthorized = (response?.status === 401)
            if (isUnAuthorized) handleTokenExpiration();
            console.error(`HTTP error! status: ${response.status}`);
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
export const apiFetch = createFetch(true);
export const initialFetch = async <T>(
    method: FetchMethod,
    path: string,
    data?: any,
    customHeaders?: Record<string, string>,
    options?: FetchOptions
): Promise<T> => {
    const defaultHeaders = {
        "Content-Type": "application/json",
    };

    const fetchOptions: RequestInit = {
        method,
        headers: customHeaders || defaultHeaders,
        credentials: "include",
        ...options,
    };

    if (data && method !== "GET") {
        fetchOptions.body = JSON.stringify(data);
    }

    const queryString = method === "GET" && data
        ? `?${new URLSearchParams(data).toString()}`
        : "";

    const relativeUrl = `${path}${queryString}`;
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const fullUrl = isLocalhost ? REST_URL + relativeUrl : relativeUrl;

    const response = await fetch(fullUrl, fetchOptions);

    if (!response.ok) {
        const isUnAuthorized = (response?.status === 401)
        if (isUnAuthorized) handleTokenExpiration();
        console.error(`HTTP error! status: ${response.status}`);
    }

    return response;
};

// query, mutation 모두 동작함
export const graphFetch = async <T>(
    body: string, // query || mutation
    variables?: Record<string, any>,
    options?: FetchOptions
): Promise<T> => {
    const fetchOptions: RequestInit = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ query: body, variables }),
        ...options,
    };

    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    const url = isLocalhost ? GRAPHQL_URL : "/graphql";
    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        const isUnAuthorized = (response?.status === 401)
        if (isUnAuthorized) handleTokenExpiration();
        console.error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();

    if (json.errors) {
        console.error(json.errors[0]?.message || "GraphQL Error");
    }

    return json.data;
};
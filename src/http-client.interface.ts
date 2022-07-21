/**
 * HttpClient interface can be used for providing a custom client responsible
 * for executing GET and POST requests against Pinot Controllers and Brokers.
 */
export interface HttpClient {
    /**
     * Executes a HTTP GET request at a specified url.
     * Used for sending requests to Pinot Controllers.
     */
    get: <T>(
        url: string,
        options: {
            headers: Record<string, string>;
        }
    ) => Promise<HttpClientResponse<T>>;
    /**
     * Executes a HTTP POST request at a specified url
     * Used for querying Pinot Brokers.
     */
    post: <T>(
        url: string,
        data: object,
        options: {
            headers: Record<string, string>;
        }
    ) => Promise<HttpClientResponse<T>>;
}

export interface HttpClientResponse<T> {
    /**
     * Parsed data from the HTTP response body
     */
    data: T;
    /**
     * HTTP response status code
     */
    status: number;
}

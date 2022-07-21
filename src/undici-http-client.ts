import { Agent, request } from "undici";
import { HttpClient } from "./http-client.interface";

export class UndiciHttpClient implements HttpClient {
    private agent: Agent;
    constructor() {
        this.agent = new Agent({ pipelining: 1 });
    }
    public async post(url: string, data: object, options: { headers: Record<string, string> }) {
        const reqBody = JSON.stringify(data);
        const { statusCode, body } = await request(url, {
            ...options,
            dispatcher: this.agent,
            method: "POST",
            body: reqBody,
        });
        const respData = await body.json();
        return { data: respData, status: statusCode };
    }
    public async get(
        url: string,
        options: {
            headers: Record<string, string>;
        }
    ) {
        const { statusCode, body } = await request(url, { ...options, dispatcher: this.agent });
        const data = await body.json();
        return { data, status: statusCode };
    }
}

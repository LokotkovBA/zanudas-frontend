import { getBackendAddress } from "./environment";
import headers from "./headers";

export const BACKEND_ADDRESS = getBackendAddress();

export function getRequest(address: string, port: string, abort_signal: AbortSignal) {
    return fetch(`https://${BACKEND_ADDRESS}:${port}/${address}`, {
        method: "GET",
        credentials: "include",
        headers: headers,
        signal: abort_signal
    });
}

export function postRequest(address: string, port: number | string, body: string) {
    return fetch(`https://${BACKEND_ADDRESS}:${port}/${address}`, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: body,
    });
}
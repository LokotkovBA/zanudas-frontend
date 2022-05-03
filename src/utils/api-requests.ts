import headers from "./headers";

export function getRequest(address: string, port: string) {

    return fetch(`http://localhost:${port}/${address}`, {
        method: "GET",
        credentials: "include",
        headers: headers
    });
}

export function postRequest(address: string, port: number | string, body: string) {
    return fetch(`http://localhost:${port}/${address}`, {
        method: "POST",
        credentials: "include",
        headers: headers,
        body: body,
    });
}
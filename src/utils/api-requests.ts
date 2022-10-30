import axios from "axios";
import { getBackendAddress } from "./environment";
import headers from "./headers";

export const BACKEND_ADDRESS = getBackendAddress();

export function getRequest(address: string, port: number | string) {
    return axios.get(`https://${BACKEND_ADDRESS}:${port}/${address}`, {
        withCredentials: true,
        headers: headers
    })
};

export function postRequest(address: string, port: number | string, body: any) {
    return axios.post(`https://${BACKEND_ADDRESS}:${port}/${address}`, body, {
        withCredentials: true,
        headers: headers
    });
};

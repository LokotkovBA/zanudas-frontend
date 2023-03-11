import axios from 'axios';
import { getBackendAddress } from './environment';
import headers from './headers';

export const BACKEND_ADDRESS = getBackendAddress();

export function getRequest(address: string) {
    return axios.get(`https://${BACKEND_ADDRESS}/${address}`, {
        withCredentials: true,
        headers: headers
    });
}

export function postRequest(address: string, body: any) {
    return axios.post(`https://${BACKEND_ADDRESS}/${address}`, body, {
        withCredentials: true,
        headers: headers
    });
}

export function putRequest(address: string, body: any) {
    return axios.put(`https://${BACKEND_ADDRESS}/${address}`, body, {
        withCredentials: true,
        headers: headers
    });
}

export function patchRequest(address: string, body: any) {
    return axios.patch(`https://${BACKEND_ADDRESS}/${address}`, body, {
        withCredentials: true,
        headers: headers
    });
}

export function deleteRequest<T extends {}>(address: string, data?: T) {
    let params = '';
    if (data) {
        for (const [key, value] of Object.entries(data)) {
            params += `${key}=${value}&`;
        }
        params = params.slice(0, -1);
    }

    return axios.delete(`https://${BACKEND_ADDRESS}/${address}?${params}`, {
        withCredentials: true,
        headers: headers
    });
}

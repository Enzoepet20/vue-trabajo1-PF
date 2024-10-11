import {  useAuthStore } from '../stores/authStore';

export const fetchWrapper = {
get: request ('GET'),
post: request ('POST'),
put: request ('PUT'),
delete: request ('DELETE')
};

function request(method: string) {
    return (url: string, body?: any, { credentials }: { credentials?: RequestCredentials } = {}) => {
        const requestOptions: RequestInit = {
            method, // Asegurar que el método se pasa correctamente
            headers: authHeader(url),
        };

        console.log("RequestOptions (antes del body): ", requestOptions);

        if (body) {
            requestOptions.headers = {
                ...requestOptions.headers,
                'Content-Type': 'application/json'
            };
            requestOptions.body = JSON.stringify(body);
        }

        if (credentials) {
            requestOptions.credentials = credentials;
        }

        console.log("RequestOptions (después de asignar body y credentials): ", requestOptions);

        return fetch(url, requestOptions).then(handleResponse);
    }
}

//helper functions

function authHeader(url:string): Record<string, string> {
const {auth} = useAuthStore();
const isLoggedIn = !!auth.data?.jwtToken;
const isApiUrl = url.startsWith(import.meta.env.VITE_API_URL);

if (isLoggedIn && isApiUrl) {
    return {Authorization: `Bearer ${auth.data?.jwtToken}`};
} else {
    return {};
}
}

async function handleResponse(response: Response): Promise<any> {
    const text = await response.text();
    const data:any = text ? JSON.parse(text):null;

    if (!response.ok) {
const {auth, logout} = useAuthStore();
if ([401, 403].includes(response.status) && auth.data) {
    logout();
    }
const error = (data && data.message) || response.statusText;
return Promise.reject(error);

}             
return data;
}
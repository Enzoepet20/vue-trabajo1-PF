export { fakeBackend };

import type { User } from '@/models/User';
import type { JwtPayload } from '@/models/JwtModel';
import type { AuthRequestBody } from '@/models/AuthReqModel';

// Array de usuarios en localstorage
const usersKey = 'vue-3-jwt-refresh-token-users';
const users: User[] = JSON.parse(localStorage.getItem(usersKey) || '[]');

// Definición de los usuarios
const user: User = {
    id: 1,
    firstName: 'Matias',
    lastName: 'Orellana',
    userName: 'test',
    password: 'test',
    isAdmin: true,
    jwtToken: '',
    remember: false,
    refreshTokens: []
};

const user2: User = {
    id: 2,
    firstName: 'Juan',
    lastName: 'Perez',
    userName: 'juanp',
    password: '1234',
    isAdmin: false,
    jwtToken: '',
    remember: false,
    refreshTokens: []
};

// Agregar usuarios al localStorage si no existen
if (!users.length) {
    users.push(user, user2); // Agregar ambos usuarios
    localStorage.setItem(usersKey, JSON.stringify(users));
}

function fakeBackend() {
    const realFetch = window.fetch;

    window.fetch = function (url, opts: RequestInit = {}): Promise<Response> {
        return new Promise((resolve, reject) => {
            setTimeout(handleRoute, 1000);

            function handleRoute() {
                const { method } = opts;

                switch (true) {
                    case url.toString().endsWith('/users/authenticate') && method === 'POST':
                        return authenticate();
                    case url.toString().endsWith('/users/refresh-token') && method === 'POST':
                        return refreshToken();
                    case url.toString().endsWith('/users/revoke-token') && method === 'POST':
                        return revokeToken();
                    case url.toString().endsWith('/users') && method === 'GET':
                        return getUsers();
                    default:
                        return realFetch(url, opts).then(response => resolve(response)).catch(error => reject(error));
                }
            }

            function authenticate() {
                const { username, password } = body<AuthRequestBody>();
                const user = users.find(x => x.userName === username && x.password === password);

                if (!user) return error('Usuario o contraseña incorrectos');

                user.jwtToken = generateJwtToken(); // Asignar nuevo JWT
                user.refreshTokens.push(generateRefreshToken());
                localStorage.setItem(usersKey, JSON.stringify(users));

                return ok({
                    id: user.id,
                    username: user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    jwtToken: user.jwtToken,
                });
            }

            function refreshToken() {
                const refreshToken = getRefreshToken();
                if (!refreshToken) return unauthorized();

                const user = users.find(x => x.refreshTokens.includes(refreshToken));
                if (!user) return unauthorized();

                // Reemplazar refresh token viejo por uno nuevo y guardar
                user.refreshTokens = user.refreshTokens.filter(x => x !== refreshToken);
                user.refreshTokens.push(generateRefreshToken());
                user.jwtToken = generateJwtToken();  // Generar un nuevo JWT
                localStorage.setItem(usersKey, JSON.stringify(users));

                return ok({
                    id: user.id,
                    username: user.userName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isAdmin: user.isAdmin,
                    jwtToken: user.jwtToken,
                });
            }

            function revokeToken() {
                if (!isLoggedIn()) return unauthorized();

                const refreshToken = getRefreshToken();
                const _user = users.find(x => x.refreshTokens.includes(refreshToken));

                if (_user) {
                    _user.refreshTokens = _user.refreshTokens.filter(x => x !== refreshToken);
                    if (_user.refreshTokens.length === 0) {
                        const index = users.findIndex(u => u.id === _user.id);
                        if (index !== -1) users.splice(index, 1);
                    }
                    localStorage.setItem(usersKey, JSON.stringify(users));
                }

                return ok({ msg: 'Token revocado' });
            }

            function getUsers() {
                if (!isLoggedIn()) return unauthorized();
                return ok(users);
            }

            // Auxiliares
            function ok(body: any) {
                resolve({ ok: true, text: () => Promise.resolve(JSON.stringify(body)) } as Response);
            }

            function unauthorized() {
                resolve({ status: 401, text: () => Promise.resolve(JSON.stringify({ message: 'Unauthorized' })) } as Response);
            }

            function error(message: string) {
                resolve({ status: 400, text: () => Promise.resolve(JSON.stringify({ message })) } as Response);
            }

            function isLoggedIn(): boolean {
                const authHeader = (opts?.headers as Record<string, string>)?.['Authorization'] || '';
                if (!authHeader.startsWith('Bearer fake-jwt-token')) return false;

                try {
                    const jwtToken = JSON.parse(atob(authHeader.split('.')[1])) as JwtPayload;
                    const tokenExpired = Date.now() > jwtToken.exp * 1000;
                    return !tokenExpired;
                } catch {
                    return false;
                }
            }

            function body<T>(): T {
                return opts && typeof opts.body === 'string' ? JSON.parse(opts.body) : {} as T;
            }

            function generateJwtToken(): string {
                const tokenPayload: JwtPayload = { exp: Math.round(Date.now() / 1000 + 2 * 60) };
                return `fake-jwt-token.${btoa(JSON.stringify(tokenPayload))}`;
            }

            function generateRefreshToken(): string {
                const token = new Date().getTime().toString();
                return token;
            }

            function getRefreshToken(): string {
                return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
            }
        });
    };
}

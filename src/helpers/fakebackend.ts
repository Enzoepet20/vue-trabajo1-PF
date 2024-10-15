export { fakeBackend };
import type { User } from '@/models/User';
import type { JwtPayload } from '@/models/JwtModel';
import type { AuthRequestBody } from '@/models/AuthReqModel';

// Array de usuarios en localStorage
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

export function getUsers(): User[] {
    return users;
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
                const refreshToken = generateRefreshToken();
                user.refreshTokens.push(refreshToken);
                localStorage.setItem(usersKey, JSON.stringify(users));
                setRefreshTokenCookie(refreshToken);

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
                const refreshToken = getRefreshTokenFromCookie(); // Obtener el refresh token de la cookie
                if (!refreshToken) return unauthorized();

                const user = users.find(x => x.refreshTokens.includes(refreshToken));
                if (!user) return unauthorized();

                // Reemplazar el refresh token viejo por uno nuevo
                user.refreshTokens = user.refreshTokens.filter(x => x !== refreshToken);
                const newRefreshToken = generateRefreshToken();
                user.refreshTokens.push(newRefreshToken);
                user.jwtToken = generateJwtToken();  // Generar un nuevo JWT
                localStorage.setItem(usersKey, JSON.stringify(users));
                setRefreshTokenCookie(newRefreshToken);

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
                const refreshToken = getRefreshTokenFromCookie();
                if (!refreshToken) return unauthorized(); // Verificar si hay un refresh token en la cookie

                const _user = users.find(x => x.refreshTokens.includes(refreshToken));

                if (_user) {
                    // Si existe el refresh token en el usuario, revocarlo
                    _user.refreshTokens = _user.refreshTokens.filter(x => x !== refreshToken);
                    localStorage.setItem(usersKey, JSON.stringify(users));
                    deleteRefreshTokenCookie(); // Eliminar el token de la cookie
                }

                return ok({ msg: 'Token revocado' });
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
                return Math.random().toString(36).substring(2);
            }

            function setRefreshTokenCookie(token: string) {
                const cookieExpiry = new Date();
                cookieExpiry.setDate(cookieExpiry.getDate() + 7); // Expira en 7 días
                document.cookie = `fakeRefreshToken=${token}; expires=${cookieExpiry.toUTCString()}; path=/`;
            }

            function getRefreshTokenFromCookie(): string {
                console.log('Cookies disponibles:', document.cookie); // Para verificar cookies
                return (document.cookie.split(';').find(x => x.includes('fakeRefreshToken')) || '=').split('=')[1];
            }

            function deleteRefreshTokenCookie() {
                document.cookie = 'fakeRefreshToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
            }
        });
    };
}

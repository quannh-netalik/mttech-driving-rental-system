import { AuthApi, HttpClient } from '@workspace/axios/api';
import { env } from '@/env/client';

const httpClient = new HttpClient({ baseURL: env.VITE_SERVER_URL });

const authApi = new AuthApi(httpClient);

export const { signIn } = authApi;

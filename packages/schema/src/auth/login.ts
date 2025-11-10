import { z } from 'zod';
import { vEmail, vPassword } from '../utils';

export const zLoginRequestSchema = z.object({
	email: vEmail,
	password: vPassword,
});

export type LoginRequestSchema = z.infer<typeof zLoginRequestSchema>;

export const zLoginResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.optional(z.string()),
});

export type LoginResponseSchema = z.infer<typeof zLoginResponseSchema>;

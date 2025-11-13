import { vEmail, vPassword } from '@workspace/schema/utils/_validation';
import { z } from 'zod';

export const zLoginRequestSchema = z.object({
	email: vEmail,
	password: vPassword,
});

export type LoginRequestSchema = z.infer<typeof zLoginRequestSchema>;

export const zLoginResponseSchema = z.object({
	accessToken: z.string(),
	refreshToken: z.string(),
});

export type LoginResponseSchema = z.infer<typeof zLoginResponseSchema>;

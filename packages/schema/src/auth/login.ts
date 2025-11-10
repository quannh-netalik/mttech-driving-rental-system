import z from 'zod';
import { vEmail, vPassword } from '../utils';

export const zLoginSchema = z.object({
	email: vEmail,
	password: vPassword,
});

export type LoginSchema = z.infer<typeof zLoginSchema>;

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import 'reflect-metadata';

const envBase = path.resolve(process.cwd(), '.env');
const NODE_ENV = process.env.NODE_ENV ?? 'local';

/**
 * Priority order (highest → lowest):
 *  1. .env.{NODE_ENV}.local
 *  2. .env.{NODE_ENV}
 *  3. .env.local  (only if NODE_ENV !== 'test')
 *  4. .env
 */
const dotenvFiles = [
	`${envBase}.${NODE_ENV}.local`,
	`${envBase}.${NODE_ENV}`,
	NODE_ENV !== 'test' ? `${envBase}.local` : null,
	envBase,
].filter((f): f is string => !!f && fs.existsSync(f));

for (const file of dotenvFiles) {
	const result = dotenv.config({ path: file, quiet: true });
	dotenvExpand.expand(result);
}

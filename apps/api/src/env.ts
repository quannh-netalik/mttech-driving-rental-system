import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import dotenvExpand from 'dotenv-expand';
import 'reflect-metadata';

// Make sure any symlinks in the project folder are resolved:
// https://github.com/facebookincubator/create-react-app/issues/637
const appDirectory = fs.realpathSync(process.cwd());
const envPath = path.resolve(appDirectory, '.env');

const NODE_ENV = process.env.NODE_ENV || 'local';

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
	`${envPath}.${NODE_ENV}.local`,
	`${envPath}.${NODE_ENV}`,
	// Don't include `.env.local` for `test` environment
	// since normally you expect tests to produce the same
	// results for everyone
	NODE_ENV !== 'test' && `${envPath}.local`,
	envPath,
].filter(Boolean);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.  Variable expansion is supported in .env files.
// https://github.com/motdotla/dotenv
// https://github.com/motdotla/dotenv-expand
dotenvFiles.forEach(dotenvFile => {
	if (typeof dotenvFile !== 'string') return;

	if (fs.existsSync(dotenvFile)) {
		dotenvExpand.expand(
			dotenv.config({
				path: dotenvFile,
			}),
		);
	}
});

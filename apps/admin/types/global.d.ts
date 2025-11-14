import type { QueryClient } from '@tanstack/react-query';
import type { ProfileSchema } from '@workspace/schema/src/user';

export declare global {
	interface RouterContext {
		queryClient: QueryClient;
		user?: ProfileSchema;
	}
}

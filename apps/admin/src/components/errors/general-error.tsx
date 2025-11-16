import { useNavigate, useRouter } from '@tanstack/react-router';
import { Button } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';

type GeneralErrorProps = React.HTMLAttributes<HTMLDivElement> & {
	minimal?: boolean;
};

/**
 * Renders a centered general error UI with an optional minimal layout.
 *
 * Displays an apology message and, when `minimal` is false, a large "500" heading and two action buttons:
 * "Go Back" (navigates one step back in history) and "Back to Home" (navigates to `/`).
 *
 * @param className - Additional CSS class names applied to the outer container.
 * @param minimal - If true, render a simplified view without the large status heading or action buttons.
 * @returns The rendered error UI as a React element.
 */
export function GeneralError({ className, minimal = false }: GeneralErrorProps) {
	const navigate = useNavigate();
	const { history } = useRouter();
	return (
		<div className={cn('h-svh w-full', className)}>
			<div className="m-auto flex h-full w-full flex-col items-center justify-center gap-2">
				{!minimal && <h1 className="text-[7rem] leading-tight font-bold">500</h1>}
				<span className="font-medium">Oops! Something went wrong {`:')`}</span>
				<p className="text-muted-foreground text-center">
					We apologize for the inconvenience. <br /> Please try again later.
				</p>
				{!minimal && (
					<div className="mt-6 flex gap-4">
						<Button onClick={() => history.go(-1)} variant="outline">
							Go Back
						</Button>
						<Button onClick={() => navigate({ to: '/' })}>Back to Home</Button>
					</div>
				)}
			</div>
		</div>
	);
}
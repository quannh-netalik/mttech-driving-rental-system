import { TriangleAlertIcon } from 'lucide-react';

export interface ErrorMessageProps {
	message?: string;
}

/**
 * Render an inline accessible error message with an alert icon when a message is provided.
 *
 * @param message - The error text to display; if omitted or empty, nothing is rendered.
 * @returns The alert `span` containing a triangle icon and the message, or `null` when no message is provided.
 */
export function ErrorMessage({ message }: Readonly<ErrorMessageProps>) {
	return (
		message && (
			<span aria-live="polite" className="text-red-400 text-sm font-medium flex gap-2 items-center" role="alert">
				<TriangleAlertIcon size={18} />
				{message}
			</span>
		)
	);
}
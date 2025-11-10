import { TriangleAlertIcon } from 'lucide-react';

export interface ErrorMessageProps {
	message?: string;
}

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

import { TriangleAlertIcon } from 'lucide-react';

export function ErrorMessage({ message }: Readonly<{ message?: string }>) {
	return (
		message && (
			<span className="text-red-400 text-sm font-medium flex gap-2 items-center">
				<TriangleAlertIcon size={18} />
				{message}
			</span>
		)
	);
}

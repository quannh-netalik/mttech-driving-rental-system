import type { ValueTransformer } from 'typeorm';

/**
 * Transformer for decimal/numeric columns in PostgreSQL
 * Converts between string (from DB) and number (in TypeScript)
 *
 * PostgreSQL returns decimal/numeric types as strings to preserve precision.
 * This transformer ensures type safety and automatic conversion.
 *
 * @example
 * ```ts
 * @Column({
 *   type: 'decimal',
 *   precision: 15,
 *   scale: 2,
 *   transformer: decimalTransformer,
 * })
 * amount!: number;
 * ```
 */
export const decimalTransformer: ValueTransformer = {
	/**
	 * Convert entity value (number) to database value (string)
	 * Called when saving to database
	 */
	to: (value: number | string | null | undefined): string | null => {
		if (value === null || value === undefined) {
			return null;
		}
		// Convert number to string for database storage
		return String(value);
	},

	/**
	 * Convert database value (string) to entity value (number)
	 * Called when reading from database
	 */
	from: (value: string | null | undefined): number | null => {
		if (value === null || value === undefined || value === '') {
			return null;
		}
		// Convert string from database to number
		const parsed = parseFloat(value);
		if (Number.isNaN(parsed)) {
			throw new Error(`Invalid decimal value: ${value}`);
		}
		return parsed;
	},
};

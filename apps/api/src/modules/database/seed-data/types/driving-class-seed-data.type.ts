import { CarCategory, CarStatus, CarType } from '../../entities';

/**
 * Seed data structure for a single car in a driving class
 */
export interface CarSeedData {
	type: CarType;
	category: CarCategory;
	status: CarStatus;
}

/**
 * Seed data structure for a driving class
 */
export interface DrivingClassSeedData {
	title: string;
	price: number;
	cars: CarSeedData[];
}

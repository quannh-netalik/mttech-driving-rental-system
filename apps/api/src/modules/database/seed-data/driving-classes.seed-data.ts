import { CarCategory, CarStatus, CarType } from '../entities';
import type { DrivingClassSeedData } from './types/driving-class-seed-data.type';

export const DRIVING_CLASSES_SEED_DATA: readonly DrivingClassSeedData[] = [
	{
		title: 'B',
		price: 500_000,
		cars: [
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.ON_ROAD,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.ON_ROAD,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
		],
	},
	{
		title: 'C1',
		price: 550_000,
		cars: [
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.ON_ROAD,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
			{
				type: CarType.MANUAL,
				category: CarCategory.ON_ROAD,
				status: CarStatus.AVAILABLE,
			},
		],
	},
	{
		title: 'D2',
		price: 600_000,
		cars: [
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
		],
	},
	{
		title: 'D',
		price: 600_000,
		cars: [
			{
				type: CarType.MANUAL,
				category: CarCategory.CLOSED_CIRCUIT,
				status: CarStatus.AVAILABLE,
			},
		],
	},
] as const;

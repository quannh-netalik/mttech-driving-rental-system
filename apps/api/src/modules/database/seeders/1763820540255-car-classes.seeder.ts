import { DataSource } from 'typeorm';
import { Seeder } from 'typeorm-extension';
import { CarEntity, ClassEntity } from '../entities';
import { DRIVING_CLASSES_SEED_DATA } from '../seed-data';

export default class CarClasses1763820540255 implements Seeder {
	track = false;

	public async run(dataSource: DataSource): Promise<void> {
		try {
			const classRepo = dataSource.getRepository(ClassEntity);
			const carRepo = dataSource.getRepository(CarEntity);

			const classes = await classRepo.find();
			if (classes.length > 0) {
				return;
			}

			await dataSource.transaction(async manager => {
				const classData = DRIVING_CLASSES_SEED_DATA.map(({ title, price }) => {
					return manager.create(ClassEntity, {
						title,
						price,
						createdBy: { id: 1 },
					});
				});
				const newClasses = await manager.save(ClassEntity, classData);

				const carData: CarEntity[] = [];
				DRIVING_CLASSES_SEED_DATA.forEach(({ cars }, index) => {
					for (const car of cars) {
						const carEntity = carRepo.create({
							class: newClasses[index],
							...car,
						});

						carData.push(carEntity);
					}
				});
				const newCars = await manager.save(CarEntity, carData);

				return {
					newClasses,
					newCars,
				};
			});
		} catch (error) {
			console.error('Error in CarClasses1763820540255 seeder:', error);
			throw error;
		}
	}
}

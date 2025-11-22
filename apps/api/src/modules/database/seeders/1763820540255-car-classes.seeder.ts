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

			for (const { title, price, cars } of DRIVING_CLASSES_SEED_DATA) {
				const classData = classRepo.create({
					title: title,
					price: price,
				});
				await classRepo.save(classData);

				for (const car of cars) {
					const carData = carRepo.create({
						class: classData,
						type: car.type,
						category: car.category,
						status: car.status,
					});
					await carRepo.save(carData);
				}
			}
		} catch (error) {
			console.error('Error in CarClasses1763820540255 seeder:', error);
			throw error;
		}
	}
}

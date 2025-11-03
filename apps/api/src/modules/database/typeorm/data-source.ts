import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source.option';

export default new DataSource(AppDataSource);

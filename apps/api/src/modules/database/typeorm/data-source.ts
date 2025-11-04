import { DataSource } from 'typeorm';
import { AppDataSource } from './data-source.factory';

export default new DataSource(AppDataSource);

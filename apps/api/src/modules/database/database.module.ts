import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppDataSource } from './typeorm/data-source.option';

@Module({
  imports: [TypeOrmModule.forRoot(AppDataSource)],
})
export class DatabaseModule {}

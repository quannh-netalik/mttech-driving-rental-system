import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { createDataSourceOptions, dataSourceConfig } from './typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          load: [dataSourceConfig],
        }),
      ],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        createDataSourceOptions(configService),
    }),
  ],
})
export class DatabaseModule {}

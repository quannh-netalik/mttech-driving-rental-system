import { Provider } from '@nestjs/common';
import { TypeOrmHealthIndicator } from '@nestjs/terminus';

const timeout = 5000;

export const DatabaseHealthCheckProvider: Provider = {
  provide: Symbol.for('Health.Database'),

  useFactory: (db: TypeOrmHealthIndicator) => {
    return () => db.pingCheck('database', { timeout });
  },

  inject: [TypeOrmHealthIndicator],
};

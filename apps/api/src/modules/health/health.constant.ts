import { InjectionToken } from '@nestjs/common';

export const HEALTH_CHECKS: InjectionToken = Symbol.for('Health.Checks');

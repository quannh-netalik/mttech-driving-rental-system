import { RawRequestDefaultExpression, RawServerBase } from 'fastify';
import { nanoid } from 'nanoid';
import { Params as PinoParams } from 'nestjs-pino';

export const genReqId = (req: RawRequestDefaultExpression<RawServerBase>) =>
  <string>req.headers['X-Request-Id'] || nanoid();

export const loggerConfig: PinoParams = {
  pinoHttp: {
    autoLogging: true,
    transport: { target: 'pino-pretty' },
    serializers: {
      req: req => ({
        id: req.id,
        ip: req.ip,
        hostname: req.hostname,
        method: req.method,
        url: req.url,
        query: req.query,
        params: req.params,
        ['user-agent']: req.headers['user-agent'],
      }),
      res: res => ({
        statusCode: res.statusCode,
      }),
    },
  },
  exclude: ['/metrics', '/health', '/.well-known'],
};

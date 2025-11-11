import { RawRequestDefaultExpression, RawServerBase } from "fastify";
import { nanoid } from "nanoid";

export const genReqId = (req: RawRequestDefaultExpression<RawServerBase>) =>
  <string>req.headers['X-Request-Id'] || nanoid();
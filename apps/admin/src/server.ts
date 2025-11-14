import type { Register } from "@tanstack/react-router";
import type { RequestHandler } from "@tanstack/react-start/server";
import {
  createStartHandler,
  defaultStreamHandler,
  getCookie,
  getRequestHeader,
  getRequestHeaders,
} from "@tanstack/react-start/server";

const fetch = createStartHandler(defaultStreamHandler);

export default {
  fetch: fetch as RequestHandler<Register>,
};

// Add required server functions to the `globalThis`.
globalThis.tanstackStartServer = {
  getRequestHeader,
  getRequestHeaders,
  getCookie,
};

declare global {
  var tanstackStartServer: {
    getRequestHeader: typeof getRequestHeader;
    getRequestHeaders: typeof getRequestHeaders;
    getCookie: typeof getCookie;
  };
}

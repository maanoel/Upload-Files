import { logger } from "./logger.mjs";

export default class Routes {
  constructor() {}

  setSocketInstance(io) {
    this.io = io;
  }
  async defaultRoute(request, response) {
    response.end("hello world");
  }

  async options(request, response) {
    response.writeHead(204);
    response.end("hello world");
  }

  async post(request, response) {
    logger.info("post");
    response.end();
  }

  async get(request, response) {
    logger.info("get");
    response.end();
  }

  handler(request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    const chosen = this[request.method.toLowerCase()] || this.defaultRoute;
    //A linha acima atribui retorna uma função, que pode ser chamada assim: chosen()
    //Ou com o apply como abaixo
    return chosen.apply(this, [request, response]);
  }
}

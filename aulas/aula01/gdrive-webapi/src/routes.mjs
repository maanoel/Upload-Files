import { logger } from "./logger.mjs";
import FileHelper from "./fileHelper.mjs";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const defaultDownloadsFolder = resolve(__dirname, "../", "downloads");

export default class Routes {
  constructor(downloadsFolder = defaultDownloadsFolder) {
    this.downloadsFolder = downloadsFolder;
    this.fileHelper = FileHelper;
    this.io = {};
  }

  setSocketInstance(io) {
    this.io = io;
  }
  async defaultRoute(request, response) {
    response.end("hello world");
  }

  async options(request, response) {
    response.writeHead(204);
  }

  async post(request, response) {
    logger.info("post");
    response.end();
  }

  async get(request, response) {
    const files = await this.fileHelper.getFilesStatus(this.downloadsFolder);

    response.writeHead(200);
    response.end(JSON.stringify(files));
  }

  handler(request, response) {
    response.setHeader("Access-Control-Allow-Origin", "*");
    const chosen = this[request.method.toLowerCase()] || this.defaultRoute;
    //A linha acima atribui retorna uma função, que pode ser chamada assim: chosen()
    //Ou com o apply como abaixo
    return chosen.apply(this, [request, response]);
  }
}

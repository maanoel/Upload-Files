import Busboy from "busboy";
import { pipeline } from "stream/promises";
import fs from "fs";

export default class UploadHandler {
  constructor({ io, socketId, downloadsFolder }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
  }

  handlerFileBytes() {}

  async onFile(fieldName, file, fileName) {
    const saveTo = this.downloadsFolder + "/" + fileName;
    await pipeline(
      file,
      this.handlerFileBytes.apply(this, [fileName]),
      fs.createWriteStream(saveTo)
    );

    logger.info(`File [${fileName}] finished`);
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on("file", this.onFile.bind(this));
    busboy.on("finish", onFinish);

    return busboy;
  }
}

import Busboy from "busboy";
import { pipeline } from "stream/promises";
import fs from "fs";
import { logger } from "./logger.mjs";

export default class UploadHandler {
  constructor({ io, socketId, downloadsFolder, messageTimeDelay = 200 }) {
    this.io = io;
    this.socketId = socketId;
    this.downloadsFolder = downloadsFolder;
    this.ON_UPLOAD_EVENT = "file-upload";
    this.messageTimeDelay = messageTimeDelay;
  }

  canExecute(lastExecution) {
    return Date.now() - lastExecution > this.messageTimeDelay;
  }

  handlerFileBytes(fileName) {
    this.lastMessageSent = Date.now();

    async function* handlerData(source) {
      let processedAlready = 0;

      for await (const chunk of source) {
        yield chunk;
        processedAlready += chunk.length;

        if (!this.canExecute(this.lastMessageSent)) {
          continue;
        }

        this.io
          .to(this.socketId)
          .emit(this.ON_UPLOAD_EVENT, { processedAlready, fileName });

        logger.info(
          `File[${fileName}] got ${processedAlready} bytes to ${this.socketId}`
        );
      }
    }

    return handlerData.bind(this);
  }

  async onFile(fieldName, file, fileName) {
    const saveTo = this.downloadsFolder + "/" + fileName;
    await pipeline(
      //1- pega readable stream
      file,
      //2 filtrar e converter
      this.handlerFileBytes.apply(this, [fileName]),

      // é a saida, o writablestream
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

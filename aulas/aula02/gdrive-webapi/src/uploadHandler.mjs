import Busboy from "busboy";

export default class UploadHandler {
  constructor({ io, socketId }) {}

  onFile(fieldName, file, fileName) {
    console.log("onfile");
  }

  registerEvents(headers, onFinish) {
    const busboy = new Busboy({ headers });

    busboy.on("file", this.onFile.bind(this));
    busboy.on("finish", onFinish);

    return busboy;
  }
}

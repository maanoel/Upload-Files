import fs from "fs";

export default class FileHelper {
  static async getFilesStatus(downloadsFolder) {
    const currentFiles = await fs.promises.readdir(downloadsFolder);
  }
}

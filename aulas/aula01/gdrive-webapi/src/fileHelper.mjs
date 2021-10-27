import fs from "fs";
import prettyBytes from "pretty-bytes";

export default class FileHelper {
  static async getFilesStatus(downloadsFolder) {
    //O readdir lista o conteúdo de um direito retornando as informações dos arquivos em um array
    const currentFiles = await fs.promises.readdir(downloadsFolder);

    console.log("downloadsFolder: " + downloadsFolder);
    console.log("currentFiles: " + currentFiles);

    //o stat é utilizado para obter informações sobre um arquivo, dentre as informações, estão o birthtime e o size
    const statuses = await Promise.all(
      currentFiles.map((file) => fs.promises.stat(downloadsFolder + "/" + file))
    );

    const fileStatuses = [];

    for (const fileIndex in currentFiles) {
      console.log(statuses[fileIndex]);
      const { birthtime, size } = statuses[fileIndex];

      fileStatuses.push({
        size: prettyBytes(size),
        file: currentFiles[fileIndex],
        lastModified: birthtime,
        owner: process.env.USER,
      });
    }

    return fileStatuses;
  }
}

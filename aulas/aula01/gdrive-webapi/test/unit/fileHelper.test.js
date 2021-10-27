import { describe, test, jest, expect } from "@jest/globals";
import fs from "fs";
import FileHelper from "../../src/fileHelper";

import Routes from "./../../src/routes.mjs";

describe("#fileHelper", () => {
  describe("#getFileStatus", () => {
    test("it should return files statuses in corret format", async () => {
      const statMock = {
        dev: 1218264256,
        mode: 33206,
        nlink: 1,
        uid: 0,
        gid: 0,
        rdev: 0,
        blksize: 4096,
        ino: 355221420608850500,
        size: 532017,
        blocks: 1040,
        atimeMs: 1635303045789,
        mtimeMs: 1635303077635.9998,
        ctimeMs: 1635303077636.6533,
        birthtimeMs: 1635303045789.0994,
        atime: "2021-10-27T02:50:45.789Z",
        mtime: "2021-10-27T02:51:17.636Z",
        ctime: "2021-10-27T02:51:17.637Z",
        birthtime: "2021-10-27T02:50:45.789Z",
      };

      const mockUser = "manoel.vitor";
      process.env.USER = mockUser;

      const fileName = "Teste.png";

      jest
        .spyOn(fs.promises, fs.promises.readdir.name)
        .mockResolvedValueOnce([fileName]);

      jest
        .spyOn(fs.promises, fs.promises.stat.name)
        .mockResolvedValueOnce(statMock);

      const result = await FileHelper.getFilesStatus("/tmp");

      const expectResult = [
        {
          size: "532 kB",
          lastModified: statMock.birthtime,
          owner: mockUser,
          file: fileName,
        },
      ];

      expect(fs.promises.stat).toHaveBeenLastCalledWith("/tmp/" + fileName);
      expect(result).toMatchObject(expectResult);
    });
  });
});

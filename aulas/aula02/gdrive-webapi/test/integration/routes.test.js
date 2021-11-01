import { describe, test, jest, beforeAll, afterAll } from "@jest/globals";
import Routes from "../../src/routes.mjs";
import TestUtil from "../_util/testUtil";
import { logger } from "./../../src/logger.mjs";
import { tmpdir } from "os";
import { join } from "path";
import fs from "fs";
import UploadHandler from "../../src/uploadHandler.mjs";
import FormDataEvent from "form-data";

describe("#Routes integration test", () => {
  let defaultDownloadsFolder = "";
  beforeAll(async () => {
    defaultDownloadsFolder = await fs.promises.mkdtemp(
      join(tmpdir(), "downloads-")
    );
  });

  afterAll(async () => {
    defaultDownloadsFolder = await fs.promises.rm(defaultDownloadsFolder, {
      recursive: true,
    });
  });

  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation();
  });

  describe("#getFileStatus", () => {
    const ioObj = {
      to: (id) => ioObj,
      emit: (event, message) => {},
    };

    const uploadHandler = new UploadHandler({
      io: ioObj,
      socketId: "01",
    });

    test.only("should upload file to the folder ", async () => {
      const fileName = "IA.txt";
      const fileStream = fs.createReadStream(
        `./test/integration/mocks/${fileName}`
      );
      const response = TestUtil.generateReadableStream(() => {});

      const form = new FormDataEvent();
      form.append("photo", fileStream);

      const defaultParams = {
        request: Object.assign(form, {
          headers: form.getHeaders(),
          method: "POST",
          url: "?socketId=10",
        }),
        response: Object.assign(response, {
          setHeader: jest.fn(),
          writeHead: jest.fn(),
          end: jest.fn(),
        }),
        values: () => Object.values(defaultParams),
      };

      const routes = new Routes(defaultDownloadsFolder);
      routes.setSocketInstance(ioObj);

      const dir = await fs.promises.readdir(defaultDownloadsFolder);
      expect(dir).toEqual([]);
      await routes.handler(...defaultParams.values());

      const dirAfter = await fs.promises.readdir(defaultDownloadsFolder);
      expect(dirAfter).toEqual([fileName]);
    });
  });
});

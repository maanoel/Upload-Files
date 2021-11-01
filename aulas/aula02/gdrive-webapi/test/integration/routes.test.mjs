import { describe, test, jest, beforeEach } from "@jest/globals";
import Routes from "../../src/routes.mjs";

import TestUtil from "../_util/testUtil";
import logger from "./../../src/logger.mjs";

describe("#Routes integration test", () => {
  describe("#getFileStatus", () => {
    const uploadHandler = new UploadHandler({
      io: ioObj,
      socketId: "01",
    });

    beforeEach(() => {
      jest.spyOn(logger, "info").mockImplementation();
    });

    test("should upload file to the folder ", async () => {
      const fileName = "IA.txt";
      const fileStream = fs.createReadStream(
        `./teste/integration/mocks/${fileName}`
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

      const defaultDownloadsFolder = "/tmp";
      const route = new Routes(defaultDownloadsFolder);
    });
  });
});

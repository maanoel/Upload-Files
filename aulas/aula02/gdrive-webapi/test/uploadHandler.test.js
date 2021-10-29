import { describe, test, expect, jest } from "@jest/globals";
import UploadHandler from "../src/uploadHandler.mjs";
import TestUtil from "./_util/testUtil";

describe("#UploadHandler test suite", () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };
  describe("#registerEvents", () => {
    test("should call onFile and onFinish functions on busboy instance", () => {
      const uploadHandler = new UploadHandler({
        io: ioObj,
        socketId: "01",
      });

      jest.spyOn(uploadHandler, uploadHandler.onFile.name).mockResolvedValue();

      const headers = {
        "content-type": "multipart/form-data; boundary=",
      };

      const fn = jest.fn();

      uploadHandler.registerEvents(headers, fn);

      const readable = TestUtil.generateReadableStream(["chunk", "of", "data"]);
      readable.on("data", (msg) => console.log("msg", msg));

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(fn).toHaveBeenCalled();
    });
  });
});

import { describe, test, expect, jest } from "@jest/globals";
import UploadHandler from "../src/uploadHandler.mjs";
import TestUtil from "./_util/testUtil";
import fs from "fs";
import { resolve } from "path";
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

      const onFinish = jest.fn();
      const fileStream = TestUtil.generateReadableStream([
        "chunk",
        "of",
        "data",
      ]);

      const busBoyInstance = uploadHandler.registerEvents(headers, onFinish);

      busBoyInstance.emit("file", "fieldName", fileStream, "filename.txt");

      busBoyInstance.listeners("finish")[0].call();

      expect(uploadHandler.onFile).toHaveBeenCalled();
      expect(onFinish).toHaveBeenCalled();
    });
  });

  describe("#onFile", () => {
    test("given a stream file it should save it on disk", async () => {
      const onTransform = jest.fn();
      const onData = jest.fn();
      const chunks = ["hey", "dude"];

      const params = {
        fieldName: "video",
        file: TestUtil.generateReadableStream(chunks),
        fileName: "mockFile.mov",
      };
      const downloadsFolder = "C://tmp";
      const handler = new UploadHandler({
        io: ioObj,
        socketId: "01",
        downloadsFolder,
      });

      jest
        .spyOn(fs, fs.createWriteStream.name)
        .mockImplementation(() => TestUtil.generateWritableStream(onData));

      jest
        .spyOn(handler, handler.handlerFileBytes.name)
        .mockImplementation(() =>
          TestUtil.generateTransformStream(onTransform)
        );

      await handler.onFile(...Object.values(params));

      expect(onData.mock.calls.join()).toEqual(chunks.join());
      expect(onTransform.mock.calls.join()).toEqual(chunks.join());

      const expectedFileName = handler.downloadsFolder + "/" + params.fileName;
      expect(fs.createWriteStream).toHaveBeenCalledWith(expectedFileName);
    });
  });
});

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import UploadHandler from "../../src/uploadHandler.mjs";
import TestUtil from "../_util/testUtil";
import fs from "fs";
import { pipeline } from "stream/promises";
import { logger } from "../../src/logger.mjs";

describe("#UploadHandler test suite", () => {
  const ioObj = {
    to: (id) => ioObj,
    emit: (event, message) => {},
  };

  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation();
  });

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

  describe("#handleFileBytes", () => {
    test("should call emit function and it is a transform stream", async () => {
      jest.spyOn(ioObj, ioObj.to.name);
      jest.spyOn(ioObj, ioObj.emit.name);

      const handler = new UploadHandler({ io: ioObj, socketId: "01" });

      jest.spyOn(handler, handler.canExecute.name).mockReturnValueOnce(true);

      const messages = ["hello"];
      const source = TestUtil.generateReadableStream(messages);
      const onWrite = jest.fn();
      const target = TestUtil.generateWritableStream(onWrite);

      await pipeline(source, handler.handlerFileBytes("filename.txt"), target);

      expect(ioObj.to).toHaveBeenCalledTimes(messages.length);
      expect(ioObj.emit).toHaveBeenCalledTimes(messages.length);

      //se o handlerFileBytes for um transformStream nosso
      //pipeline vai continuar o processo passando os dados
      //para frente e chamar nossa função no target a cada chunk

      expect(onWrite).toHaveBeenCalledTimes(messages.length);
      expect(onWrite.mock.calls.join()).toEqual(messages.join());
    });

    test("given message timerDelay as 2secs it should emit only two mesages during 2 seconds period", async () => {
      jest.spyOn(ioObj, ioObj.emit.name);

      const day = "2021-07-01 01:01";
      const twoSecondPeriod = 2000;

      //Date.now do this.lastMessageSent em handlerBytes
      const onFirstLastMessageSent = TestUtil.getTimeFromDate(`${day}:00`);

      //Hello chegou
      const onFirstCanExecute = TestUtil.getTimeFromDate(`${day}:02`);

      const onSecondUpdateLastMessageSent = onFirstCanExecute;
      //segundo hello, está fora da janela de tempo

      const onSecondCanExecute = TestUtil.getTimeFromDate(`${day}:03`);

      // => world
      const onThirdCanExecute = TestUtil.getTimeFromDate(`${day}:04`);

      TestUtil.mockDateNow([
        onFirstLastMessageSent,
        onFirstCanExecute,
        onSecondUpdateLastMessageSent,
        onSecondCanExecute,
        onThirdCanExecute,
      ]);

      const fileName = "filename.avi";
      const messages = ["hello", "hello", "world"];
      const expectedMessageSent = 2;

      const source = TestUtil.generateReadableStream(messages);
      const handler = new UploadHandler({
        io: ioObj,
        socketId: "01",
        messageTimeDelay: twoSecondPeriod,
      });

      await pipeline(source, handler.handlerFileBytes(fileName));
      expect(ioObj.emit).toHaveBeenCalledTimes(expectedMessageSent);

      const [firstCallResult, secondCallResult] = ioObj.emit.mock.calls;

      expect(firstCallResult).toEqual([
        handler.ON_UPLOAD_EVENT,
        { processedAlready: "hello".length, fileName },
      ]);

      expect(secondCallResult).toEqual([
        handler.ON_UPLOAD_EVENT,
        { processedAlready: messages.join("").length, fileName },
      ]);
    });
  });

  describe("#canExecute", () => {
    test("should return true when time is later than specified delay", () => {
      const timerDelay = 1000;
      const uploadHandler = new UploadHandler({
        io: {},
        socketId: "",
        messageTimeDelay: timerDelay,
      });

      const now = TestUtil.getTimeFromDate("2021-07-01 00:00:03");
      TestUtil.mockDateNow([now]);

      const lastExecution = TestUtil.getTimeFromDate("2021-07-01 00:00:00");

      const result = uploadHandler.canExecute(lastExecution);
      expect(result).toBeTruthy();
    });

    test("should return false when time isn't later than specified delay", () => {
      const timerDelay = 3000;
      const uploadHandler = new UploadHandler({
        io: {},
        socketId: "",
        messageTimeDelay: timerDelay,
      });

      const now = TestUtil.getTimeFromDate("2021-07-01 11:11:02");
      TestUtil.mockDateNow([now]);

      const lastExecution = TestUtil.getTimeFromDate("2021-07-01 11:11:00");

      const result = uploadHandler.canExecute(lastExecution);
      expect(result).toBeFalsy();
    });
  });
});

import { describe, test, expect, jest, beforeEach } from "@jest/globals";
import UploadHandler from "../../src/uploadHandler.mjs";
import TestUtil from "../_util/testUtil";
import { logger } from "../../src/logger.mjs";
import Routes from "./../../src/routes.mjs";

describe("#Routes test suite", () => {
  beforeEach(() => {
    jest.spyOn(logger, "info").mockImplementation();
  });

  const request = TestUtil.generateReadableStream(["some file bytes"]);
  const response = TestUtil.generateWritableStream(() => {});

  const defaultParams = {
    request: Object.assign(request, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      method: "",
      body: {},
    }),
    response: Object.assign(response, {
      setHeader: jest.fn(),
      writeHead: jest.fn(),
      end: jest.fn(),
    }),
    values: () => Object.values(defaultParams),
  };

  const routes = new Routes();

  describe("#Routes test suite", () => {
    test("setSocket should store io instance", () => {
      const ioObj = {
        to: (id) => ioObj,
        emit: (event, message) => {},
      };

      routes.setSocketInstance(ioObj);
      expect(routes.io).toStrictEqual(ioObj);
    });
  });

  test("#teste teste", () => {
    expect(true).toBeTruthy();
  });

  describe("#handler", () => {
    test("given an inexistent route it should choose default route", async () => {
      const params = { ...defaultParams };

      params.request.method = "inexistent";
      await routes.handler(...params.values());

      expect(params.response.end).toHaveBeenCalledWith("hello world");
    });

    test("it should set any request with CORS enabled", async () => {
      const params = { ...defaultParams };

      params.request.method = "inexistent";
      await routes.handler(...params.values());

      expect(params.response.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
    });

    test("given method OPTIONS it should choose options route", async () => {
      const params = { ...defaultParams };

      params.request.method = "OPTIONS";

      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(204);
    });

    test("given method GET it should choose get route", async () => {
      const params = { ...defaultParams };

      params.request.method = "GET";

      jest.spyOn(routes, routes.get.name).mockResolvedValue();

      await routes.handler(...params.values());

      expect(routes.get).toHaveBeenCalled();
    });
  });

  describe("#handler", () => {});

  describe("#get", () => {
    test("given methodo GET it chould list all file downloaded", async () => {
      const params = { ...defaultParams };

      const filesStatusesMock = [
        {
          size: "532 kB",
          lastModified: "2021-10-27T02:50:45.789Z",
          owner: "manoel.vitor",
          file: "Teste.png",
        },
      ];

      jest
        .spyOn(routes.fileHelper, routes.fileHelper.getFilesStatus.name)
        .mockResolvedValue(filesStatusesMock);

      params.request.method = "GET";

      await routes.handler(...params.values());

      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      expect(params.response.end).toHaveBeenCalledWith(
        JSON.stringify(filesStatusesMock)
      );
    });
  });

  describe("#post", () => {
    test("it should validade post route workflow", async () => {
      const routes = new Routes("/tmp");
      const params = { ...defaultParams };
      params.request.method = "POST";
      params.request.url = "?socketId=10";

      jest
        .spyOn(
          UploadHandler.prototype,
          UploadHandler.prototype.registerEvents.name
        )
        .mockImplementation((headers, onFinish) => {
          const writable = TestUtil.generateWritableStream(() => {});
          writable.on("finish", onFinish);
          return writable;
        });

      await routes.handler(...params.values());

      expect(UploadHandler.prototype.registerEvents).toHaveBeenCalled();
      expect(params.response.writeHead).toHaveBeenCalledWith(200);
      const expectedResult = JSON.stringify({
        result: "Files upload with success!",
      });

      expect(params.response.end).toHaveBeenCalledWith(expectedResult);
    });
  });
});

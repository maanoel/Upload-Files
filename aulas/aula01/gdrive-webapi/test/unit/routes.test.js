import { describe, test, expect, jest } from "@jest/globals";
import Routes from "./../../src/routes.mjs";

describe("#Routes test suite", () => {
  describe("#Routes test suite", () => {
    test("setSocket should store io instance", () => {
      const routes = new Routes();
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
    const defaultParams = {
      request: {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        method: "",
        body: {},
      },
      response: {
        setHeader: jest.fn(),
        writeHead: jest.fn(),
        end: jest.fn(),
      },
      values: () => Object.values(defaultParams),
    };

    test("given an inexistent route it should choose default route", () => {
      const routes = new Routes();
      const params = { ...defaultParams };

      params.request.method = "inexistent";
      routes.handler(...params.values());

      expect(params.response.end).toHaveBeenCalledWith("hello world");
    });

    test("it should set any request with CORS enabled", () => {
      const routes = new Routes();
      const params = { ...defaultParams };

      params.request.method = "inexistent";
      routes.handler(...params.values());

      expect(params.response.setHeader).toHaveBeenCalledWith(
        "Access-Control-Allow-Origin",
        "*"
      );
    });

    test.todo("given method OPTIONS it should choose options route");
    test.todo("given method POST it should choose post route");
    test.todo("given method GET it should choose get route");
  });
});

import { describe, test, expect } from "@jest/globals";
import Routes from "./../../src/routes.mjs";

describe("#Routes test suite", () => {
  describe("#todo example", () => {
    test.todo("example todo um jest");
  });

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
});

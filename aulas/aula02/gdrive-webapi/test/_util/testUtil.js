import { Readable, Writable } from "stream";

export default class TestUtil {
  static generateReadableStream(data) {
    return new Readable({
      objectMode: true,
      read() {
        for (const item of data) {
          this.push(item);
        }

        this.push(null);
      },
    });
  }

  static generateWritableStream(fn) {
    return new Writable({
      objectMode: true,
      write(chunk, encoding, callback) {
        fn(chunk);
        callback(null, chunk);
      },
    });
  }
}

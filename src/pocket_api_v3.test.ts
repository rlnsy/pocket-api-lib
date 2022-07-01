import { retreiveData, RetrieveDataOptionalParams } from "./pocket_api_v3";
import { z as _z_ } from "zod";

// initialize mocked axios module
import ax from "axios";
jest.mock("axios");
const axios = ax as jest.Mocked<typeof ax>;

export const PLACEHOLDER = "<placeholder>";

export const ErrorT = _z_.object({
  message: _z_.string(),
});

describe("Pocket API Library V3", () => {
  describe("Retrieve", () => {
    const consumer_key = PLACEHOLDER;
    const access_token = PLACEHOLDER;
    const retreive = (args: RetrieveDataOptionalParams = {}) =>
      retreiveData({
        ...args,
        consumer_key,
        access_token,
      });
    describe("Input validation", () => {
      test("non-integer start time", async () => {
        try {
          await retreive({
            since: 0.5,
          });
          fail();
        } catch (e) {
          const { message } = ErrorT.parse(e);
          expect(message).toMatch("integer");
        }
      });
      test("negative start time", async () => {
        try {
          await retreive({
            since: -1,
          });
          fail();
        } catch (e) {
          const { message } = ErrorT.parse(e);
          expect(message).toMatch("non-negative");
        }
      });
      test("negative count", async () => {
        try {
          await retreive({
            count: -1,
          });
          fail();
        } catch (e) {
          const { message } = ErrorT.parse(e);
          expect(message).toMatch("positive");
        }
      });
      test("0 count", async () => {
        try {
          await retreive({
            count: 0,
          });
          fail();
        } catch (e) {
          const { message } = ErrorT.parse(e);
          expect(message).toMatch("positive");
          expect(message).toMatch("nonzero");
        }
      });
      test("negative offset", async () => {
        try {
          await retreive({
            offset: -1,
          });
          fail();
        } catch (e) {
          const { message } = ErrorT.parse(e);
          expect(message).toMatch("non-negative");
        }
      });
    });
    describe("Error handling", () => {
      test("Request rejects", async () => {
        const errMessage = "unauthorized";
        axios.post.mockImplementation(() => {
          throw new Error(errMessage);
        });
        try {
          await retreive();
        } catch (e) {
          expect(ErrorT.parse(e).message).toMatch(errMessage);
        }
      });
    });
    describe("Response parsing", () => {
      test("Stringified numbers converted", async () => {
        axios.post.mockImplementation(async () => {
          return {
            data: {
              status: 1,
              complete: 1,
              error: null,
              search_meta: {
                search_type: "normal",
              },
              since: 0,
              list: {
                example: {
                  time_added: "1",
                  time_updated: "2",
                  time_read: "3",
                  time_favorited: "4",
                  word_count: "100",
                },
              },
            },
          };
        });
        await retreive().then(({ list: { example: data } }) => {
          expect(data.time_added).toEqual(1);
          expect(data.time_updated).toEqual(2);
          expect(data.time_read).toEqual(3);
          expect(data.time_favorited).toEqual(4);
          expect(data.word_count).toEqual(100);
        });
      });
      test("Undefined values omitted", async () => {
        axios.post.mockImplementation(async () => {
          return {
            data: {
              status: 1,
              complete: 1,
              error: null,
              search_meta: {
                search_type: "normal",
              },
              since: 0,
              list: {
                example: {},
              },
            },
          };
        });
        await retreive().then(({ list: { example: data } }) => {
          expect(data.word_count).toBeUndefined();
        });
      });
    });
  });
});

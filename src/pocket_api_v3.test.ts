import {
  ItemMediaType,
  ItemStatus,
  retreiveData,
  RetrieveDataOptionalParams,
  RetrieveDataResponse,
} from "./pocket_api_v3";
import { z as _z_ } from "zod";

// initialize mocked axios module
import ax, { AxiosResponse } from "axios";
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
      const defaultRetreiveResponse: RetrieveDataResponse = {
        status: 1,
        complete: 1,
        error: null,
        search_meta: {
          search_type: "normal",
        },
        since: 0,
        list: {},
      };

      const mockResponse =
        (
          data: RetrieveDataResponse = defaultRetreiveResponse
          //): Promise<Partial<AxiosResponse>> => new Promise((resolve) => resolve({ data }));
        ): ((...args: Parameters<typeof axios.post>) => Promise<Partial<AxiosResponse>>) =>
        async () => ({ data });

      test("Stringified numbers converted", async () => {
        axios.post.mockImplementation(
          mockResponse({
            ...defaultRetreiveResponse,
            list: {
              example: {
                favorite: "1",
                time_added: "1",
                time_updated: "2",
                time_read: "3",
                time_favorited: "4",
                word_count: "100",
              },
            },
          })
        );
        await retreive().then(({ list: { example: data } }) => {
          expect(data.time_added).toEqual(1);
          expect(data.time_updated).toEqual(2);
          expect(data.time_read).toEqual(3);
          expect(data.time_favorited).toEqual(4);
          expect(data.word_count).toEqual(100);
        });
      });
      test("Undefined values omitted", async () => {
        axios.post.mockImplementation(
          mockResponse({
            ...defaultRetreiveResponse,
            list: {
              example: {},
            },
          })
        );
        await retreive().then(({ list: { example: data } }) => {
          expect(data.word_count).toBeUndefined();
        });
      });
      test("String binary to boolean", async () => {
        axios.post.mockImplementation(
          mockResponse({
            ...defaultRetreiveResponse,
            list: {
              example: {
                favorite: "1",
                is_article: "0",
              },
            },
          })
        );
        await retreive().then(({ list: { example: data } }) => {
          expect(data.favorite).toEqual(true);
          expect(data.is_article).toEqual(false);
        });
      });
      test("Item status", async () => {
        axios.post.mockImplementation(
          mockResponse({
            ...defaultRetreiveResponse,
            list: {
              example: {
                status: "1",
              },
            },
          })
        );
        await retreive().then(({ list: { example: data } }) => {
          expect(data.status).toEqual(ItemStatus.ARCHIVE);
        });
      });
      test("Item media type", async () => {
        axios.post.mockImplementation(
          mockResponse({
            ...defaultRetreiveResponse,
            list: {
              example: {
                has_image: "0",
                has_video: "2",
              },
            },
          })
        );
        await retreive().then(({ list: { example: data } }) => {
          expect(data.has_image).toEqual(ItemMediaType.NO_CONTENT);
          expect(data.has_video).toEqual(ItemMediaType.IS_CONTENT);
        });
      });
    });
  });
});

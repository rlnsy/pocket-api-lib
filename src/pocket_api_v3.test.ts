import { retreiveData, RetrieveDataOptionalParams } from "./pocket_api_v3";
import { z as _z_ } from "zod";

import axios, { Axios } from "axios";
jest.mock("axios");

export const PLACEHOLDER = "<placeholder>";

export const ErrorT = _z_.object({
  message: _z_.string(),
});

describe("Pocket API Library V3", () => {
  describe("Retrieve", () => {
    const consumer_key = PLACEHOLDER;
    const access_token = PLACEHOLDER;
    const get = (args: RetrieveDataOptionalParams) =>
      retreiveData({
        ...args,
        consumer_key,
        access_token,
      });
    describe("Input validation", () => {
      test("non-integer start time", async () => {
        try {
          await get({
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
          await get({
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
          await get({
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
          await get({
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
          await get({
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
        const mocked = axios as jest.Mocked<typeof axios>;
        mocked.post.mockImplementation(() => {
          throw new Error(errMessage);
        });
        try {
          await get({});
        } catch (e) {
          expect(ErrorT.parse(e).message).toMatch(errMessage);
        }
      });
    });
  });
});

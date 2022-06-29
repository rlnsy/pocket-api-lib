import { RetrieveDataResponseListT } from "../pocket_api_v3";

describe("Pocket API Library V3", () => {
  describe("Retrieve", () => {
    describe("Response type validator", () => {
      test("No fields", () => {
        RetrieveDataResponseListT.parse({});
      });
    });
  });
});

import { string, object } from "zod";
import fs from "fs";
import { retrieveData, getRecentItems, RetrieveDataParams } from ".";
import { assert } from "chai";

const ConfigT = object({
  consumer_key: string(),
  access_token: string(),
});

const { consumer_key, access_token } = ConfigT.parse(
  JSON.parse(fs.readFileSync("id.json").toString())
);

const requiredParams: Pick<RetrieveDataParams, "consumer_key" | "access_token"> = {
  consumer_key,
  access_token,
};

retrieveData(requiredParams);

getRecentItems(requiredParams, 4).then(({ list }) => {
  assert.equal(Object.keys(list).length, 4);
});

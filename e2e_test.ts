import { string, object } from "zod";
import fs from "fs";
import { retreiveData, getRecentItems, RetrieveDataRequiredParams } from ".";
import { assert } from "chai";

const ConfigT = object({
  consumer_key: string(),
  access_token: string(),
});

const { consumer_key, access_token } = ConfigT.parse(
  JSON.parse(fs.readFileSync("id.json").toString())
);

const requiredParams: RetrieveDataRequiredParams = {
  consumer_key,
  access_token,
};

retreiveData(requiredParams);

getRecentItems(requiredParams, 4).then(({ list }) => {
  assert.equal(Object.keys(list).length, 4);
});

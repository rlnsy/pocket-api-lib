import { string, object } from "zod";
import fs from "fs";
import { retreiveData } from ".";

const ConfigT = object({
  consumer_key: string(),
  access_token: string(),
});

const { consumer_key, access_token } = ConfigT.parse(
  JSON.parse(fs.readFileSync("id.json").toString())
);

retreiveData({
  consumer_key,
  access_token,
}).then(console.log);

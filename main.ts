import { retreiveData } from "./pocket_api_v3";
import * as fs from "fs";
import { z as _z_ } from "zod";

const { consumer_key, access_token } = _z_
  .object({
    consumer_key: _z_.string(),
    access_token: _z_.string(),
  })
  .strict()
  .parse(JSON.parse(fs.readFileSync("./test_data/credentials.json").toString()));

retreiveData({
  consumer_key,
  access_token,
}).then(console.log);

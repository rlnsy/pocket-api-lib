import { z as _z_ } from "zod";
import axios from "axios";
import * as url from "url";

export type RetrieveDataRequiredParams = {
  consumer_key: string;
  access_token: string;
};

export type RetrieveDataOptionalParams = Partial<{
  state: "unread" | "archive" | "all";
  favorite: 0 | 1;
  tag: "_untagged_" | string;
  contentType: "article" | "video" | "image";
  sort: "newest" | "oldest" | "title" | "site";
  detailType: "simple" | "complete";
  search: string;
  domain: string;
  since: number; // UNIX timestamp
  // offset must be used with count
  count: number; // Integer
  offset?: number; // Integer
}>;

export type RetrieveDataParams = RetrieveDataRequiredParams & RetrieveDataOptionalParams;

function convertParams(params: Record<string, string | number>): Record<string, string> {
  return Object.fromEntries(Object.entries(params).map(([key, value]) => [key, `${value}`]));
}

export const RetrieveDataResponseItemT = _z_
  .object({
    item_id: _z_.string(),
    resolved_id: _z_.string(),
    given_url: _z_.string(),
    resolved_url: _z_.string(),
    given_title: _z_.string(),
    resolved_title: _z_.string(),
    favorite: _z_.union([_z_.literal("0"), _z_.literal("1")]),
    status: _z_.union([_z_.literal("0"), _z_.literal("1"), _z_.literal("2")]),
    excerpt: _z_.string(),
    is_article: _z_.union([_z_.literal("0"), _z_.literal("1")]),
    has_image: _z_.union([_z_.literal("0"), _z_.literal("1"), _z_.literal("2")]),
    has_video: _z_.union([_z_.literal("0"), _z_.literal("1"), _z_.literal("2")]),
    word_count: _z_.string(), // stringified integer
    tags: _z_.unknown(),
    authors: _z_.unknown(),
    images: _z_.unknown(),
    videos: _z_.unknown(),
    sort_id: _z_.number(),
    is_index: _z_.unknown(),
    lang: _z_.string(),
    listen_duration_estimate: _z_.number(),
    top_image_url: _z_.string(),
    time_to_read: _z_.number(),
    domain_metadata: _z_
      .object({
        name: _z_.string().optional(),
        logo: _z_.string(),
        greyscale_logo: _z_.string(),
      })
      .strict(),
    amp_url: _z_.string(),
    // these are all stringified integers
    time_added: _z_.string(),
    time_updated: _z_.string(),
    time_read: _z_.string(),
    time_favorited: _z_.string(),
  })
  .strict()
  .partial();

export type RetrieveDataResponseItem = _z_.infer<typeof RetrieveDataResponseItemT>;

export const RetrieveDataResponseListT = _z_.record(RetrieveDataResponseItemT);

export type RetrieveDataResponseList = _z_.infer<typeof RetrieveDataResponseListT>;

export const RetrieveDataResponseT = _z_
  .object({
    status: _z_.literal(1),
    complete: _z_.literal(1),
    error: _z_.literal(null),
    search_meta: _z_.object({
      search_type: _z_.literal("normal"),
    }),
    since: _z_.number(),
    list: RetrieveDataResponseListT,
  })
  .strict();

export type RetrieveDataResponse = _z_.infer<typeof RetrieveDataResponseT>;

export async function retreiveData(params: RetrieveDataParams): Promise<RetrieveDataResponse> {
  return axios
    .post("https://getpocket.com/v3/get", new url.URLSearchParams(convertParams(params)).toString())
    .then((res) => {
      return RetrieveDataResponseT.parse(res.data);
    });
}

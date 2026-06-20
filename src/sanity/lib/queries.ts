import { defineQuery } from "groq";

export const TEST_MESSAGE_QUERY = defineQuery(
  `*[_type == "testMessage"][0]{
    _id,
    heading,
    subtitle
  }`,
);

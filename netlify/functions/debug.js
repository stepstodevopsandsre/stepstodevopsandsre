import { Client } from "@notionhq/client";
import { DEFAULT_ORIGIN, createCorsHeaders } from "./_shared/blog-utils.js";

export const handler = async (event) => {
  const allowedOrigin = process.env.ALLOWED_ORIGIN || DEFAULT_ORIGIN;
  const requestOrigin = event.headers.origin || event.headers.Origin;

  const notionToken = process.env.NOTION_TOKEN;
  if (!notionToken) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({ error: "NOTION_TOKEN is not configured." })
    };
  }

  try {
    const notion = new Client({ auth: notionToken });
    const pageIds = [
      "3a25aace-fb86-8152-a5e7-f4cf2b04937d",
      "3a25aace-fb86-819a-9f18-f4226fc6ab7e",
      "3a25aace-fb86-816c-839a-cae67acd5a15"
    ];
    
    const results = {};
    for (const id of pageIds) {
      try {
        const page = await notion.pages.retrieve({ page_id: id });
        results[id] = {
          id: page.id,
          parent: page.parent,
          properties: page.properties,
          url: page.url
        };
      } catch (err) {
        results[id] = { error: err.message };
      }
    }

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(results)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Error debugging hierarchy."
      })
    };
  }
};

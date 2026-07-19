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
    const databaseId = "0c391e18-4cf4-48e8-918f-50cbface959c";
    
    const response = await notion.databases.query({
      database_id: databaseId
    });

    const entries = response.results.map(page => ({
      id: page.id,
      url: page.url,
      parent: page.parent,
      properties: page.properties
    }));

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json"
      },
      body: JSON.stringify(entries)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Error querying database."
      })
    };
  }
};

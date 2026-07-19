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
    const originalPageId = "3a25aace-fb86-816c-839a-cae67acd5a15";
    const parentModulePageId = "3a25aace-fb86-819a-9f18-f4226fc6ab7e";
    const databaseId = "0c391e18-4cf4-48e8-918f-50cbface959c";

    // 1. Fetch blocks from original page
    const originalBlocksResponse = await notion.blocks.children.list({
      block_id: originalPageId,
      page_size: 100
    });
    const originalBlocks = originalBlocksResponse.results;

    // Filter out properties that Notion doesn't allow when writing new blocks
    const cleanBlocks = originalBlocks.map(block => {
      const clean = { type: block.type };
      // Copy the specific block type data object, omitting read-only IDs
      clean[block.type] = { ...block[block.type] };
      return clean;
    });

    // Add navigation header to new page body
    const headerBlock = {
      type: "paragraph",
      paragraph: {
        rich_text: [
          {
            type: "text",
            text: { content: "Parent: " }
          },
          {
            type: "text",
            text: { content: "System Internals & Troubleshooting" }
          },
          {
            type: "text",
            text: { content: " · Domain: " }
          },
          {
            type: "text",
            text: { content: "Linux" }
          }
        ]
      }
    };
    cleanBlocks.unshift(headerBlock);

    // 2. Create new page in the Blog Posts Database
    const newDbPage = await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: { content: "Linux Kernel Panics: Causes, Troubleshooting, and Fixes" }
            }
          ]
        },
        Slug: {
          rich_text: [
            {
              text: { content: "linux-kernel-panics-causes-troubleshooting" }
            }
          ]
        },
        Status: {
          status: { name: "Done" }
        },
        Category: {
          select: { name: "Linux" }
        },
        "Published Date": {
          date: { start: "2026-07-19" }
        },
        Summary: {
          rich_text: [
            {
              text: { content: "A deep-dive engineering guide on diagnosing, troubleshooting, and resolving Linux kernel panics, covering panic flow, console logs, kdump configuration, and post-mortem analysis." }
            }
          ]
        }
      },
      children: cleanBlocks.slice(0, 100) // Notion allows up to 100 child blocks on page creation
    });

    // If there were more than 100 blocks, append the rest
    if (cleanBlocks.length > 100) {
      await notion.blocks.children.append({
        block_id: newDbPage.id,
        children: cleanBlocks.slice(100)
      });
    }

    // 3. Link new DB page under Module page
    await notion.blocks.children.append({
      block_id: parentModulePageId,
      children: [
        {
          type: "link_to_page",
          link_to_page: {
            type: "page_id",
            page_id: newDbPage.id
          }
        }
      ]
    });

    // 4. Archive / delete original child page
    await notion.pages.update({
      page_id: originalPageId,
      archived: true
    });

    return {
      statusCode: 200,
      headers: {
        ...createCorsHeaders(requestOrigin || allowedOrigin),
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        success: true,
        message: "Successfully migrated page to database and linked in hierarchy.",
        originalPageId,
        newDatabasePageId: newDbPage.id,
        url: newDbPage.url
      })
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: createCorsHeaders(requestOrigin || allowedOrigin),
      body: JSON.stringify({
        error: error instanceof Error ? error.message : "Error migrating page."
      })
    };
  }
};

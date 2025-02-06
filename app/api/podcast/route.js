import Parser from "rss-parser";

export async function GET(_request) {
  const parser = new Parser();
  const feedUrl = "https://feeds.megaphone.fm/designbetter";

  try {
	const feed = await parser.parseURL(feedUrl);

	if (!feed.items || feed.items.length === 0) {
	  return new Response(JSON.stringify({ error: "No episodes found" }), {
		status: 404,
		headers: { "Content-Type": "application/json" },
	  });
	}

	// Return only the latest episode
	return new Response(JSON.stringify({ latestEpisode: feed.items[0] }), {
	  status: 200,
	  headers: { "Content-Type": "application/json" },
	});

  } catch (error) {
	console.error("Error fetching podcast feed:", error);
	return new Response(JSON.stringify({ error: "Failed to fetch podcast data" }), {
	  status: 500,
	  headers: { "Content-Type": "application/json" },
	});
  }
}

import Parser from "rss-parser";

export async function GET(_request) {
  const parser = new Parser({
	customFields: {
	  item: ["itunes:image"],
	},
  });

  const feed = await parser.parseURL("https://feeds.megaphone.fm/designbetter");

  if (!feed.items.length) {
	return new Response(
	  JSON.stringify({ error: "No episodes found." }),
	  { status: 404, headers: { "Content-Type": "application/json" } }
	);
  }

  const latestEpisode = feed.items[0];

  return new Response(
	JSON.stringify({
	  latestEpisode: {
		title: latestEpisode.title,
		link: latestEpisode.link,
		artwork: latestEpisode.itunes.image || null, // Extract episode artwork
	  },
	}),
	{ status: 200, headers: { "Content-Type": "application/json" } }
  );
}
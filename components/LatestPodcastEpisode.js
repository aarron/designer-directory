import { useState, useEffect } from "react";

export default function LatestPodcastEpisode() {
  const [episode, setEpisode] = useState(null);

  useEffect(() => {
	const fetchLatestEpisode = async () => {
	  try {
		const response = await fetch("/api/podcast");
		const data = await response.json();

		if (data.latestEpisode) {
		  setEpisode(data.latestEpisode);
		} else {
		  console.error("No latest episode found in response");
		}
	  } catch (error) {
		console.error("Error fetching the latest podcast episode:", error);
	  }
	};

	fetchLatestEpisode();
  }, []);

  if (!episode) {
	return <div className="text-gray-500 text-center">Loading latest episode...</div>;
  }

  return (
	<div className="mt-8 mb-4 max-w-sm mx-auto">
	  <div className="flex items-center space-x-4">
		{/* Episode Artwork - Ensures image does not get distorted */}
		{episode.artwork && (
			<a
				href={episode.link}
				target="_blank"
				rel="noopener noreferrer"
			  >
		  		<img
					src={episode.artwork}
					alt="Episode artwork"
					className="w-24 h-24 rounded-lg object-contain"
		  		/>
			</a>
		)}

		{/* Text Section */}
		<div className="flex flex-col">
		  <h3 className="text-xs text-gray-600 mb-1">New on the Design Better Podcast</h3>
		  <a
			href={episode.link}
			target="_blank"
			rel="noopener noreferrer"
			className="text-black font-semibold hover:no-underline"
		  >
			{episode.title}
		  </a>
		</div>
	  </div>
	</div>
  );
}

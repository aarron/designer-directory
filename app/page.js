"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import md5 from "blueimp-md5";
import { ArrowLongRightIcon, SpeakerWaveIcon } from "@heroicons/react/24/outline";

// Helper functions
function convertGoogleDriveUrl(url) {
  if (!url) return url;
  if (url.includes("thumbnail?")) return url;
  const fileMatch = url.match(/\/file\/d\/([^/]+)\/view/);
  if (fileMatch) {
	const fileId = fileMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  const openMatch = url.match(/\/open\?id=([^&]+)/);
  if (openMatch) {
	const fileId = openMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  return url;
}

function getGravatarUrl(email, size = 40) {
  if (!email) return "";
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

// Podcast Episode Component
function LatestPodcastEpisode() {
  const [episode, setEpisode] = useState(null);

  useEffect(() => {
	const fetchLatestEpisode = async () => {
	  try {
		const response = await fetch("/api/podcast");
		const data = await response.json();
		console.log("Podcast API Response:", data); // Debugging log

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
	return <div className="text-gray-500">Loading latest episode...</div>;
  }

  return (
	<div className="mt-8 mb-8 text-center">
	  <h3 className="text-xs text-gray-600">New on the Design Better Podcast</h3>
	  <div className="flex justify-center mt-2">
		<a
		  href={episode.link}
		  target="_blank"
		  rel="noopener noreferrer"
		  className="flex items-center highlight"
		>
		  <SpeakerWaveIcon className="mr-2 flex-shrink-0 h-6 w-6 text-gray-600" />
		  {episode.title}
		</a>
	  </div>
	</div>

  );
}


export default function Home() {
  const [designers, setDesigners] = useState([]);
  const [filteredDesigners, setFilteredDesigners] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
	location: "",
	primaryRole: "",
	roleType: "",
	experienceLevel: "",
  });

  useEffect(() => {
	fetch("/api/designers")
	  .then((res) => res.json())
	  .then((data) => {
		setDesigners(data);
		setFilteredDesigners(data);
	  })
	  .catch((err) => console.error(err));
  }, []);

  useEffect(() => {
	const filtered = designers.filter((designer) => {
	  if (
		designer.PermissionCanweshareyourprofilepubliclyinourtalentdirectory &&
		designer.PermissionCanweshareyourprofilepubliclyinourtalentdirectory.toLowerCase() === "no"
	  ) {
		return false;
	  }

	  const fullName = `${designer.FirstName} ${designer.LastName}`.toLowerCase();
	  if (search && !fullName.includes(search.toLowerCase())) {
		return false;
	  }

	  if (
		filters.location &&
		filters.location !== "All Locations" &&
		(!designer.Location || !designer.Location.includes(filters.location))
	  ) {
		return false;
	  }

	  if (
		filters.primaryRole &&
		filters.primaryRole !== "All Roles" &&
		(!designer.Primaryrole || !designer.Primaryrole.includes(filters.primaryRole))
	  ) {
		return false;
	  }

	  if (filters.roleType && (!designer.Typeofrole || !designer.Typeofrole.includes(filters.roleType))) {
		return false;
	  }

	  if (
		filters.experienceLevel &&
		filters.experienceLevel !== "All experience levels" &&
		designer.Yourexperiencelevel !== filters.experienceLevel
	  ) {
		return false;
	  }

	  return true;
	});
	setFilteredDesigners(filtered);
  }, [search, filters, designers]);

  return (
	<div className="container mx-auto p-4">
	  <h1 className="text-3xl font-bold mb-4 text-gray-600">Talent Directory</h1>
	  <p className="text-sm text-gray-600 mb-8 pb-8 border-b">
		Helping great people find great jobs. <strong>{designers.length} designers</strong> are ready to rock 🚀.
	  </p>

	  {/* Podcast promo block */}
	  <div className="mb-8">
		<LatestPodcastEpisode />
	  </div>
	  {/* Close podcast promo block */}

	  {/* Designers Grid */}
	  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
		{filteredDesigners.map((designer) => {
		  const profileImage = designer.Photooravatar
			? convertGoogleDriveUrl(designer.Photooravatar)
			: getGravatarUrl(designer.EmailAddress, 40);

		  return (
			<Link
			  key={designer.id}
			  href={`/profile/${designer.id}`}
			  className="bg-white border p-4 rounded hover:shadow-lg transition text-[#FF4725] no-underline hover:text-[#000000] hover:underline flex flex-col items-center text-center"
			>
			  <img src={profileImage} alt={`${designer.FirstName} ${designer.LastName}`} className="w-10 h-10 rounded-full mb-2" />
			  <h2 className="text-xl font-semibold text-black">{designer.FirstName} {designer.LastName}</h2>
			  <p className="text-sm text-gray-600">{designer.Primaryrole}</p>
			</Link>
		  );
		})}
	  </div>
	</div>
  );
}
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import md5 from "blueimp-md5";
import { SpeakerWaveIcon } from "@heroicons/react/24/outline";
import { PlusIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import LatestPodcastEpisode from "../components/LatestPodcastEpisode";


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

const locationOptions = [
  "All locations",
  "Atlanta GA",
  "Austin TX",
  "Bay Area - East Bay",
  "Bay Area - Peninsula/South Bay",
  "Bay Area - San Francisco",
  "Boston MA",
  "Canada",
  "Chicago IL",
  "Dallas TX",
  "Denver CO",
  "International",
  "Los Angeles CA",
  "New York Metro Area",
  "Other US",
  "Philadelphia PA",
  "Portland OR",
  "Remote",
  "San Diego CA",
  "Seattle WA",
  "Washington DC"
];

const roleOptions = [
  "All roles",
  "UX/UI Design",
  "Mobile design",
  "DesignOps",
  "Chief of Staff",
  "Design systems",
  "Service Design",
  "Marketing",
  "Branding",
  "Product",
  "Project/Program Management",
  "Software Engineering",
  "Hardware Engineering",
  "Data Science",
  "Administration",
  "Business Development",
  "Business Operations",
  "Sales",
  "QA",
  "Customer Success/Customer Support",
  "Other"
];

const experienceOptions = [
  "All experience levels",
  "Early Career (0-2 years)",
  "Mid Career (3-8 years)",
  "Late Career (9+ years)"
];

export default function Home() {
  const [designers, setDesigners] = useState([]);
  const [filteredDesigners, setFilteredDesigners] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
	location: "",
	primaryRole: "",
	roleType: "",
	experienceLevel: ""
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
		filters.location !== "All locations" &&
		(!designer.Location || !designer.Location.includes(filters.location))
	  ) {
		return false;
	  }

	  if (
		filters.primaryRole &&
		filters.primaryRole !== "All roles" &&
		(!designer.Primaryrole || !designer.Primaryrole.includes(filters.primaryRole))
	  ) {
		return false;
	  }

	  if (
		filters.roleType &&
		(!designer.Typeofrole || !designer.Typeofrole.includes(filters.roleType))
	  ) {
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

  const handleLocationChange = (e) => {
	setFilters((prev) => ({ ...prev, location: e.target.value }));
  };

  const handleRoleChange = (e) => {
	setFilters((prev) => ({ ...prev, primaryRole: e.target.value }));
  };

  const handleRoleTypeChange = (e) => {
	setFilters((prev) => ({ ...prev, roleType: e.target.value }));
  };

  const handleExperienceChange = (e) => {
	setFilters((prev) => ({ ...prev, experienceLevel: e.target.value }));
  };

  return (
	<div className="container mx-auto p-4">
	
	
	
	{/* Header with title and button */}
	  <div className="flex justify-between items-center mb-4">
		{/* Page Heading */}
		<h1 className="text-4xl font-bold mb-1 text-black">Design Talent</h1>
	  
		{/* Submit profile Button */}
		<Link href="https://forms.gle/MyArHLPThBEnjBo57" legacyBehavior>
		  <a
			target="_blank"
			className="cta flex items-center space-x-2 text-white py-2 px-4 rounded hover:bg-accent-gray-50 hover:no-underline mobile-button 
					  whitespace-nowrap min-w-[120px] justify-center"
		  >
			<PlusCircleIcon className="h-5 w-5" />
			<span>Add profile</span>
		  </a>
		</Link>
	  </div>
	  
	{/* Profile Count */}
	  <div className="text-sm text-gray-600">
		<p className="text-sm text-gray-600 mb-8 pb-4 border-b"><strong>{designers.length} talented designers</strong> are ready to rock &#128640;.</p>
	  </div>
	  

	  <div className="mb-4 space-y-4 mb-8">	  
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
		  <input
			type="text"
			placeholder="Search by name..."
			className="border p-2 w-full"
			value={search}
			onChange={(e) => setSearch(e.target.value)}
		  />

		  <select
			className="border p-2 w-full"
			value={filters.location || "All locations"}
			onChange={handleLocationChange}
		  >
			{locationOptions.map((loc, idx) => (
			  <option key={idx} value={loc}>
				{loc}
			  </option>
			))}
		  </select>

		  <select
			className="border p-2 w-full"
			value={filters.primaryRole || "All roles"}
			onChange={handleRoleChange}
		  >
			{roleOptions.map((role, idx) => (
			  <option key={idx} value={role}>
				{role}
			  </option>
			))}
		  </select>

		  <select
			className="border p-2 w-full"
			value={filters.roleType}
			onChange={handleRoleTypeChange}
		  >
			<option value="">All work types</option>
			<option value="Full-time">Full-time</option>
			<option value="Contract">Contract</option>
			<option value="Part-time">Part-time</option>
		  </select>
			  
			  
		  {/* Experience Level Filter */}
		  <select
			className="border p-2 w-full"
			value={filters.experienceLevel || "All experience levels"}
			onChange={handleExperienceChange}
		  >
			{experienceOptions.map((level, idx) => (
			  <option key={idx} value={level}>
				{level}
			  </option>
			))}
		  </select>
		</div>
	  </div>
	  
	  {/* Podcast promo block */}
	  <div className="mb-4 bg-white rounded">
		<LatestPodcastEpisode />
	  </div>
	  {/* Close podcast promo block */}

	  {/* Designers Grid */}
	  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
		{filteredDesigners.map((designer) => {
		  // Use the uploaded photo if available; otherwise, use Gravatar.
		  const profileImage = designer.Photooravatar
			? convertGoogleDriveUrl(designer.Photooravatar)
			: getGravatarUrl(designer.EmailAddress, 40);

	  
		  return (
			<Link
			  key={designer.id}
			  href={`/profile/${designer.id}`}
			  className="bg-white p-4 rounded hover:shadow-lg transition text-[#FF4725] no-underline hover:text-[#000000] hover:no-underline flex flex-col items-center text-center"
			>
			  <img
				src={profileImage}
				alt={`${designer.FirstName} ${designer.LastName}`}
				className="w-10 h-10 rounded-full mb-2 object-cover"
			  />
			  <h2 className="text-xl font-semibold text-black">
				{designer.FirstName} {designer.LastName}
			  </h2>
			  <p className="text-sm text-gray-600">{designer.Primaryrole}</p>
			</Link>
		  );
		})}
	  </div>
	</div>
  );
}

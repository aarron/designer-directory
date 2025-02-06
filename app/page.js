"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import md5 from "blueimp-md5";

function convertGoogleDriveUrl(url) {
  if (!url) return url;
  // If the URL already includes "thumbnail", assume it's correct.
  if (url.includes("thumbnail?")) return url;
  // Pattern for /file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)\/view/);
  if (fileMatch) {
	const fileId = fileMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  // Pattern for /open?id=FILE_ID
  const openMatch = url.match(/\/open\?id=([^&]+)/);
  if (openMatch) {
	const fileId = openMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  return url;
}


// Helper function to get Gravatar URL from an email address.
function getGravatarUrl(email, size = 40) {
  if (!email) return "";
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

// Define your location options (single select with "All Locations")
const locationOptions = [
  "All Locations",
  "Atlanta, GA",
  "Austin, TX",
  "Bay Area - East Bay",
  "Bay Area - Peninsula/South Bay",
  "Bay Area - San Francisco",
  "Boston, MA",
  "Canada",
  "Chicago, IL",
  "Dallas, TX",
  "Denver, CO",
  "International",
  "Los Angeles, CA",
  "New York Metro Area",
  "Open to remote",
  "Other US",
  "Philadelphia, PA",
  "Portland, OR",
  "Remote",
  "San Diego, CA",
  "Seattle, WA",
  "Washington, DC"
];

// Define your primary role options (with an "All Roles" option)
const roleOptions = [
  "All Roles",
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

// Define your experience level options
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
  // For filters, an empty string indicates no filter.
  const [filters, setFilters] = useState({
	location: "",       // single select for location
	primaryRole: "",    // single select for primary role
	roleType: "",       // single select for role type
	experienceLevel: "" // new filter for experience level
  });

  // Fetch designers data from our API route
  useEffect(() => {
	fetch("/api/designers")
	  .then((res) => res.json())
	  .then((data) => {
		setDesigners(data);
		setFilteredDesigners(data);
	  })
	  .catch((err) => console.error(err));
  }, []);

  // Apply additive filtering: a designer must meet all active criteria.
  useEffect(() => {
	const filtered = designers.filter((designer) => {
	  // First, filter out profiles that do NOT have permission to be public.
	  // We assume the normalized permission column is "PermissionCanweshareyourprofilepubliclyinourtalentdirectory".
	  if (
		designer.PermissionCanweshareyourprofilepubliclyinourtalentdirectory &&
		designer.PermissionCanweshareyourprofilepubliclyinourtalentdirectory.toLowerCase() === "no"
	  ) {
		return false;
	  }

	  // Filter by search term (name)
	  const fullName = `${designer.FirstName} ${designer.LastName}`.toLowerCase();
	  if (search && !fullName.includes(search.toLowerCase())) {
		return false;
	  }
	  // Filter by location if a specific location is selected (ignore "All Locations")
	  if (
		filters.location &&
		filters.location !== "All Locations" &&
		designer.Location !== filters.location
	  ) {
		return false;
	  }
	  // Filter by primary role if set (ignore "All Roles")
	  if (
		filters.primaryRole &&
		filters.primaryRole !== "All Roles" &&
		designer.Primaryrole !== filters.primaryRole
	  ) {
		return false;
	  }
	  // Filter by role type if set
	  if (filters.roleType && designer.Typeofrole !== filters.roleType) {
		return false;
	  }
	  // Filter by experience level if set (ignore "All experience levels")
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

  // Handler for location select (single select)
  const handleLocationChange = (e) => {
	setFilters((prev) => ({ ...prev, location: e.target.value }));
  };

  // Handler for primary role select
  const handleRoleChange = (e) => {
	setFilters((prev) => ({ ...prev, primaryRole: e.target.value }));
  };

  // Handler for role type select
  const handleRoleTypeChange = (e) => {
	setFilters((prev) => ({ ...prev, roleType: e.target.value }));
  };

  // Handler for experience level select
  const handleExperienceChange = (e) => {
	setFilters((prev) => ({ ...prev, experienceLevel: e.target.value }));
  };

  return (
	<div className="container mx-auto p-4">
	  <h1 className="text-3xl font-bold mb-4 text-gray-600">Talent Directory</h1>
	
	  {/* Filters Section */}
	  <div className="mb-4 space-y-4">
		{/* Container for filters */}
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
		  {/* Search Input */}
		  <input
			type="text"
			placeholder="Search by name..."
			className="border p-2 w-full"
			value={search}
			onChange={(e) => setSearch(e.target.value)}
		  />
	  
		  {/* Location Filter */}
		  <select
			className="border p-2 w-full"
			value={filters.location || "All Locations"}
			onChange={handleLocationChange}
		  >
			{locationOptions.map((loc, idx) => (
			  <option key={idx} value={loc}>
				{loc}
			  </option>
			))}
		  </select>
	  
		  {/* Primary Role Filter */}
		  <select
			className="border p-2 w-full"
			value={filters.primaryRole || "All Roles"}
			onChange={handleRoleChange}
		  >
			{roleOptions.map((role, idx) => (
			  <option key={idx} value={role}>
				{role}
			  </option>
			))}
		  </select>
	  
		  {/* Role Type Filter */}
		  <select
			className="border p-2 w-full"
			value={filters.roleType}
			onChange={handleRoleTypeChange}
		  >
			<option value="">All Work Types</option>
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
			  className="bg-white border p-4 rounded hover:shadow-lg transition text-[#FF4725] no-underline hover:text-[#000000] hover:underline flex flex-col items-center text-center"
			>
			  <img
				src={profileImage}
				alt={`${designer.FirstName} ${designer.LastName}`}
				className="w-10 h-10 rounded-full mb-2"
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

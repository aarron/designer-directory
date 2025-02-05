"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import md5 from "blueimp-md5";

// Helper function to generate Gravatar URL from an email address.
function getGravatarUrl(email, size = 150) {
  if (!email) return "";
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

// Helper function to convert Google Drive URLs to direct image links.
function convertGoogleDriveUrl(url) {
  // Pattern for /open?id=FILE_ID
  const openMatch = url.match(/\/open\?id=([^&]+)/);
  if (openMatch) {
	const fileId = openMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  // Pattern for /file/d/FILE_ID/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)\/view/);
  if (fileMatch) {
	const fileId = fileMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  return url;
}



export default function Profile() {
  const { id } = useParams(); // useParams returns the route parameters
  const router = useRouter();
  const [designer, setDesigner] = useState(null);

  useEffect(() => {
	fetch("/api/designers")
	  .then((res) => res.json())
	  .then((data) => {
		const found = data.find((d) => d.id == id);
		setDesigner(found);
	  })
	  .catch((err) => console.error(err));
  }, [id]);

  if (!designer) return <div>Loading...</div>;

  // If a photo URL is provided, convert it; otherwise, use Gravatar.
	const uploadedPhoto = designer.Photooravatar;
	const profileImage = uploadedPhoto
	  ? convertGoogleDriveUrl(uploadedPhoto)
	  : getGravatarUrl(designer.EmailAddress, 150);

  return (
	<div className="container mx-auto p-4">
	  <button
		onClick={() => router.back()}
		className="mb-4"
	  >
		&larr; Back
	  </button>
	  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
		{/* Left Column (1/3) */}
		<div className="md:col-span-1 flex flex-col items-center space-y-4">
		  <img
			src={profileImage}
			alt={`${designer.FirstName} ${designer.LastName}`}
			className="w-40 h-40 rounded-full object-cover"
		  />
		  {designer.LinkedInURL && (
			<a
			  href={designer.LinkedInURL}
			  target="_blank"
			  rel="noopener noreferrer"
			  className="font-bold"
			>
			  LinkedIn Profile
			</a>
			
		  )}
		  {designer.Websiteportfolio && (
			<a
			  href={designer.Websiteportfolio}
			  target="_blank"
			  rel="noopener noreferrer"
			  className="font-bold"
			>
			  Portfolio website
			</a>
		  )}
		  
		  {designer.EmailAddress && (
			  <a
				href={`mailto:${designer.EmailAddress}`}
				className="font-bold"
			  >
				Get in touch
			  </a>
			)}
		</div>

		{/* Right Column (2/3) */}
		<div className="md:col-span-2 space-y-4">
		  <h1 className="text-3xl font-bold highlight capitalize">
			{designer.FirstName} {designer.LastName}
		  </h1>
		  <p>
			<strong>Primary role:</strong> {designer.Primaryrole}
		  </p>
		  <p>
			  <strong>Most recent role:</strong> {designer.Currentormostrecenttitle}
			</p>
		  <p>
			<strong>Experience level:</strong> {designer.Yourexperiencelevel}
		  </p>
		  <p>
			  <strong>Availability:</strong> {designer.Timing}
		  </p>
		  <p>
			<strong>Ideal company size:</strong> {designer.Companysize}
		  </p>	  
		  <p className="pb-6">
			<strong>Location:</strong> {designer.Location}
		  </p>
		  <div className="mt-4 max-w-prose leading-7 border-t pt-9"><h3 className="font-bold text-xl capitalize pb-2">About {designer.FirstName}</h3><p>{designer.Shortbio}</p></div>
		</div>
	  </div>
	</div>
  );
}
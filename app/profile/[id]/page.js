"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import md5 from "blueimp-md5";
import { ArrowTopRightOnSquareIcon, EnvelopeIcon } from '@heroicons/react/24/outline';

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
  // Pattern for /file/d/([^/]+)/view
  const fileMatch = url.match(/\/file\/d\/([^/]+)\/view/);
  if (fileMatch) {
	const fileId = fileMatch[1];
	return `https://drive.google.com/thumbnail?sz=w320&id=${fileId}`;
  }
  return url;
}

export default function Profile() {
  const { id } = useParams();
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

  const uploadedPhoto = designer.Photooravatar;
  const profileImage = uploadedPhoto
	? convertGoogleDriveUrl(uploadedPhoto)
	: getGravatarUrl(designer.EmailAddress, 150);

  return (
	<div className="container mx-auto p-4">
	  
	  <div className="flex flex-col md:flex-row gap-6">
		{/* Left Column */}
		<div className="w-full md:w-64 shrink-0 flex flex-col items-start space-y-4">
		  <img
			src={profileImage}
			alt={`${designer.FirstName} ${designer.LastName}`}
			className="w-40 h-40 mt-14 mb-6 rounded-full object-cover"
		  />
		  {designer.LinkedInURL && (
			<a
			  href={designer.LinkedInURL}
			  target="_blank"
			  rel="noopener noreferrer"
			  className="flex items-center space-x-2"
			>
			  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
			  <span>LinkedIn Profile</span>
			</a>
		  )}
		  {designer.Websiteportfolio && (
			<a
			  href={designer.Websiteportfolio}
			  target="_blank"
			  rel="noopener noreferrer"
			  className="flex items-center space-x-2"
			>
			  <ArrowTopRightOnSquareIcon className="h-5 w-5" />
			  <span>Portfolio Website</span>
			</a>
		  )}
		  {designer.EmailAddress && (
			<a
			  href={`mailto:${designer.EmailAddress}`}
			  className="flex items-center space-x-2"
			>
			  <EnvelopeIcon className="h-5 w-5" />
			  <span>Get in Touch</span>
			</a>
		  )}
		</div>

		{/* Right Column */}
		<div className="flex-1 space-y-4">
		<button onClick={() => router.back()} className="mb-4">
			&larr; Back
		  </button>
		
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
		  <div className="mt-4 max-w-prose leading-7 border-t pt-9">
			<h3 className="font-bold text-xl capitalize pb-2">
			  About {designer.FirstName}
			</h3>
			<p>{designer.Shortbio}</p>
		  </div>
		</div>
	  </div>
	</div>
  );
}

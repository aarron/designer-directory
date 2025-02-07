"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowTopRightOnSquareIcon, EnvelopeIcon } from "@heroicons/react/24/outline";
import md5 from "blueimp-md5";

function getGravatarUrl(email, size = 150) {
  if (!email) return "";
  const hash = md5(email.trim().toLowerCase());
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}

function convertGoogleDriveUrl(url) {
  const openMatch = url.match(/\/open\?id=([^&]+)/);
  if (openMatch) return `https://drive.google.com/thumbnail?sz=w320&id=${openMatch[1]}`;

  const fileMatch = url.match(/\/file\/d\/([^/]+)\/view/);
  if (fileMatch) return `https://drive.google.com/thumbnail?sz=w320&id=${fileMatch[1]}`;

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

  const profileImage = designer.Photooravatar
	? convertGoogleDriveUrl(designer.Photooravatar)
	: getGravatarUrl(designer.EmailAddress, 150);

  return (
	<div className="container mx-auto p-4">
	  {/* Back Button */}
	  <button onClick={() => router.back()} className="mb-4 block">
		&larr; Back
	  </button>

	  {/* Profile Layout */}
	  <div className="flex flex-col md:flex-row gap-6 items-start">
		{/* LEFT COLUMN: Profile Photo & "Edit" Link (Now left-aligned on small screens) */}
		<div className="w-full md:w-64 flex flex-col items-start space-y-4">
		  <img src={profileImage} alt={`${designer.FirstName} ${designer.LastName}`} className="w-32 h-32 rounded-full object-cover" />
		  
		  {/* "Edit Profile" Link */}
		  <div className="text-xs text-gray-700">
			Is this your profile? <a className="highlight" href="https://forms.gle/MyArHLPThBEnjBo57" target="_blank">Edit</a>
		  </div>
		</div>

		{/* RIGHT COLUMN: Profile Details */}
		<div className="flex-1 space-y-4">
		  <h1 className="text-3xl font-bold highlight capitalize">
			{designer.FirstName} {designer.LastName}
		  </h1>

		  {/* Contact Links */}
		  <div className="space-y-2">
			{designer.LinkedInURL && (
			  <a href={designer.LinkedInURL} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
				<ArrowTopRightOnSquareIcon className="h-5 w-5" />
				<span>LinkedIn Profile</span>
			  </a>
			)}
			{designer.Websiteportfolio && (
			  <a href={designer.Websiteportfolio} target="_blank" rel="noopener noreferrer" className="flex items-center space-x-2">
				<ArrowTopRightOnSquareIcon className="h-5 w-5" />
				<span>Portfolio Website</span>
			  </a>
			)}
			{designer.EmailAddress && (
			  <a href={`mailto:${designer.EmailAddress}`} className="flex items-center space-x-2">
				<EnvelopeIcon className="h-5 w-5" />
				<span>Get in Touch</span>
			  </a>
			)}
		  </div>

		  {/* Work Details */}
		  <div className="border-t mt-6 pt-6 space-y-2">
			<p><strong>Primary role:</strong> {designer.Primaryrole}</p>
			<p><strong>Most recent role:</strong> {designer.Currentormostrecenttitle}</p>
			<p><strong>Experience level:</strong> {designer.Yourexperiencelevel}</p>
			<p><strong>Availability:</strong> {designer.Timing}</p>
			<p><strong>Ideal company size:</strong> {designer.Companysize}</p>
			<p className="pb-6"><strong>Location:</strong> {designer.Location}</p>
		  </div>

		  {/* Bio Section */}
		  <div className="mt-4 max-w-prose leading-7 border-t pt-6">
			<h3 className="font-bold text-xl capitalize pb-2">About {designer.FirstName}</h3>
			<p>{designer.Shortbio}</p>
		  </div>
		</div>
	  </div>
	</div>
  );
}
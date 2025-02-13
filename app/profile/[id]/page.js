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

  if (!designer) return <div><div role="status">
	  <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
		  <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
		  <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
	  </svg>
	  <span className="sr-only">Loading...</span>
  </div></div>;

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
			<p><strong>Preferred work location:</strong> {Array.isArray(designer.Location) ? designer.Location.join(", ") : designer.Location}</p>
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
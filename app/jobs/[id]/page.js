"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPinIcon, ClockIcon, CurrencyDollarIcon, UserCircleIcon, BuildingOffice2Icon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function JobDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  // Helper function: Format timestamp
  function formatDate(timestamp) {
	if (!timestamp) return "Unknown date";
  
	const parsedDate = new Date(timestamp);
	if (isNaN(parsedDate)) return "Invalid date";
  
	return parsedDate.toLocaleString("en-US", {
	  year: "numeric",
	  month: "short",
	  day: "numeric",
	  hour: "numeric",
	  minute: "2-digit",
	  hour12: true,
	});
  }

  useEffect(() => {
	if (!id) return;

	fetch("/api/jobs")
	  .then((res) => res.json())
	  .then((data) => {
		const foundJob = data.find((j) => j.id == id);
		setJob(foundJob || null);
	  })
	  .catch((err) => console.error("Error fetching job details:", err))
	  .finally(() => setLoading(false));
  }, [id]);

  if (loading)
	return (
	  <div className="flex justify-center items-center min-h-screen">
		<div role="status">
		  <svg
			aria-hidden="true"
			className="w-8 h-8 text-gray-200 animate-spin fill-red-600"
			viewBox="0 0 100 101"
			xmlns="http://www.w3.org/2000/svg"
		  >
			<path
			  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
			  fill="currentColor"
			/>
			<path
			  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
			  fill="currentFill"
			/>
		  </svg>
		  <span className="sr-only">Loading...</span>
		</div>
	  </div>
	);

  if (!job) return <div>Job not found.</div>;

  return (
	<div className="container mx-auto p-4">
	  {/* Back Button */}
	  <button onClick={() => router.back()} className="mb-4 block">
		← Back
	  </button>

	  {/* Job Details */}
	  <div className="flex flex-col md:flex-row gap-6 items-start">
		{/* LEFT COLUMN: Meta data and edit */}
		<div className="w-full mt-4 md:w-64 flex flex-col items-start space-y-4">
		  <div className="text-xs">
			Posted {formatDate(job.Timestamp)} <br /> by{" "}
			{job.LinkedInURL ? (
			  <a
				href={job.LinkedInURL}
				target="_blank"
				rel="noopener noreferrer"
				className="highlight"
			  >
				{job.FirstName} {job.LastName}
			  </a>
			) : (
			  `${job.FirstName} ${job.LastName}`
			)}
		  </div>

		  {/* "Edit Job" Link */}
		  <div className="text-xs text-gray-700">
			Did you post this job?{" "}
			<a
			  className="highlight"
			  href="https://forms.gle/W3z7oLiWJG3eryDp7"
			  target="_blank"
			>
			  Edit
			</a>
		  </div>
		</div>

		{/* RIGHT COLUMN: Job Details */}
		<div className="flex-1 space-y-4">
		  <div className="mb-4 border-b pb-4">
		  	<h1 className="text-3xl font-bold highlight capitalize mb-2">{job.Company}</h1>
		  	<h2 className="text-xl text-gray-700">{job.Title1 ? job.Title1 : job.Role}</h2>
		  </div>

		  {/* Core job details */}
		  <div className="space-y-2 pt-4 pb-4">
			<p className="flex items-center gap-2">
			  <MapPinIcon className="h-5 w-5 text-gray-600" /> 
			  <strong>Location:</strong> {job.Location}
			</p>
			{job.Typeofrole && (
			  <p className="flex items-center gap-2">
				<ClockIcon className="h-5 w-5 text-gray-600" /> 
				<strong>Employment type:</strong> {job.Typeofrole}
			  </p>
			)}
			{job.WhatsthecompensationrangeUSD && (
			  <p className="flex items-center gap-2">
				<CurrencyDollarIcon className="h-5 w-5 text-gray-600" /> 
				<strong>Salary range:</strong> {job.WhatsthecompensationrangeUSD}
			  </p>
			)}
			
			{job.Experiencelevelrequired && (
			  <p className="flex items-center gap-2">
				<UserCircleIcon className="h-5 w-5 text-gray-600" /> 
				<strong>Experience required:</strong> {job.Experiencelevelrequired}
			  </p>
			)}
			
			{job.Companysize && (
			  <p className="flex items-center gap-2">
				<BuildingOffice2Icon className="h-5 w-5 text-gray-600" /> 
				<strong>Company size:</strong> {job.Companysize}
			  </p>
			)}
		  </div>

		  {/* Job Description */}
		  <div className="border-t mt-6 pt-6 space-y-2">
			<h3 className="text-lg font-semibold">Job Description</h3>
			{/* External Job Link */}
			{job.JobdescriptionURL && (
			  <a
				href={job.JobdescriptionURL.startsWith("http") ? job.JobdescriptionURL : `https://${job.JobdescriptionURL}`}
				target="_blank"
				rel="noopener noreferrer"
				className="mt-4 inline-block hover:underline highlight"
			  >
				View job posting →
			  </a>
			)}
			<p className="text-gray-700 whitespace-pre-line">
			  {job.Ifthejobdescriptionisntonlinepostithere
				? job.Ifthejobdescriptionisntonlinepostithere
				: "No job description was provided."}
			</p>
		  </div>
		</div>
	  </div>
	</div>
  );
}
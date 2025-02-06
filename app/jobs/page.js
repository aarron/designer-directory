"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusIcon, PlusCircleIcon } from '@heroicons/react/24/solid';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
	fetch("/api/jobs")
	  .then((res) => res.json())
	  .then((data) => {
		console.log("Fetched Jobs Data:", data); // Debug API response
		setJobs(data);
	  })
	  .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  return (
	<div className="container mx-auto p-4">
	  {/* Header with "Jobs" title and "Submit Job" button */}
	  <div className="flex justify-between items-center mb-4">
		{/* Page Heading */}
		<h1 className="text-3xl font-bold text-gray-600">Design Jobs</h1>
	  
		{/* Submit Job Button */}
		<Link href="https://forms.gle/Cs3ZbyDd3rkW7rDp6" legacyBehavior>
		  <a target="_blank" className="flex items-center space-x-2 bg-black text-white py-2 px-4 rounded hover:bg-accent-gray-50 hover:no-underline mobile-button">
			<PlusCircleIcon className="h-5 w-5" />
			<span>Submit a job</span>
		  </a>
		</Link>
	  </div>
	  
	{/* Job Count */}
	  <p className="text-sm text-gray-600 mb-4 pb-4 border-b">
		<strong>{jobs.length}</strong> sweet jobs posted.
	  </p>

	  {/* Job Listings */}
	  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{jobs.map((job) => {
		  // Directly reference JobdescriptionURL
		  const jobUrl = job.JobdescriptionURL && job.JobdescriptionURL.startsWith("http")
			? job.JobdescriptionURL
			: null;
		
		  return (
			<div key={job.id} className="bg-white border p-4 rounded shadow-sm">
			  <h2 className="text-lg font-bold text-gray-800 highlight">{job.Company}</h2>
			  <p className="border-b pb-3 mb-3">{job.Title}</p>
			  <p className="text-xs text-gray-500">{job.Location}</p>
		
			  {/* Only show the link if `jobUrl` is valid */}
			  {jobUrl ? (
				<Link
				  href={jobUrl}
				  target="_blank"
				  rel="noopener noreferrer"
				  className="mt-2 block"
				>
				  View Job →
				</Link>
			  ) : (
				<p className="text-xs text-gray-400 mt-2">No job link available</p>
			  )}
			</div>
		  );
		})}
	  </div>
	</div>
  );
}
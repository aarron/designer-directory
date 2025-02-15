"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { PlusCircleIcon } from "@heroicons/react/24/solid";
import LatestPodcastEpisode from "../../components/LatestPodcastEpisode";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);

  useEffect(() => {
	fetch("/api/jobs")
	  .then((res) => res.json())
	  .then((data) => {
		console.log("Fetched Jobs Data:", data);
		setJobs(data);
	  })
	  .catch((err) => console.error("Error fetching jobs:", err));
  }, []);

  return (
	<div className="container mx-auto p-4">
	  {/* Header with "Jobs" title and "Submit Job" button */}
	  <div className="flex justify-between items-center mb-4">
		<h1 className="text-4xl font-bold text-black">Design Jobs</h1>

		<Link href="https://forms.gle/Cs3ZbyDd3rkW7rDp6" legacyBehavior>
		  <a
			target="_blank"
			className="cta flex items-center space-x-2 bg-black text-white py-2 px-4 rounded hover:bg-accent-gray-50 hover:no-underline mobile-button"
		  >
			<PlusCircleIcon className="h-5 w-5" />
			<span>Post job</span>
		  </a>
		</Link>
	  </div>

	  {/* Job Count */}
	  <p className="text-sm text-gray-600 mb-4 pb-4 border-b">
		<strong>{jobs.length}</strong> sweet job openings.
	  </p>

	  {/* Podcast promo block */}
	  <div className="mb-4 bg-white rounded">
		<LatestPodcastEpisode />
	  </div>

	  {/* Job Listings */}
	  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
		{jobs.map((job) => (
		  <Link key={job.id} href={`/jobs/${job.id}`} legacyBehavior>
			<a className="hover:no-underline">
			  <div className="bg-white p-4 rounded shadow-sm hover:shadow-md transition">
				<h2 className="text-lg font-bold text-gray-800 highlight">
				  {job.Company}
				</h2>
				<p className="border-b pb-3 mb-3">{job.Title1}</p>
				<p className="text-xs text-gray-500">{job.Location}</p>

				<p className="mt-2 block text-sm">View details →</p>
			  </div>
			</a>
		  </Link>
		))}
	  </div>
	</div>
  );
}
"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Import Next.js pathname hook

export default function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname(); // Get current page pathname

  return (
	<nav className="bg-gray-800 fixed pb-4 top-0 left-0 w-full z-20 border-b">
	  <div className="container mx-auto mt-4 p-4 flex flex-wrap items-center justify-between">
		{/* External link for Design Better */}
		<Link href="/" legacyBehavior>
		  <a className="flex items-center space-x-3 rtl:space-x-reverse">
			<img
			  className="w-20"
			  src="https://substackcdn.com/image/fetch/e_trim:10:white/e_trim:10:transparent/h_72,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4a9b8b3d-6f6f-410e-a9a3-9b52ca84c54a_1650x885.png"
			  alt="Design Better"
			/>
		  </a>
		</Link>
		
		{/* Mobile Menu Button */}
		<button
		  onClick={() => setMenuOpen(!menuOpen)}
		  type="button"
		  className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
		  aria-controls="navbar-default"
		  aria-expanded={menuOpen ? "true" : "false"}
		>
		  <span className="sr-only">Open main menu</span>
		  <svg
			className="w-5 h-5"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 17 14"
		  >
			<path
			  stroke="currentColor"
			  strokeLinecap="round"
			  strokeLinejoin="round"
			  strokeWidth="2"
			  d="M1 1h15M1 7h15M1 13h15"
			/>
		  </svg>
		</button>
	
		{/* Navigation Menu */}
		<div className={`w-full md:block md:w-auto ${menuOpen ? "" : "hidden"}`} id="navbar-default">
		  <ul className="font-medium flex flex-col space-y-4 md:flex-row md:space-x-6 md:space-y-0 p-4 md:p-0 mt-4 md:mt-0">
			<li>
			  <Link href="/" legacyBehavior>
				<a
				  className={`px-4 py-2 rounded hover:no-underline ${
					pathname === "/"
					  ? "bg-black text-white pointer-events-none" // Disable hover & clicks
					  : "text-white"
				  }`}
				>
				  Talent
				</a>
			  </Link>
			</li>
			<li>
			  <Link href="/jobs" legacyBehavior>
				<a
				  className={`px-4 py-2 rounded hover:no-underline ${
					pathname === "/jobs"
					  ? "bg-black text-white pointer-events-none" // Disable hover & clicks
					  : "text-white"
				  }`}
				>
				  Jobs
				</a>
			  </Link>
			</li>
		  </ul>
		</div>
	  </div>
	</nav>
  );
}
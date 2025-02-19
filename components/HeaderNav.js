"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function HeaderNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
	<nav className="bg-gray-800 fixed top-0 left-0 w-full z-20 border-b">
	  <div className="container mx-auto p-4 flex items-center justify-between">
		{/* Logo */}
		<Link href="/" legacyBehavior>
		  <a className="flex items-center space-x-3">
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
		  className="inline-flex items-center p-2 w-10 h-10 text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
		  aria-controls="navbar-menu"
		  aria-expanded={menuOpen ? "true" : "false"}
		>
		  <span className="sr-only">Open main menu</span>
		  <svg
			className="w-6 h-6"
			aria-hidden="true"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			strokeWidth="2"
		  >
			{menuOpen ? (
			  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
			) : (
			  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
			)}
		  </svg>
		</button>

		{/* Desktop Nav */}
		<div className="hidden md:flex space-x-6">
		  <Link href="/" legacyBehavior>
			<a
			  className={`px-4 py-2 rounded hover:no-underline text-sm ${
				pathname === "/" ? "bg-black text-white pointer-events-none" : "text-white"
			  }`}
			>
			  Talent
			</a>
		  </Link>
		  <Link href="/jobs" legacyBehavior>
			<a
			  className={`px-4 py-2 rounded hover:no-underline text-sm ${
				pathname === "/jobs" ? "bg-black text-white pointer-events-none" : "text-white"
			  }`}
			>
			  Jobs
			</a>
		  </Link>
		  <Link href="http://designbetterpodcast.com" legacyBehavior>
				<a
				  className={`px-4 py-2 rounded hover:no-underline text-white text-sm`}
				>
				  DB Home
				</a>
		  </Link>
		</div>
	  </div>

	  {/* Mobile Menu (Slide Out from Right) */}
	  <div
		className={`fixed top-0 right-0 w-64 h-full bg-white shadow-lg transform ${
		  menuOpen ? "translate-x-0" : "translate-x-full"
		} transition-transform duration-300 ease-in-out md:hidden z-30`}
	  >
		<div className="p-6 flex flex-col space-y-6">
		  <button
			onClick={() => setMenuOpen(false)}
			className="self-end text-gray-600 hover:text-black hover:no-underline"
		  >
			✕
		  </button>
		  <Link href="/" legacyBehavior>
			<a
			  onClick={() => setMenuOpen(false)}
			  className={`px-4 py-2 block text-gray-900 hover:bg-gray-100 rounded hover:no-underline ${
				pathname === "/" ? "font-bold" : ""
			  }`}
			>
			  Talent
			</a>
		  </Link>
		  <Link href="/jobs" legacyBehavior>
			<a
			  onClick={() => setMenuOpen(false)}
			  className={`px-4 py-2 block text-gray-900 hover:bg-gray-100 rounded hover:no-underline ${
				pathname === "/jobs" ? "font-bold" : ""
			  }`}
			>
			  Jobs
			</a>
		  </Link>
		  <Link href="http://designbetterpodcast.com" legacyBehavior>
		  	<a
				onClick={() => setMenuOpen(false)}
				className={`px-4 py-2 block text-gray-900 hover:bg-gray-100 rounded hover:no-underline`}
			  >
			  DB Home
			</a>
		  </Link>
		</div>
	  </div>

	  {/* Overlay for Mobile Menu (click to close) */}
	  {menuOpen && (
		<div
		  className="fixed inset-0 bg-black bg-opacity-50 md:hidden"
		  onClick={() => setMenuOpen(false)}
		/>
	  )}
	</nav>
  );
}

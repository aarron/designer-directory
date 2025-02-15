import "./globals.css";
import Link from "next/link";
import HeaderNav from "../components/HeaderNav"; // Adjust path if needed
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Head from "next/head";

export default function RootLayout({ children }) {
  return (
	<html lang="en">
	  <Head>
		<title>Design Better Directory | Connecting design talent to great jobs</title>
		<script src="https://unpkg.com/preline@1.5.0/dist/preline.js" defer></script>
	  </Head>

	  <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
		<header className="mb-32">
		  <HeaderNav />
		</header>
		<main className="flex-grow container mx-auto mt-8">{children}<Analytics/><SpeedInsights /></main>
		<footer className="mt-12 p-4 text-sm text-gray-600 container mx-auto flex flex-col md:flex-row md:justify-between">
		  <ul className="flex space-x-4">
			<li>
			  <Link href="https://designbetterpodcast.com/podcast" target="_blank">
				Design Better Podcast
			  </Link>
			</li>
			<li>
			  <Link href="https://designbetterpodcast.com" target="_blank">
				Design Better Substack
			  </Link>
			</li>
			<li>
			  <Link href="https://designbetterpodcast.com/p/design-better-for-teams" target="_blank">
				Design Better for Teams
			  </Link>
			</li>
			<li>
				<Link href="https://github.com/aarron/designer-directory/issues" target="_blank">
					Report a bug on Github
				</Link>
			</li>
		  </ul>
		  <p className="mt-4 md:mt-0 text-right">
			© {new Date().getFullYear()} The Curiosity Department LLC.
		  </p>
		</footer>
	  </body>
	</html>
  );
}

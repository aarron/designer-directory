// app/layout.js
import "./globals.css";  // Adjust the path if necessary
import Head from "next/head";

export default function RootLayout({ children }) {
  return (
	<html lang="en">
	  <head>
		<title>Design Better | Talent Directory</title>
		
		<script src="https://unpkg.com/preline@1.5.0/dist/preline.js" defer></script>
	  </head>
	  <body className="flex flex-col min-h-screen bg-gray-50 text-gray-900">
		  {/* Common header, nav, etc. can be placed here */}
		  <header className="mb-32">
			<nav className="bg-white dark:bg-gray-900 fixed w-full z-20 top-0 start-0 border-b border-gray-200 dark:border-gray-600">
			  <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-4">
				<a href="http://designbetter.com" className="flex items-left space-x-3 rtl:space-x-reverse">
					<img className="w-20" src="https://substackcdn.com/image/fetch/e_trim:10:white/e_trim:10:transparent/h_72,c_limit,f_auto,q_auto:good,fl_progressive:steep/https%3A%2F%2Fsubstack-post-media.s3.amazonaws.com%2Fpublic%2Fimages%2F4a9b8b3d-6f6f-410e-a9a3-9b52ca84c54a_1650x885.png" alt="Design Better" />
				</a>
				<button data-collapse-toggle="navbar-default" type="button" className="inline-flex items-center p-2 w-10 h-10 justify-center text-sm text-gray-500 rounded-lg md:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600" aria-controls="navbar-default" aria-expanded="false">
					<span className="sr-only">Open main menu</span>
					<svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 17 14">
						<path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M1 1h15M1 7h15M1 13h15"/>
					</svg>
				</button>
				<div className="hidden w-full md:block md:w-auto" id="navbar-default">
				  <ul className="font-medium flex flex-col p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-gray-50 md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0 md:bg-white dark:bg-gray-800 md:dark:bg-gray-900 dark:border-gray-700">
					<li>
					  <a href="/" className="block py-2 px-3 rounded-sm md:bg-transparent" aria-current="page">Home</a>
					</li>
					<li>
					  <a href="https://forms.gle/MyArHLPThBEnjBo57" target="_blank" className="block py-2 px-3">Submit a profile</a>
					</li>
					<li>
					  <a href="https://forms.gle/Cs3ZbyDd3rkW7rDp6" target="_blank" className="block py-2 px-3">Submit a job</a>
					</li>
				  </ul>
				</div>
			  </div>
			</nav>
			
		  </header>
		  
		  <main className="flex-grow">{children}</main>
		  <footer className="p-4 text-center text-sm text-gray-600 bg-white">
		  	<a href="http://designbetterpodcast.com" className="highlight" target="_blank">Join the <strong>Design Better</strong> community.</a> | 
			© {new Date().getFullYear()} The Curiosity Department LLC.
		  </footer>
		</body>
	</html>
  );
}

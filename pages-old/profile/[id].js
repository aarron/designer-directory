// pages/profile/[id].js
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function Profile() {
  const router = useRouter();
  const { id } = router.query;
  const [designer, setDesigner] = useState(null);

  useEffect(() => {
	if (!id) return;
	fetch('/api/designers')
	  .then((res) => res.json())
	  .then((data) => {
		const found = data.find((d) => d.id == id);
		setDesigner(found);
	  })
	  .catch((err) => console.error(err));
  }, [id]);

  if (!designer) {
	return <div className="container mx-auto p-4">Loading...</div>;
  }

  return (
	<div className="container mx-auto p-4">
	  <button
		className="mb-4 text-blue-500"
		onClick={() => router.back()}
	  >
		← Back
	  </button>
	  <div className="flex flex-col md:flex-row">
		{designer.PhotoURL && (
		  <img
			src={designer.PhotoURL}
			alt={`${designer.FirstName} ${designer.LastName}`}
			className="w-full md:w-1/3 h-auto object-cover rounded mr-4"
		  />
		)}
		<div>
		  <h1 className="text-3xl font-bold mb-2">
			{designer.FirstName} {designer.LastName}
		  </h1>
		  <p>
			<strong>Primary Role:</strong> {designer.PrimaryRole}
		  </p>
		  <p>
			<strong>Experience Level:</strong> {designer.ExperienceLevel}
		  </p>
		  <p>
			<strong>Location:</strong> {designer.Location}
		  </p>
		  {designer.LinkedInProfile && (
			<p>
			  <strong>LinkedIn:</strong>{' '}
			  <a
				href={designer.LinkedInProfile}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-500"
			  >
				{designer.LinkedInProfile}
			  </a>
			</p>
		  )}
		  {designer.PortfolioWebsite && (
			<p>
			  <strong>Portfolio:</strong>{' '}
			  <a
				href={designer.PortfolioWebsite}
				target="_blank"
				rel="noopener noreferrer"
				className="text-blue-500"
			  >
				{designer.PortfolioWebsite}
			  </a>
			</p>
		  )}
		  <p className="mt-4">{designer.Bio}</p>
		</div>
	  </div>
	</div>
  );
}

// pages/index.js
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Home() {
  const [designers, setDesigners] = useState([]);
  const [filteredDesigners, setFilteredDesigners] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({
	location: '',
	primaryRole: '',
	roleType: '',
  });

  // Fetch designers data from our API route
  useEffect(() => {
	fetch('/api/designers')
	  .then((res) => res.json())
	  .then((data) => {
		setDesigners(data);
		setFilteredDesigners(data);
	  })
	  .catch((err) => console.error(err));
  }, []);

  // Apply search and filter whenever designers, search, or filter values change
  useEffect(() => {
	let filtered = designers;

	if (search) {
	  filtered = filtered.filter((designer) =>
		`${designer.FirstName} ${designer.LastName}`
		  .toLowerCase()
		  .includes(search.toLowerCase())
	  );
	}
	if (filters.location) {
	  filtered = filtered.filter(
		(designer) => designer.Location === filters.location
	  );
	}
	if (filters.primaryRole) {
	  filtered = filtered.filter(
		(designer) => designer.PrimaryRole === filters.primaryRole
	  );
	}
	if (filters.roleType) {
	  filtered = filtered.filter(
		(designer) => designer.RoleType === filters.roleType
	  );
	}

	setFilteredDesigners(filtered);
  }, [search, filters, designers]);

  // Build unique options for the dropdowns
  const locations = [...new Set(designers.map((d) => d.Location))];
  const primaryRoles = [...new Set(designers.map((d) => d.PrimaryRole))];
  const roleTypes = [...new Set(designers.map((d) => d.RoleType))];

  return (
	<div className="container mx-auto p-4">
	  <h1 className="text-3xl font-bold mb-4">Designer Directory</h1>

	  {/* Filters */}
	  <div className="mb-4 flex flex-col md:flex-row md:space-x-4 space-y-2 md:space-y-0">
		<input
		  type="text"
		  placeholder="Search by name..."
		  className="border p-2 flex-1"
		  value={search}
		  onChange={(e) => setSearch(e.target.value)}
		/>
		<select
		  className="border p-2"
		  value={filters.location}
		  onChange={(e) =>
			setFilters({ ...filters, location: e.target.value })
		  }
		>
		  <option value="">All Locations</option>
		  {locations.map((loc, idx) => (
			<option key={idx} value={loc}>
			  {loc}
			</option>
		  ))}
		</select>
		<select
		  className="border p-2"
		  value={filters.primaryRole}
		  onChange={(e) =>
			setFilters({ ...filters, primaryRole: e.target.value })
		  }
		>
		  <option value="">All Roles</option>
		  {primaryRoles.map((role, idx) => (
			<option key={idx} value={role}>
			  {role}
			</option>
		  ))}
		</select>
		<select
		  className="border p-2"
		  value={filters.roleType}
		  onChange={(e) =>
			setFilters({ ...filters, roleType: e.target.value })
		  }
		>
		  <option value="">All Role Types</option>
		  {roleTypes.map((type, idx) => (
			<option key={idx} value={type}>
			  {type}
			</option>
		  ))}
		</select>
	  </div>

	  {/* Designers Grid */}
	  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
		{filteredDesigners.map((designer) => (
		  <Link key={designer.id} href={`/profile/${designer.id}`}>
			<a className="border p-4 rounded hover:shadow-lg transition">
			  {designer.PhotoURL && (
				<img
				  src={designer.PhotoURL}
				  alt={`${designer.FirstName} ${designer.LastName}`}
				  className="w-full h-48 object-cover mb-4 rounded"
				/>
			  )}
			  <h2 className="text-xl font-semibold">
				{designer.FirstName} {designer.LastName}
			  </h2>
			  <p>{designer.PrimaryRole}</p>
			  <p>{designer.Location}</p>
			</a>
		  </Link>
		))}
	  </div>
	</div>
  );
}

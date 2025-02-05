// pages/api/designers.js
import Papa from 'papaparse';

export default async function handler(req, res) {
  // Replace this URL with your published Google Sheet CSV URL
  const csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQm5QX6y8ovabl3pF7B49Tv3ByA-HoLjb3d90xV0lP9WEFmjSZSkSyCColxPk1o4IbszU17oJL9126R/pub?gid=930295771&single=true&output=csv';

  try {
	const response = await fetch(csvUrl);
	const csvData = await response.text();

	// Parse CSV data – using header:true to use the first row as keys.
	const parsed = Papa.parse(csvData, { header: true });

	// Optionally, add an `id` field to each row (using the index) so we can use it for profile URLs.
	const designers = parsed.data.map((row, index) => ({
	  id: index,
	  ...row,
	}));

	res.status(200).json(designers);
  } catch (error) {
	res.status(500).json({ error: 'Failed to fetch data' });
  }
}

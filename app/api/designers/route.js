// app/api/designers/route.js
// https://docs.google.com/spreadsheets/d/e/2PACX-1vQm5QX6y8ovabl3pF7B49Tv3ByA-HoLjb3d90xV0lP9WEFmjSZSkSyCColxPk1o4IbszU17oJL9126R/pub?gid=930295771&single=true&output=csv

// app/api/designers/route.js
import Papa from "papaparse";

// Helper function to normalize keys (remove spaces, punctuation)
function normalizeKey(key) {
  return key.replace(/[^a-zA-Z0-9]/g, "");
}

export async function GET(_request) {
  // Use your actual published Google Sheet CSV URL
  const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vQm5QX6y8ovabl3pF7B49Tv3ByA-HoLjb3d90xV0lP9WEFmjSZSkSyCColxPk1o4IbszU17oJL9126R/pub?gid=930295771&single=true&output=csv";

  try {
	const response = await fetch(csvUrl);
	const csvData = await response.text();

	// Log the raw CSV data to inspect it in your terminal
	// console.log("CSV Data:", csvData);

	// Parse the CSV with headers
	const parsed = Papa.parse(csvData, { header: true });
	console.log("Parsed Data:", parsed.data);

	// Normalize keys for each row
	const designers = parsed.data.map((row, index) => {
	  const normalizedRow = {};
	  for (const key in row) {
		const normalizedKey = normalizeKey(key);
		normalizedRow[normalizedKey] = row[key];
	  }
	  return { id: index, ...normalizedRow };
	});

	console.log("Normalized Designers:", designers);

	return new Response(JSON.stringify(designers), {
	  status: 200,
	  headers: { "Content-Type": "application/json" },
	});
  } catch (error) {
	console.error("Error fetching or parsing CSV:", error);
	return new Response(JSON.stringify({ error: "Failed to fetch data" }), {
	  status: 500,
	  headers: { "Content-Type": "application/json" },
	});
  }
}

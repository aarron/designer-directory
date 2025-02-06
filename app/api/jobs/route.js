import Papa from "papaparse";

// Helper function to normalize keys (remove spaces, punctuation)
function normalizeKey(key) {
  return key.replace(/[^a-zA-Z0-9]/g, "");
}

export async function GET(_request) {
  const csvUrl =
	"https://docs.google.com/spreadsheets/d/e/2PACX-1vQ2lPv6W5fKgaiDQyV_dVFFnT-piRV-WMEiQtPxtaUMc2U_b4yFR07HDrWa19PpbpEUg9A96FlLIFFd/pub?output=csv";

  try {
	const response = await fetch(csvUrl);
	const csvData = await response.text();

	// Parse the CSV with headers
	const parsed = Papa.parse(csvData, { header: true });

	// Normalize keys and clean up data
	const jobs = parsed.data.map((row, index) => {
	  const normalizedRow = {};
	  for (const key in row) {
		const normalizedKey = normalizeKey(key);
		normalizedRow[normalizedKey] = row[key]?.trim() || "";
	  }
	  return { id: index, ...normalizedRow };
	});

	return new Response(JSON.stringify(jobs), {
	  status: 200,
	  headers: { "Content-Type": "application/json" },
	});
  } catch (error) {
	console.error("Error fetching or parsing CSV:", error);
	return new Response(JSON.stringify({ error: "Failed to fetch job data" }), {
	  status: 500,
	  headers: { "Content-Type": "application/json" },
	});
  }
}
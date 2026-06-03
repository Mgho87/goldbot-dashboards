import { NextResponse } from "next/server";

// Live data comes ONLY from a Google Apps Script Web App (/exec URL).
// No Google Sheets API, no credentials, no OAuth, no API key.
export const dynamic = "force-dynamic";
export const revalidate = 0;

function getExecUrl() {
  return (
    process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
    process.env.APPS_SCRIPT_EXEC_URL ||
    process.env.APPS_SCRIPT_URL ||
    ""
  ).trim();
}

export async function GET() {
  const url = getExecUrl();

  if (!url) {
    return NextResponse.json(
      {
        mode: "not-configured",
        rows: [],
        fetchedAt: new Date().toISOString(),
        message: "Set NEXT_PUBLIC_APPS_SCRIPT_URL to your Apps Script /exec link.",
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  try {
    const res = await fetch(url, { cache: "no-store", redirect: "follow" });
    if (!res.ok) throw new Error(`Apps Script responded ${res.status}`);
    const json = await res.json();
    const rows = Array.isArray(json.rows) ? json.rows : [];
    return NextResponse.json(
      {
        mode: "live",
        rows,
        analytics: json.analytics || null,
        fetchedAt: json.fetchedAt || new Date().toISOString(),
        message:
          rows.length === 0
            ? "Connected, but the Apps Script returned no rows. Check the tab names (Deira, SZ, DMCC)."
            : null,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    return NextResponse.json(
      {
        mode: "error",
        rows: [],
        fetchedAt: new Date().toISOString(),
        message: `Could not reach the Apps Script Web App: ${err.message}. Re-deploy with access "Anyone".`,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  }
}

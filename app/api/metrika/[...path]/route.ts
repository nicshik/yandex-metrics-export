import { NextRequest, NextResponse } from "next/server";

const BASE_URL = "https://api-metrika.yandex.net";

async function proxyRequest(req: NextRequest, method: string) {
  const url = new URL(req.url);
  const pathSegments = url.pathname.replace("/api/metrika/", "");
  const targetUrl = `${BASE_URL}/${pathSegments}${url.search}`;

  const token = req.headers.get("x-metrika-token");
  if (!token) {
    return NextResponse.json(
      { error: "Token is required (x-metrika-token header)" },
      { status: 401 }
    );
  }

  try {
    const headers: Record<string, string> = {
      Authorization: `OAuth ${token}`,
    };

    const fetchOptions: RequestInit = { method, headers };

    if (method === "POST" && req.body) {
      try {
        const body = await req.text();
        if (body) {
          fetchOptions.body = body;
          headers["Content-Type"] = "application/json";
        }
      } catch {
        // no body
      }
    }

    const response = await fetch(targetUrl, fetchOptions);

    const isDownload = pathSegments.includes("/download");

    if (isDownload) {
      // Yandex returns TSV with content-type: application/json — ignore it
      const buffer = await response.arrayBuffer();
      return new NextResponse(buffer, {
        status: response.status,
        headers: {
          "Content-Type": "text/tab-separated-values; charset=utf-8",
          "Content-Disposition": `attachment; filename="metrika_export.tsv"`,
        },
      });
    }

    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      const data = await response.json();
      return NextResponse.json(data, { status: response.status });
    }

    const buffer = await response.arrayBuffer();
    return new NextResponse(buffer, {
      status: response.status,
      headers: { "Content-Type": contentType || "application/octet-stream" },
    });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Proxy request failed";
    console.error("[metrika proxy]", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  return proxyRequest(req, "GET");
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, "POST");
}

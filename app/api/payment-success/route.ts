import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get request body
    const body = await request.json().catch(async () => {
      // If JSON parsing fails, try to get as text
      const text = await request.text();
      return { raw: text };
    });

    // Get all headers
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const queryParams: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      queryParams[key] = value;
    });

    // Prepare response data
    const responseData = {
      success: true,
      method: "POST",
      timestamp: new Date().toISOString(),
      body: body,
      queryParams: queryParams,
      headers: headers,
      url: request.url,
    };

    return NextResponse.json(responseData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 400 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Get query parameters
  const { searchParams } = new URL(request.url);
  const queryParams: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    queryParams[key] = value;
  });

  // Get all headers
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  // Prepare response data
  const responseData = {
    success: true,
    method: "GET",
    timestamp: new Date().toISOString(),
    queryParams: queryParams,
    headers: headers,
    url: request.url,
  };

  return NextResponse.json(responseData, { status: 200 });
}

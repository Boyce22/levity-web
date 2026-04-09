import { NextRequest, NextResponse } from "next/server";
import { serverFetch } from "@/lib/http";

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ bucketName: string; fileName: string[] }> }
) {
  const { bucketName, fileName } = await props.params;

  const hasInvalidSegment = fileName.some(
    (s) => s === ".." || s === "." || s === "" || s.includes("/") || s.includes("\\")
  );
  if (hasInvalidSegment) {
    return new NextResponse("Invalid file path.", { status: 400 });
  }

  const fileKey = fileName.join("/");
  const { searchParams } = new URL(req.url);
  const query = searchParams.toString();

  const apiRes = await serverFetch(
    `/api/files/${bucketName}/${fileKey}${query ? `?${query}` : ""}`
  );

  if (!apiRes.ok) {
    return new NextResponse(await apiRes.text(), { status: apiRes.status });
  }

  const contentType = apiRes.headers.get("content-type") ?? "application/octet-stream";
  const disposition = apiRes.headers.get("content-disposition");

  const headers = new Headers();
  headers.set("Content-Type", contentType);
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  if (disposition) headers.set("Content-Disposition", disposition);

  return new NextResponse(apiRes.body, { status: 200, headers });
}

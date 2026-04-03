import { NextRequest, NextResponse } from "next/server";
import B2 from 'backblaze-b2';
import { cookies } from "next/headers";
import { verifyJwtToken } from "@/lib/auth";
import { SupabaseWorkspaceRepository } from "@/repositories/supabase/workspace.repository";

const b2 = new B2({
  applicationKeyId: process.env.BACKBLAZE_KEY_ID || '',
  applicationKey: process.env.BACKBLAZE_APP_KEY || '',
});

let isB2Authorized = false;

export async function GET(
  req: NextRequest,
  props: { params: Promise<{ bucketName: string, fileName: string[] }> }
) {
  const params = await props.params;
  const { bucketName, fileName } = params;
  const fileKey = fileName.join('/');
  
  // ─── SECURITY LAYER: IDOR PROTECTION ────────────────────────
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    
    const payload = await verifyJwtToken(token);
    if (!payload?.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = payload.id as string;

    // A primeira parte do fileName DEVE ser o workspaceId para validação de IDOR
    const workspaceId = fileName[0];
    
    const workspaceRepo = new SupabaseWorkspaceRepository();
    const member = await workspaceRepo.findMember(workspaceId, userId);
    
    if (!member) {
      console.warn(`[Security] Unauthorized access attempt by ${userId} to workspace ${workspaceId}`);
      return new NextResponse("Forbidden: You do not have access to this workspace's files.", { status: 403 });
    }
  } catch (authError) {
    console.error("Auth security check failed:", authError);
    return new NextResponse("Security Check Failed", { status: 500 });
  }
  // ────────────────────────────────────────────────────────────

  try {
    if (!isB2Authorized) {
      await b2.authorize();
      isB2Authorized = true;
    }

    // Tenta baixar o arquivo
    let response;
    try {
      response = await b2.downloadFileByName({
        bucketName,
        fileName: fileKey,
        responseType: 'arraybuffer'
      });
    } catch (err: any) {
      // Se falhar com 401 ou erro de auth, tenta re-autorizar e repetir uma vez
      if (err.status === 401) {
        console.log("B2 token expired, re-authorizing...");
        await b2.authorize();
        isB2Authorized = true;
        response = await b2.downloadFileByName({
          bucketName,
          fileName: fileKey,
          responseType: 'arraybuffer'
        });
      } else {
        throw err;
      }
    }

    const contentType = response.headers['content-type'] || 'application/octet-stream';
    const isImage = contentType.startsWith('image/');
    
    // Pega o nome do arquivo original da query param se houver
    const { searchParams } = new URL(req.url);
    const downloadName = searchParams.get('name') || fileKey.split('/').pop();

    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': isImage ? 'inline' : `attachment; filename="${encodeURIComponent(downloadName || 'file')}"`,
      }
    });

  } catch (error: any) {
    console.error(`B2 Proxy Error [${bucketName}/${fileKey}]:`, error.message || error);
    return new NextResponse("File not found or private proxy failed.", { status: 404 });
  }
}

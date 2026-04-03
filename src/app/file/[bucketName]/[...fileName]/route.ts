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
  
  // 🛡️ Security Check: Prevent Path Traversal and invalid paths
  const hasInvalidSegment = fileName.some(segment => 
    segment === '..' || segment === '.' || segment === '' || segment.includes('/') || segment.includes('\\')
  );
  if (hasInvalidSegment) {
    return new NextResponse("Invalid file path.", { status: 400 });
  }

  const fileKey = fileName.join('/');
  
  // ─── SECURITY LAYER: IDOR PROTECTION ────────────────────────
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 401 });
    
    const payload = await verifyJwtToken(token);
    if (!payload?.id) return new NextResponse("Unauthorized", { status: 401 });
    const userId = payload.id as string;

    // O primeiro segmento é SEMPRE o workspaceId
    const workspaceId = fileName[0];
    const destination = fileName[1]; // 'attachments', 'profiles', etc.
    
    const workspaceRepo = new SupabaseWorkspaceRepository();
    
    // 📂 Caso especial: Imagens de Perfil (Profiles)
    // Mesmo estando dentro de um workspace, permitimos acesso se houver qualquer 
    // relação de workspace entre o visualizador e o dono da imagem.
    if (destination === 'profiles') {
       // O nome do arquivo pode ser userId.ext ou userId_uuid.ext
       const rawFilename = fileName[2] || "";
       const avatarOwnerId = rawFilename.split('.')[0]?.split('_')[0];
       
       if (!avatarOwnerId) return new NextResponse("Malformed profile request.", { status: 400 });
       
       if (userId !== avatarOwnerId) {
         const isShared = await workspaceRepo.hasSharedWorkspace(userId, avatarOwnerId);
         if (!isShared) {
           console.warn(`[Security] Unauthorized profile access attempt by ${userId} to user ${avatarOwnerId}`);
           return new NextResponse("Forbidden: You do not share a workspace with this user.", { status: 403 });
         }
       }
    } else {
      // 🛡️ Caso padrão (Ex: attachments): Apenas membros do workspaceId do primeiro segmento
      const member = await workspaceRepo.findMember(workspaceId, userId);
      if (!member) {
        console.warn(`[Security] Unauthorized access attempt by ${userId} to workspace ${workspaceId}`);
        return new NextResponse("Forbidden: You do not have access to this workspace's files.", { status: 403 });
      }
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

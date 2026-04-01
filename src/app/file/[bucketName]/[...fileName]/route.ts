import { NextRequest, NextResponse } from "next/server";
import B2 from 'backblaze-b2';

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
  
  try {
    if (!isB2Authorized) {
      await b2.authorize();
      isB2Authorized = true;
    }

    const fileKey = fileName.join('/');

    // Faz o fetch do arquivo restrito e joga no buffer
    const response = await b2.downloadFileByName({
      bucketName,
      fileName: fileKey,
      responseType: 'arraybuffer'
    });

    // Retorna o binário da imagem perfeitamente como se fosse um servidor local de assets
    return new NextResponse(response.data, {
      status: 200,
      headers: {
        'Content-Type': response.headers['content-type'] || 'image/jpeg',
        'Cache-Control': 'public, max-age=31536000, immutable',
      }
    });

  } catch (error: any) {
    console.error("B2 Proxy Error:", error.message || error);
    return new NextResponse("File not found or private proxy failed.", { status: 404 });
  }
}

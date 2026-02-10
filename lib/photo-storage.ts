import { randomUUID } from 'crypto';
import path from 'path';
import { mkdir, writeFile } from 'fs/promises';

export type UploadMode = 's3' | 'local';

export function getUploadMode(): UploadMode {
  if (process.env.PHOTO_UPLOAD_MODE === 'local') {
    return 'local';
  }

  const hasS3 = Boolean(
    process.env.S3_BUCKET &&
      process.env.S3_REGION &&
      process.env.S3_ACCESS_KEY_ID &&
      process.env.S3_SECRET_ACCESS_KEY,
  );

  return hasS3 ? 's3' : 'local';
}

function extFromFilename(fileName: string): string {
  const ext = path.extname(fileName).toLowerCase();
  return ext && ext.length <= 8 ? ext : '.bin';
}

export function buildUploadKey(siteId: number, fileName: string): string {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, '0');
  return `sites/${siteId}/${yyyy}/${mm}/${randomUUID()}${extFromFilename(fileName)}`;
}

async function getS3Helpers() {
  try {
    const [{ PutObjectCommand, S3Client }, { getSignedUrl }] = await Promise.all([
      import('@aws-sdk/client-s3'),
      import('@aws-sdk/s3-request-presigner'),
    ]);

    return {
      PutObjectCommand,
      S3Client,
      getSignedUrl,
    };
  } catch {
    throw new Error('S3 SDK modules are missing. Install @aws-sdk/client-s3 and @aws-sdk/s3-request-presigner.');
  }
}

export async function getSignedPhotoUploadUrl(params: {
  key: string;
  contentType: string;
}): Promise<{ uploadUrl: string; publicUrl: string }> {
  const bucket = process.env.S3_BUCKET;
  const region = process.env.S3_REGION;
  const endpoint = process.env.S3_ENDPOINT;
  const accessKeyId = process.env.S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

  if (!bucket || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('Missing S3 environment variables.');
  }

  const { PutObjectCommand, S3Client, getSignedUrl } = await getS3Helpers();

  const client = new S3Client({
    region,
    endpoint: endpoint || undefined,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
    credentials: { accessKeyId, secretAccessKey },
  });

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: params.key,
    ContentType: params.contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn: 60 * 5 });
  const publicBase =
    process.env.S3_PUBLIC_BASE_URL?.replace(/\/$/, '') ?? `https://${bucket}.s3.${region}.amazonaws.com`;

  return {
    uploadUrl,
    publicUrl: `${publicBase}/${params.key}`,
  };
}

export async function saveLocalUpload(params: {
  siteId: number;
  fileName: string;
  bytes: Uint8Array;
}): Promise<string> {
  const key = buildUploadKey(params.siteId, params.fileName);
  const relativePath = path.join('uploads', key);
  const fullPath = path.join(process.cwd(), 'public', relativePath);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, params.bytes);
  return `/${relativePath.replace(/\\/g, '/')}`;
}

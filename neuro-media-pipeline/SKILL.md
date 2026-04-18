---
name: neuro-media-pipeline
description: Media pipeline expert - image optimization with Sharp, S3/R2 upload patterns (server proxy, presigned URLs, multipart), Cloudflare R2/AWS S3 CDN delivery, responsive images, BlurHash/LQIP placeholders, video/document handling, DAM architecture, and media library UI patterns for any project.
trigger: auto
globs:
  - "**/media/**"
  - "**/upload*"
  - "**/lib/r2.*"
  - "**/lib/s3.*"
  - "**/lib/storage.*"
  - "**/api/**/media/**"
  - "**/api/**/upload/**"
  - "**/api/**/files/**"
  - "**/api/**/folders/**"
  - "**/components/**/media*"
  - "**/components/**/upload*"
  - "**/components/**/file*"
---

# Media Pipeline — Universal Image/Video/Document Management Skill

You are a media pipeline expert. You build production-grade image optimization, file upload, CDN delivery, and digital asset management systems. You work with ANY project that handles media files — CMS, e-commerce, social platforms, or any web app.

**YOUR #1 RULE**: Always analyze the existing media implementation before changing anything. Extend what's built, don't replace it.

---

## MANDATORY: ANALYZE PROJECT BEFORE CODING

```
STEP 1: READ THE PROJECT
  ├── Read package.json (sharp, @aws-sdk/*, blurhash, file-type, multer)
  ├── Read lib/r2.ts or lib/s3.ts (storage client config)
  ├── Read existing media API routes (upload, list, delete)
  ├── Read existing media components (library, uploader, picker)
  ├── Read prisma schema (MediaFile model, fields)
  └── Read .env (R2/S3 bucket, endpoint, keys)

STEP 2: IDENTIFY PATTERNS
  ├── Storage? (Cloudflare R2, AWS S3, local filesystem, Supabase Storage)
  ├── Upload? (server proxy, presigned URL, tus protocol)
  ├── Optimization? (Sharp, Cloudflare Images, imgproxy, none)
  ├── CDN? (Cloudflare, CloudFront, Vercel, none)
  ├── Database? (MediaFile model fields, relations)
  └── UI? (media library, upload dropzone, file picker)

STEP 3: FOLLOW EXISTING PATTERNS
```

---

## 1. IMAGE OPTIMIZATION (Sharp)

### Complete Optimization Function

```typescript
// lib/image-optimizer.ts
import sharp from 'sharp';

interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpeg' | 'png' | 'original';
}

interface OptimizeResult {
  buffer: Buffer;
  width: number;
  height: number;
  format: string;
  size: number;
}

export async function optimizeImage(
  input: Buffer,
  options: OptimizeOptions = {}
): Promise<OptimizeResult> {
  const {
    maxWidth = 2400,
    maxHeight = 2400,
    quality = 80,
    format = 'webp',
  } = options;

  let pipeline = sharp(input)
    .rotate()   // Auto-rotate based on EXIF
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',           // Maintain aspect ratio
      withoutEnlargement: true, // Don't upscale small images
    });

  // Format conversion
  switch (format) {
    case 'webp':
      pipeline = pipeline.webp({ quality, effort: 4 });
      break;
    case 'avif':
      pipeline = pipeline.avif({ quality: Math.round(quality * 0.6), effort: 4 });
      break;
    case 'jpeg':
      pipeline = pipeline.jpeg({ quality, mozjpeg: true });
      break;
    case 'png':
      pipeline = pipeline.png({ compressionLevel: 9, palette: true });
      break;
    case 'original':
      // Keep original format but still optimize
      break;
  }

  const result = await pipeline.toBuffer({ resolveWithObject: true });

  return {
    buffer: result.data,
    width: result.info.width,
    height: result.info.height,
    format: result.info.format,
    size: result.info.size,
  };
}

// Generate responsive variants
export async function generateVariants(input: Buffer) {
  const variants = [
    { name: 'thumbnail', width: 150, height: 150, fit: 'cover' as const },
    { name: 'small', width: 400 },
    { name: 'medium', width: 800 },
    { name: 'large', width: 1600 },
  ];

  const results = await Promise.all(
    variants.map(async (v) => {
      const pipeline = sharp(input).resize({
        width: v.width,
        height: v.height,
        fit: v.fit || 'inside',
        withoutEnlargement: true,
        position: v.fit === 'cover' ? 'attention' : undefined, // Smart crop
      });

      const buffer = await pipeline.webp({ quality: 80 }).toBuffer({ resolveWithObject: true });

      return {
        name: v.name,
        buffer: buffer.data,
        width: buffer.info.width,
        height: buffer.info.height,
        size: buffer.info.size,
      };
    })
  );

  return results;
}

// Extract metadata
export async function getImageMetadata(input: Buffer) {
  const metadata = await sharp(input).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size,
    hasAlpha: metadata.hasAlpha,
    orientation: metadata.orientation,
  };
}
```

### Generate BlurHash

```typescript
// lib/blurhash.ts
import sharp from 'sharp';
import { encode } from 'blurhash';

export async function generateBlurHash(input: Buffer): Promise<string> {
  // Resize to small dimensions for fast encoding
  const { data, info } = await sharp(input)
    .resize(32, 32, { fit: 'inside' })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return encode(
    new Uint8ClampedArray(data),
    info.width,
    info.height,
    4, // x components
    3, // y components
  );
}

// Alternative: LQIP (Low Quality Image Placeholder)
export async function generateLQIP(input: Buffer): Promise<string> {
  const tiny = await sharp(input)
    .resize(20) // 20px wide
    .blur(2)
    .jpeg({ quality: 30 })
    .toBuffer();

  return `data:image/jpeg;base64,${tiny.toString('base64')}`;
}
```

---

## 2. UPLOAD PATTERNS

### Pattern A: Server Proxy (Simple, < 5MB)

```typescript
// app/api/stores/[id]/media/route.ts
import { NextRequest } from 'next/server';
import { auth } from '@/auth';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { optimizeImage, getImageMetadata } from '@/lib/image-optimizer';
import { generateBlurHash } from '@/lib/blurhash';
import { prisma } from '@/lib/prisma';
import { randomUUID } from 'crypto';
import path from 'path';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif'];
const ALLOWED_DOC_TYPES = ['application/pdf', 'text/plain', 'text/csv'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: storeId } = await params;
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  const folderId = formData.get('folderId') as string | null;
  const altText = formData.get('alt') as string | null;

  if (!file) return Response.json({ error: 'No file provided' }, { status: 400 });
  if (file.size > MAX_FILE_SIZE) return Response.json({ error: 'File too large (50MB max)' }, { status: 400 });

  // Validate MIME type from file bytes (not just extension)
  const buffer = Buffer.from(await file.arrayBuffer());
  const { fileTypeFromBuffer } = await import('file-type');
  const detected = await fileTypeFromBuffer(buffer);
  const mimeType = detected?.mime || file.type;

  const isImage = ALLOWED_IMAGE_TYPES.includes(mimeType);
  const isVideo = ALLOWED_VIDEO_TYPES.includes(mimeType);
  const isDoc = ALLOWED_DOC_TYPES.includes(mimeType);

  if (!isImage && !isVideo && !isDoc) {
    return Response.json({ error: 'Unsupported file type' }, { status: 400 });
  }

  // Generate unique key
  const ext = isImage ? '.webp' : path.extname(file.name) || `.${detected?.ext}`;
  const key = `stores/${storeId}/${randomUUID()}${ext}`;

  let uploadBuffer = buffer;
  let width: number | undefined;
  let height: number | undefined;
  let blurHash: string | undefined;
  let contentType = mimeType;

  // Optimize images
  if (isImage && mimeType !== 'image/gif') {
    const optimized = await optimizeImage(buffer);
    uploadBuffer = optimized.buffer;
    width = optimized.width;
    height = optimized.height;
    contentType = 'image/webp';

    // Generate BlurHash for instant preview
    blurHash = await generateBlurHash(buffer);
  } else if (isImage) {
    // For GIFs, just extract metadata
    const meta = await getImageMetadata(buffer);
    width = meta.width;
    height = meta.height;
  }

  // Upload to R2/S3
  await r2Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: uploadBuffer,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    })
  );

  // Build public URL
  const url = `${process.env.R2_PUBLIC_URL}/${key}`;

  // Save to database
  const media = await prisma.mediaFile.create({
    data: {
      storeId,
      name: file.name,
      url,
      key,
      mimeType: contentType,
      size: uploadBuffer.length,
      width,
      height,
      blurHash,
      alt: altText,
      folderId,
      uploadedBy: session.user.id,
    },
  });

  return Response.json(media, { status: 201 });
}
```

### Pattern B: Presigned URL (Recommended for > 5MB)

```typescript
// app/api/stores/[id]/media/presign/route.ts
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client, BUCKET_NAME } from '@/lib/r2';
import { randomUUID } from 'crypto';
import { z } from 'zod';

const presignSchema = z.object({
  filename: z.string().min(1),
  contentType: z.string().min(1),
  size: z.number().max(500 * 1024 * 1024), // 500MB max
});

export async function POST(req: Request, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: storeId } = await params;
  const body = await req.json();
  const validation = presignSchema.safeParse(body);
  if (!validation.success) return Response.json({ error: 'Invalid request' }, { status: 400 });

  const { filename, contentType, size } = validation.data;
  const ext = filename.includes('.') ? filename.substring(filename.lastIndexOf('.')) : '';
  const key = `stores/${storeId}/${randomUUID()}${ext}`;

  // Generate presigned PUT URL (valid for 1 hour)
  const uploadUrl = await getSignedUrl(
    r2Client,
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable',
    }),
    { expiresIn: 3600 }
  );

  return Response.json({
    uploadUrl,
    key,
    publicUrl: `${process.env.R2_PUBLIC_URL}/${key}`,
  });
}

// app/api/stores/[id]/media/confirm/route.ts
// Called AFTER client uploads directly to R2
export async function POST(req: Request, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: storeId } = await params;
  const { key, filename, contentType, size, width, height, blurHash, alt } = await req.json();

  const url = `${process.env.R2_PUBLIC_URL}/${key}`;

  const media = await prisma.mediaFile.create({
    data: {
      storeId,
      name: filename,
      url,
      key,
      mimeType: contentType,
      size,
      width,
      height,
      blurHash,
      alt,
      uploadedBy: session.user.id,
    },
  });

  return Response.json(media, { status: 201 });
}
```

### Client-Side Presigned Upload with Progress

```typescript
// hooks/use-presigned-upload.ts
'use client';

import { useState, useCallback } from 'react';

interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export function usePresignedUpload(storeId: string) {
  const [progress, setProgress] = useState<UploadProgress | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(async (file: File) => {
    setIsUploading(true);
    setProgress({ loaded: 0, total: file.size, percentage: 0 });

    try {
      // 1. Get presigned URL
      const presignRes = await fetch(`/api/stores/${storeId}/media/presign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!presignRes.ok) throw new Error('Failed to get upload URL');
      const { uploadUrl, key, publicUrl } = await presignRes.json();

      // 2. Upload directly to R2 with XHR (for progress)
      await new Promise<void>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            setProgress({
              loaded: e.loaded,
              total: e.total,
              percentage: Math.round((e.loaded / e.total) * 100),
            });
          }
        });
        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve();
          else reject(new Error(`Upload failed: ${xhr.status}`));
        });
        xhr.addEventListener('error', () => reject(new Error('Upload failed')));
        xhr.open('PUT', uploadUrl);
        xhr.setRequestHeader('Content-Type', file.type);
        xhr.send(file);
      });

      // 3. Confirm upload
      const confirmRes = await fetch(`/api/stores/${storeId}/media/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key,
          filename: file.name,
          contentType: file.type,
          size: file.size,
        }),
      });

      if (!confirmRes.ok) throw new Error('Failed to confirm upload');
      return await confirmRes.json();
    } finally {
      setIsUploading(false);
      setProgress(null);
    }
  }, [storeId]);

  return { upload, progress, isUploading };
}
```

---

## 3. R2 / S3 CLIENT SETUP

```typescript
// lib/r2.ts
import { S3Client } from '@aws-sdk/client-s3';

export const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT!, // https://<account>.r2.cloudflarestorage.com
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export const BUCKET_NAME = process.env.R2_BUCKET_NAME!;

// For AWS S3 instead:
// export const s3Client = new S3Client({
//   region: process.env.AWS_REGION!,
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });
```

```env
# .env
R2_ENDPOINT=https://xxxxx.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=media
R2_PUBLIC_URL=https://media.yourdomain.com
```

---

## 4. RESPONSIVE IMAGE COMPONENT

```tsx
// components/ResponsiveImage.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

interface ResponsiveImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  blurHash?: string;
  lqip?: string;
  sizes?: string;
  className?: string;
  priority?: boolean;
}

export function ResponsiveImage({
  src,
  alt,
  width,
  height,
  blurHash,
  lqip,
  sizes = '100vw',
  className,
  priority = false,
}: ResponsiveImageProps) {
  const [loaded, setLoaded] = useState(false);

  // Generate srcset from base URL (if using Cloudflare Image Transformations)
  const generateSrcSet = (baseUrl: string) => {
    const widths = [400, 800, 1200, 1600, 2000];
    return widths
      .map((w) => `${baseUrl}?w=${w}&f=webp ${w}w`)
      .join(', ');
  };

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={width && height ? { aspectRatio: `${width}/${height}` } : undefined}
    >
      {/* Placeholder */}
      {lqip && !loaded && (
        <img
          src={lqip}
          alt=""
          className="absolute inset-0 h-full w-full object-cover blur-lg scale-110"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        onLoad={() => setLoaded(true)}
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        sizes={sizes}
      />
    </div>
  );
}
```

---

## 5. DATABASE SCHEMA FOR MEDIA

```prisma
model MediaFile {
  id          String    @id @default(cuid())
  storeId     String
  store       Store     @relation(fields: [storeId], references: [id], onDelete: Cascade)

  // File info
  name        String                    // Original filename
  url         String                    // Public CDN URL
  key         String                    // R2/S3 object key
  mimeType    String                    // Detected MIME type
  size        Int                       // File size in bytes

  // Image metadata
  width       Int?                      // Image/video width
  height      Int?                      // Image/video height
  blurHash    String?                   // BlurHash string (~20 chars)
  alt         String?                   // Alt text for accessibility
  duration    Float?                    // Video/audio duration in seconds

  // Organization
  folderId    String?
  folder      MediaFolder? @relation(fields: [folderId], references: [id])
  tags        MediaFileTag[]

  // Tracking
  uploadedBy  String?
  usageCount  Int       @default(0)     // How many content items reference this
  metadata    Json?                     // EXIF data, custom fields

  // Timestamps
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  deletedAt   DateTime?

  // Variants
  variants    MediaVariant[]

  @@index([storeId, folderId])
  @@index([storeId, mimeType])
  @@index([storeId, createdAt])
}

model MediaVariant {
  id       String    @id @default(cuid())
  fileId   String
  file     MediaFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  name     String    // "thumbnail", "small", "medium", "large"
  url      String
  key      String
  width    Int
  height   Int
  format   String    // "webp", "avif"
  size     Int

  @@unique([fileId, name])
}

model MediaFolder {
  id        String        @id @default(cuid())
  storeId   String
  store     Store         @relation(fields: [storeId], references: [id], onDelete: Cascade)
  name      String
  parentId  String?
  parent    MediaFolder?  @relation("FolderTree", fields: [parentId], references: [id])
  children  MediaFolder[] @relation("FolderTree")
  files     MediaFile[]
  color     String?
  icon      String?
  createdAt DateTime      @default(now())

  @@unique([storeId, name, parentId])
  @@index([storeId, parentId])
}

model MediaTag {
  id      String         @id @default(cuid())
  storeId String
  name    String
  files   MediaFileTag[]

  @@unique([storeId, name])
}

model MediaFileTag {
  fileId String
  tagId  String
  file   MediaFile @relation(fields: [fileId], references: [id], onDelete: Cascade)
  tag    MediaTag  @relation(fields: [tagId], references: [id], onDelete: Cascade)

  @@id([fileId, tagId])
}
```

---

## 6. CDN & CACHING

```typescript
// For R2 with custom domain: zero config needed
// Cloudflare automatically caches at edge when using custom domain

// Set proper headers on upload:
const uploadParams = {
  Bucket: BUCKET_NAME,
  Key: key,
  Body: buffer,
  ContentType: mimeType,
  CacheControl: 'public, max-age=31536000, immutable',
  // UUID-based keys never change, so cache forever
};

// For image transformations via Cloudflare:
// Original: https://media.site.com/stores/abc/uuid.webp
// Resized:  https://media.site.com/cdn-cgi/image/w=400,q=80/stores/abc/uuid.webp
```

---

## 7. DELETE WITH CLEANUP

```typescript
// app/api/stores/[id]/media/[mediaId]/route.ts
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export async function DELETE(req: Request, { params }) {
  const { id: storeId, mediaId } = await params;

  const media = await prisma.mediaFile.findFirst({
    where: { id: mediaId, storeId },
    include: { variants: true },
  });

  if (!media) return Response.json({ error: 'Not found' }, { status: 404 });

  // Check if file is in use
  if (media.usageCount > 0) {
    return Response.json(
      { error: 'File is in use. Remove from content before deleting.' },
      { status: 409 }
    );
  }

  // Delete from R2: original + all variants
  const keysToDelete = [media.key, ...media.variants.map((v) => v.key)];
  await Promise.all(
    keysToDelete.map((key) =>
      r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET_NAME, Key: key }))
    )
  );

  // Delete from database
  await prisma.mediaFile.delete({ where: { id: mediaId } });

  return Response.json({ success: true });
}
```

---

## 8. MISTAKES TO AVOID

```
NEVER DO:
  ✗ Trust client-reported MIME type (validate from file bytes with file-type)
  ✗ Process files synchronously in API routes (use streaming/workers for large files)
  ✗ Skip image dimension extraction (causes layout shift/CLS)
  ✗ Store files without UUID keys (collisions, cache problems)
  ✗ Forget Cache-Control headers on uploaded assets
  ✗ Proxy large files through serverless functions (use presigned URLs)
  ✗ Skip alt text field in media model (accessibility requirement)
  ✗ Delete files from storage without checking usage
  ✗ Process GIFs with Sharp resize (loses animation — use gifsicle)
  ✗ Forget sharp.concurrency(2) in serverless (memory issues)
  ✗ Store presigned URLs in database (they expire)
  ✗ Use fetch for uploads (no upload progress — use XHR)
  ✗ Skip BlurHash/LQIP (causes visible pop-in on image load)
```

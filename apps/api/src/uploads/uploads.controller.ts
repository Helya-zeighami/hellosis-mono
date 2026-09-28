import {
  BadRequestException,
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import { successResponse } from '../common/utils/api-response.util.js';

const ALLOWED_TYPES = new Map([
  ['image/jpeg', '.jpg'],
  ['image/png', '.png'],
  ['image/webp', '.webp'],
]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

@Controller('uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: MAX_IMAGE_BYTES, files: 1 },
    }),
  )
  async uploadImage(
    @UploadedFile() file: { buffer: Buffer; mimetype: string; originalname: string } | undefined,
    @Req() req: { protocol: string; get(name: string): string | undefined },
  ) {
    if (!file || !ALLOWED_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Upload a JPG, PNG, or WebP image smaller than 5 MB');
    }

    // Never retain a user-supplied filename: it could contain unsafe characters or extensions.
    const extension = ALLOWED_TYPES.get(file.mimetype) ?? extname(file.originalname);
    const filename = `${randomUUID()}${extension}`;
    const uploadDirectory = join(process.cwd(), 'uploads');
    await mkdir(uploadDirectory, { recursive: true });
    await writeFile(join(uploadDirectory, filename), file.buffer);

    const host = req.get('host');
    const origin = host ? `${req.protocol}://${host}` : process.env.PUBLIC_API_URL ?? 'http://localhost:3001';
    return successResponse('Image uploaded successfully', { url: `${origin}/uploads/${filename}` });
  }
}

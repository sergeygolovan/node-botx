import { AsyncBufferReadable, getFileSize } from "./asyncBuffer";
import { STICKER_IMAGE_MAX_SIZE } from "./constants";

const PNG_MAGIC_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
]);

export async function ensureFileContentIsPng(
  asyncBuffer: AsyncBufferReadable
): Promise<void> {
  const magicBytes = await asyncBuffer.read(8);

  await asyncBuffer.seek(0);

  const isPng =
    magicBytes.length === PNG_MAGIC_BYTES.length &&
    magicBytes.every((byte, index) => byte === PNG_MAGIC_BYTES[index]);

  if (!isPng) {
    throw new Error("Passed file is not PNG");
  }
}

export async function ensureStickerImageSizeValid(
  asyncBuffer: AsyncBufferReadable
): Promise<void> {
  const fileSize = await getFileSize(asyncBuffer);

  if (fileSize > STICKER_IMAGE_MAX_SIZE) {
    const maxFileSizeMb = STICKER_IMAGE_MAX_SIZE / 1024 / 1024;
    throw new Error(
      `Passed file size is greater than ${maxFileSizeMb.toFixed(1)} Mb`
    );
  }
}

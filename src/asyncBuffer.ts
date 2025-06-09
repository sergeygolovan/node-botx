export enum SeekWhence {
  SET = 0,
  CUR = 1,
  END = 2,
}

export interface AsyncBufferBase {
  seek(cursor: number, whence?: SeekWhence): Promise<number>;
  tell(): Promise<number>;
}

export abstract class AsyncBufferWritable implements AsyncBufferBase {
  abstract seek(cursor: number, whence?: SeekWhence): Promise<number>;
  abstract tell(): Promise<number>;
  abstract write(content: Uint8Array): Promise<number>;
}

export abstract class AsyncBufferReadable implements AsyncBufferBase {
  abstract seek(cursor: number, whence?: SeekWhence): Promise<number>;
  abstract tell(): Promise<number>;
  abstract read(bytesToRead?: number): Promise<Uint8Array>;
}

export async function getFileSize(
  asyncBuffer: AsyncBufferReadable
): Promise<number> {
  await asyncBuffer.seek(0, SeekWhence.END);
  const fileSize = await asyncBuffer.tell();
  await asyncBuffer.seek(0, SeekWhence.SET);
  return fileSize;
}

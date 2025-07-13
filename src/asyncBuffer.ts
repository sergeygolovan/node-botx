import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

/**
 * Seek whence constants (equivalent to os.SEEK_* in Python)
 */
export enum SeekWhence {
  SET = 0,  // os.SEEK_SET
  CUR = 1,  // os.SEEK_CUR
  END = 2,  // os.SEEK_END
}

/**
 * Base interface for async buffer operations.
 * Equivalent to Python's AsyncBufferBase Protocol.
 */
export interface AsyncBufferBase {
  seek(cursor: number, whence?: SeekWhence): Promise<number>;
  tell(): Promise<number>;
}

/**
 * Abstract class for writable async buffers.
 * Equivalent to Python's AsyncBufferWritable.
 */
export abstract class AsyncBufferWritable implements AsyncBufferBase {
  abstract seek(cursor: number, whence?: SeekWhence): Promise<number>;
  abstract tell(): Promise<number>;
  abstract write(content: Uint8Array): Promise<number>;
}

/**
 * Abstract class for readable async buffers.
 * Equivalent to Python's AsyncBufferReadable.
 */
export abstract class AsyncBufferReadable implements AsyncBufferBase {
  abstract seek(cursor: number, whence?: SeekWhence): Promise<number>;
  abstract tell(): Promise<number>;
  abstract read(bytesToRead?: number): Promise<Uint8Array>;
}

// Константа для размера чанка (как в Python оригинале)
export const CHUNK_SIZE = 1024 * 1024; // 1MB

/**
 * Memory-based async buffer implementation.
 * Use for:
 * - Small files (< 1MB)
 * - File downloads (like downloadFile.ts)
 * - Testing and debugging
 * - Temporary in-memory operations
 * 
 * Equivalent to Python's in-memory buffer operations.
 */
export class MemoryAsyncBuffer implements AsyncBufferReadable, AsyncBufferWritable {
  private buffer: Uint8Array = new Uint8Array(0);
  private position: number = 0;

  constructor() {}

  async seek(cursor: number, whence: SeekWhence = SeekWhence.SET): Promise<number> {
    let newPosition: number;

    switch (whence) {
      case SeekWhence.SET:
        newPosition = cursor;
        break;
      case SeekWhence.CUR:
        newPosition = this.position + cursor;
        break;
      case SeekWhence.END:
        newPosition = this.buffer.length + cursor;
        break;
      default:
        throw new Error(`Invalid seek whence: ${whence}`);
    }

    if (newPosition < 0) {
      throw new Error("Cannot seek to negative position");
    }

    this.position = newPosition;
    return this.position;
  }

  async tell(): Promise<number> {
    return this.position;
  }

  async write(content: Uint8Array): Promise<number> {
    // Расширяем буфер если нужно
    const newSize = Math.max(this.buffer.length, this.position + content.length);
    if (newSize > this.buffer.length) {
      const newBuffer = new Uint8Array(newSize);
      newBuffer.set(this.buffer);
      this.buffer = newBuffer;
    }

    // Записываем данные в текущую позицию
    this.buffer.set(content, this.position);
    this.position += content.length;
    return content.length;
  }

  async read(bytesToRead?: number): Promise<Uint8Array> {
    if (bytesToRead === undefined) {
      // Читаем все данные с текущей позиции
      const result = this.buffer.slice(this.position);
      this.position = this.buffer.length;
      return result;
    }

    // Читаем указанное количество байт с текущей позиции
    const endPosition = Math.min(this.position + bytesToRead, this.buffer.length);
    const result = this.buffer.slice(this.position, endPosition);
    this.position = endPosition;
    
    return result;
  }

  // Метод для получения всех данных
  async readAll(): Promise<Uint8Array> {
    return this.buffer.slice();
  }

  // Метод для записи всех данных сразу
  async writeAll(data: Uint8Array): Promise<void> {
    this.buffer = data.slice();
    this.position = data.length;
  }

  // Метод для получения размера буфера
  getSize(): number {
    return this.buffer.length;
  }
}

/**
 * Spooled async buffer implementation with file fallback.
 * Use for:
 * - Large files (> 1MB)
 * - File uploads (like uploadFile.ts)
 * - Memory optimization (like Python's SpooledTemporaryFile)
 * - Streaming file operations
 * 
 * Equivalent to Python's SpooledTemporaryFile from aiofiles.tempfile.
 */
export class SpooledAsyncBuffer implements AsyncBufferReadable, AsyncBufferWritable {
  private memoryBuffer: Uint8Array = new Uint8Array(0);
  private position: number = 0;
  private tempFilePath?: string;
  private fileHandle?: fs.FileHandle;
  private maxSize: number;

  constructor(maxSize: number = CHUNK_SIZE) {
    this.maxSize = maxSize;
  }

  async seek(cursor: number, whence: SeekWhence = SeekWhence.SET): Promise<number> {
    let newPosition: number;

    switch (whence) {
      case SeekWhence.SET:
        newPosition = cursor;
        break;
      case SeekWhence.CUR:
        newPosition = this.position + cursor;
        break;
      case SeekWhence.END:
        if (this.tempFilePath) {
          // Если используем файл, получаем его размер
          const stats = await fs.stat(this.tempFilePath);
          newPosition = stats.size + cursor;
        } else {
          newPosition = this.memoryBuffer.length + cursor;
        }
        break;
      default:
        throw new Error(`Invalid seek whence: ${whence}`);
    }

    if (newPosition < 0) {
      throw new Error("Cannot seek to negative position");
    }

    this.position = newPosition;
    return this.position;
  }

  async tell(): Promise<number> {
    return this.position;
  }

  async write(content: Uint8Array): Promise<number> {
    if (this.tempFilePath) {
      // Если уже используем файл, записываем в него
      if (!this.fileHandle) {
        this.fileHandle = await fs.open(this.tempFilePath, 'r+');
      }
      await this.fileHandle.write(content, 0, content.length, this.position);
      this.position += content.length;
      return content.length;
    } else {
      // Проверяем, не превысили ли лимит памяти
      const newSize = Math.max(this.memoryBuffer.length, this.position + content.length);
      if (newSize > this.maxSize) {
        // Переключаемся на файл
        await this.switchToFile();
        return await this.write(content);
      } else {
        // Расширяем буфер в памяти если нужно
        if (newSize > this.memoryBuffer.length) {
          const newBuffer = new Uint8Array(newSize);
          newBuffer.set(this.memoryBuffer);
          this.memoryBuffer = newBuffer;
        }
        
        // Записываем данные в текущую позицию
        this.memoryBuffer.set(content, this.position);
        this.position += content.length;
        return content.length;
      }
    }
  }

  async read(bytesToRead?: number): Promise<Uint8Array> {
    if (this.tempFilePath) {
      // Читаем из файла
      if (!this.fileHandle) {
        this.fileHandle = await fs.open(this.tempFilePath, 'r');
      }
      
      if (bytesToRead === undefined) {
        // Читаем все данные с текущей позиции
        const stats = await fs.stat(this.tempFilePath);
        const remainingBytes = stats.size - this.position;
        const buffer = Buffer.alloc(remainingBytes);
        await this.fileHandle.read(buffer, 0, remainingBytes, this.position);
        this.position = stats.size;
        return new Uint8Array(buffer);
      } else {
        // Читаем указанное количество байт
        const buffer = Buffer.alloc(bytesToRead);
        const { bytesRead } = await this.fileHandle.read(buffer, 0, bytesToRead, this.position);
        this.position += bytesRead;
        return Uint8Array.prototype.slice.call(buffer, 0, bytesRead);
      }
    } else {
      // Читаем из памяти
      if (bytesToRead === undefined) {
        const result = this.memoryBuffer.slice(this.position);
        this.position = this.memoryBuffer.length;
        return result;
      } else {
        const endPosition = Math.min(this.position + bytesToRead, this.memoryBuffer.length);
        const result = this.memoryBuffer.slice(this.position, endPosition);
        this.position = endPosition;
        return result;
      }
    }
  }

  private async switchToFile(): Promise<void> {
    this.tempFilePath = join(tmpdir(), `node-botx-spooled-${uuidv4()}`);
    
    // Записываем данные из памяти в файл
    await fs.writeFile(this.tempFilePath, this.memoryBuffer);
    
    // Очищаем память
    this.memoryBuffer = new Uint8Array(0);
  }

  async close(): Promise<void> {
    if (this.fileHandle) {
      await this.fileHandle.close();
      this.fileHandle = undefined;
    }
    
    if (this.tempFilePath) {
      try {
        await fs.unlink(this.tempFilePath);
      } catch (error) {
        // Игнорируем ошибки при удалении
      }
      this.tempFilePath = undefined;
    }
  }

  // Метод для получения размера
  async getSize(): Promise<number> {
    if (this.tempFilePath) {
      const stats = await fs.stat(this.tempFilePath);
      return stats.size;
    } else {
      return this.memoryBuffer.length;
    }
  }

  // Метод для проверки, используется ли файл
  isUsingFile(): boolean {
    return this.tempFilePath !== undefined;
  }
}

// Фабричная функция для создания временного буфера
export async function createAsyncBuffer(): Promise<MemoryAsyncBuffer> {
  return new MemoryAsyncBuffer();
}

// Фабричная функция для создания спулингового буфера
export async function createSpooledAsyncBuffer(maxSize: number = CHUNK_SIZE): Promise<SpooledAsyncBuffer> {
  return new SpooledAsyncBuffer(maxSize);
}

/**
 * Get file size from async buffer.
 * Equivalent to Python's get_file_size function.
 */
export async function getFileSize(
  asyncBuffer: AsyncBufferReadable
): Promise<number> {
  await asyncBuffer.seek(0, SeekWhence.END);
  const fileSize = await asyncBuffer.tell();
  await asyncBuffer.seek(0);
  return fileSize;
}

// Функция для создания временного файла (аналог NamedTemporaryFile)
export async function createNamedTemporaryFile(): Promise<{
  path: string;
  buffer: MemoryAsyncBuffer;
  cleanup: () => Promise<void>;
}> {
  const tempPath = join(tmpdir(), `node-botx-${uuidv4()}`);
  const buffer = new MemoryAsyncBuffer();

  const cleanup = async () => {
    try {
      await fs.unlink(tempPath);
    } catch (error) {
      // Игнорируем ошибки при удалении
    }
  };

  return {
    path: tempPath,
    buffer,
    cleanup
  };
}

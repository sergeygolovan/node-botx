declare module "file-scratch-pad" {
  import { Readable, Writable } from "stream";

  export interface ScratchPadOptions {
    maxSize?: number; // максимальный размер буфера (байты)
    encoding?: BufferEncoding;
  }

  /**
   * ScratchPad - временный буфер для записи и чтения файла.
   */
  class ScratchPad extends Writable {
    /**
     * Создаёт новый ScratchPad с опциями.
     * @param options опции, включая maxSize
     */
    static create(options?: ScratchPadOptions): Promise<ScratchPad>;

    /**
     * Возвращает Readable поток для чтения содержимого.
     */
    stream(): Readable;

    /**
     * Закрывает ScratchPad и освобождает ресурсы.
     */
    close(): Promise<void>;
  }

  export default ScratchPad;
}

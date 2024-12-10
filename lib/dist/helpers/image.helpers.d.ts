import { FileAdapter } from '../infrastructure/file.adapter';
export declare function convertToImage(signature: string | undefined, path: string, fileAdapter: FileAdapter): Promise<string | undefined>;
export declare function downloadImageFromURL(url: string): Promise<string>;

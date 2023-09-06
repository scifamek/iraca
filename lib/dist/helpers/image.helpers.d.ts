import { Observable } from 'rxjs';
import { FileAdapter } from '../infrastructure/file.adapter';
export declare function convertToImage(signature: string | undefined, path: string, fileAdapter: FileAdapter): Observable<string | undefined>;
export declare function downloadImageFromURL(url: string): Observable<string>;

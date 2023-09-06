import { Storage } from 'firebase-admin/storage';
import { Observable } from 'rxjs';
import { FileAdapter } from '../file.adapter';
export declare class FileRepository extends FileAdapter {
    private storage;
    constructor(storage: Storage);
    createLocalFile(data: string, location: string): string;
    deleteFile(filePath: string): Observable<any>;
    deleteLocalFile(location: string): void;
    getAbsoluteHTTPUrl(filePath: string): Observable<string>;
    getRelativeUrl(filePath: string): string;
    uploadFile(filePath: string, fileData: string): Observable<any>;
}

import { Observable } from 'rxjs';
export declare abstract class FileAdapter {
    abstract uploadFile(filePath: string, file: string): Observable<any>;
    abstract deleteFile(filePath: string): Observable<any>;
    abstract getAbsoluteHTTPUrl(filePath: string): Observable<string>;
    abstract getRelativeUrl(filePath: string): string;
}

export abstract class FileAdapter {
	abstract uploadFile(filePath: string, file: string): Promise<any>;
	abstract deleteFile(filePath: string): Promise<any>;
	abstract getAbsoluteHTTPUrl(filePath: string): Promise<string>;
	abstract getRelativeUrl(filePath: string): string;
}

import { Storage } from 'firebase-admin/storage';

import { existsSync, rmSync, writeFileSync, unlinkSync } from 'fs';
import { from, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
const mime = require('mime-types');
import { tmpdir } from 'os';
import { join } from 'path';
import { FileAdapter } from '../file.adapter';

export class FileRepository extends FileAdapter {
  constructor(private storage: Storage) {
    super();
  }

  createLocalFile(data: string, location: string) {
    const tmp = tmpdir();

    const filepath = join(tmp, location).replace(/\\/g, '/');
    writeFileSync(filepath, data, {
      encoding: 'base64',
    });
    return filepath;
  }

  deleteFile(filePath: string): Observable<any> {
    const restaured = filePath.split('/o/')[1].split('?')[0].replace(/%2F/g, '/');

    return from(this.storage.bucket().file(restaured).delete()).pipe(
      catchError(() => {
        return of(false);
      })
    );
  }

  deleteLocalFile(location: string) {
    try {
      unlinkSync(location);
    } catch (error) {}
    if (existsSync(location)) {
      rmSync(location, {
        force: true,
        recursive: true,
      });
    }
  }

  getAbsoluteHTTPUrl(filePath: string): Observable<string> {
    return filePath
      ? from(this.storage.bucket().file(filePath).getMetadata()).pipe(
          catchError(() => {
            return of(null);
          }),

          map((results: any | null) => {
            if (results) {
              const metadata = results[0];

              return metadata.mediaLink.replace(
                'https://storage.googleapis.com/download/storage/v1',
                'https://firebasestorage.googleapis.com/v0'
              );
            }
          })
        )
      : of('');
  }
  getRelativeUrl(filePath: string): string {
    const fragments = filePath.split('com/o/');
    if (fragments.length > 1) {
      const temp = filePath.split('com/o/')[1];

      const newFragments = temp.split('?generation')[0];
      return newFragments.replace(/%2F/g, '/');
    }
    return filePath;
  }

  uploadFile(filePath: string, fileData: string): Observable<any> {
    let data = fileData.split(';base64,').pop();
    const fragments = filePath.split('/');
    const name = fragments.pop();
    const tmp = this.createLocalFile(data as string, name as string);
    const fileMime = mime.lookup(filePath);
    return from(
      this.storage.bucket().upload(tmp as string, {
        destination: filePath,
        contentType: fileMime,
      })
    ).pipe(
      tap(() => {
        if (name) {
          this.deleteLocalFile(tmp);
        }
      })
    );
  }
}

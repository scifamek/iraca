import { Observable, from, of } from 'rxjs';
import { FileAdapter } from '../infrastructure/file.adapter';
import { map } from 'rxjs/operators';
import { Transform } from 'stream';
const http = require('http');
const https = require('https');

export function convertToImage(signature: string | undefined, path: string, fileAdapter: FileAdapter) {
  function getPartialUrlFromAbsolute(absoluteUrl: string) {
    const pattern = /([\w\-\.]+%2F)+[\w\-\.]+/;
    const patternObj = new RegExp(pattern);
    const result = patternObj.exec(absoluteUrl);
    if (result) {
      const brutUrl = result[0].replace(/%2F/g, '/');
      return brutUrl;
    }
    return undefined;
  }
  if (!!signature) {
    if (signature.startsWith('data:image')) {
      return fileAdapter.uploadFile(path, signature).pipe(map(() => path));
    } else {
      return of(getPartialUrlFromAbsolute(signature));
    }
  }
  return of(signature);
}

export function downloadImageFromURL(url: string): Observable<string> {
  var client = http;
  if (url.startsWith('https')) {
    client = https;
  }

  return from(
    new Promise<string>((resolve) => {
      client
        .request(url, function (response: any) {
          var data = new Transform();
          response.on('data', function (chunk: any) {
            data.push(chunk);
          });
          response.on('end', function () {
            const buffer = data.read();
            resolve('data:image/jpeg;base64,' + buffer.toString('base64'));
          });
        })
        .end();
    })
  );
}

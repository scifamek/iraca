import { DocumentData, DocumentSnapshot } from '@google-cloud/firestore';
export declare function unifyData(data: DocumentSnapshot<DocumentData>): DocumentData | undefined;

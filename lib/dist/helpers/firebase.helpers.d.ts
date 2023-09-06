import { DocumentData, DocumentSnapshot, QuerySnapshot } from '@google-cloud/firestore';
export declare function mapFromSnapshot(response: Promise<QuerySnapshot<DocumentData>>, mapper?: (x: any) => any): import("rxjs").Observable<any[]>;
export declare function unifyData(data: DocumentSnapshot<DocumentData>): DocumentData | undefined;

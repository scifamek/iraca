import { DocumentData, DocumentSnapshot, QueryDocumentSnapshot, QuerySnapshot } from '@google-cloud/firestore';
import { from } from 'rxjs';
import { map } from 'rxjs/operators';

export function mapFromSnapshot(response: Promise<QuerySnapshot<DocumentData>>, mapper = (x: any) => x) {
  return from(response).pipe(
    map((snapshot: QuerySnapshot<DocumentData>) => {
      return snapshot.docs;
    }),
    map((snapshot: QueryDocumentSnapshot<DocumentData>[]) => {
      return snapshot.map((x) => {
        return { ...x.data(), id: x.id };
      });
    }),
    map((data) => {
      return data.map((y) => mapper(y));
    })
  );
}
export function unifyData(data: DocumentSnapshot<DocumentData>): DocumentData | undefined {
  const response = data.data();
  if (!response) {
    return undefined;
  }
  return {
    ...data.data(),
    id: data.id,
  };
}

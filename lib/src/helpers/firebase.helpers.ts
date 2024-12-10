import {
  DocumentData,
  DocumentSnapshot
} from '@google-cloud/firestore';

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

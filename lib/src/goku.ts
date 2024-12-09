import { parentPort, workerData } from 'worker_threads';

console.log('Llego algo ', workerData);

const {usecase, params} = workerData;
parentPort?.postMessage(params);
// usecase(params).subscribe((res: any) => {
// });

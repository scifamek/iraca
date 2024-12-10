

// export function permissiveEqualOperator<T>(key: string, value: string): (source: Promise<T>) => Promise<T> {
//   return (source: Promise<T>) => {
//     return new Promise((suscriber) => {
//       source.subscribe({
//         next: (items: T) => {
//           suscriber.next(
//             (items as unknown as Array<any>).filter((item) => {
//               return (item[key] as string)?.toUpperCase() === value.toUpperCase();
//             }) as unknown as T
//           );
//         },
//         error: () => suscriber.error(),
//         complete: () => suscriber.complete(),
//       });
//     });
//   };
// }

// export function containsOperator<T>(key: string, value: string): (source: Promise<T>) => Promise<T> {
//   return (source: Promise<T>) => {
//     return new Promise((suscriber) => {
//       source.subscribe({
//         next: (items: T) => {
//           suscriber.next(
//             (items as unknown as Array<any>).filter((item) => {
//               return (item[key] as string).toUpperCase().includes(value.toUpperCase());
//             }) as unknown as T
//           );
//         },
//         error: () => {
//           return suscriber.error();
//         },
//         complete: () => suscriber.complete(),
//       });
//     });
//   };
// }

// export const OPERATORS_HANDLER_MAPPER: {
//   [index: string]: (key: string, value: string) => (source: Promise<any>) => Promise<any>;
// } = {
//   '=': permissiveEqualOperator,
//   contains: containsOperator,
// };




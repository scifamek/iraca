export function generateError(name: string, message: string) {
  const ErrorClass = class extends Error {
    static id = name;
    constructor(extraData?: any) {
      super();
      this.name = name;
      this.message = this.formatMessage(extraData || {}, message);
    }
    toString() {
      return `${this.name}: ${this.message}`;
    }

    formatMessage(extraData: any, message: string) {
      const pattern = /\{([\w]+)\}/;
      let find = pattern.exec(message);
      while (find) {
        const valueToReplace = extraData[find[1]] || '';
        message = message.replace(find[0], valueToReplace);
        find = pattern.exec(message);
      }
      return message;
    }
  };
  return ErrorClass;
}

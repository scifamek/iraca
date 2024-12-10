export abstract class Mapper<T> {
	attributesMapper: {
		[index: string]: {
			name: string;
			to?: Function;
			from?: (value: any) => Promise<any>;
			default?: any;
		};
	};

	constructor() {
		this.attributesMapper = {};
	}

	fromJson(obj: any): Promise<T | undefined> {
		const values = Object.values(this.attributesMapper);
		const keys = Object.keys(this.attributesMapper);
		const newKeys: Promise<{key: string; value: any}>[] = [];
		if (!obj) {
			return Promise.resolve(undefined);
		}
		for (let index = 0; index < values.length; index++) {
			const config = values[index];

			const value: string = config.name;
			const key: string = keys[index];

			let mappedValue: Promise<{key: string; value: any}> | undefined = undefined;
			if (config.from) {
				if (obj[value] !== undefined) {
					mappedValue = config.from(obj[value]).then((val) => {
						return {
							key,
							value: val,
						};
					});
				} else if (config.default != undefined) {
					mappedValue = Promise.resolve(config.default).then((val) => {
						return {
							key,
							value: val,
						};
					});
				} else {
					mappedValue = undefined;
				}
			} else {
				if (obj[value] !== undefined) {
					mappedValue = Promise.resolve({
						key,
						value: obj[value],
					});
				} else if (config.default !== undefined) {
					mappedValue = Promise.resolve({
						key,
						value: config.default,
					});
				} else {
					mappedValue = undefined;
				}
			}
			if (mappedValue) {
				newKeys.push(mappedValue);
			}
		}
		return Promise.all(newKeys).then((mappedAttributes) => {
			const result: any = {};
			for (const mappedAttribute of mappedAttributes) {
				result[mappedAttribute.key] = mappedAttribute.value;
			}
			return result as T;
		});
	}

	toJson(obj: T): any {
		const values = Object.values(this.attributesMapper);
		const keys = Object.keys(this.attributesMapper);
		const result: any = {} as T;
		for (let index = 0; index < values.length; index++) {
			const config = values[index];
			const value: string = values[index].name;
			const key: string = keys[index];

			let mappedValue = undefined;

			if ((obj as any)[key] === undefined) {
				if (config.default !== undefined) {
					mappedValue = config.default;
				}
			} else {
				mappedValue = (obj as any)[key];
				if (config.to) {
					mappedValue = config.to((obj as any)[key]);
				}
			}

			if (mappedValue !== undefined) {
				result[value] = mappedValue;
			}
		}
		return result as T;
	}
}

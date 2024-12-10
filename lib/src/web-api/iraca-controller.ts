import { Request, Response } from 'express';
import { Router } from 'express-serve-static-core';

import { DomainEvent, Usecase } from '@/config';
import { Container } from '../dependency-injection';
import { generateError } from '../helpers';
import { MessagesConfiguration } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';

export interface ExpressHandlerConfiguration {
	container: Container;
	usecaseId: string;
	response: Response;
	messageConfiguration: MessagesConfiguration;
	translatorId?: string;
	loggerId?: string;
	usecaseParam?: any;
}
export interface RegisterConfiguration {
	usecase: any;
	successCode?: string;
	method?: 'get' | 'post' | 'put' | 'delete' | 'patch';
	path?: string;
	paramsMapper?: (param: any) => any;
}
export interface ControllerConfiguration {
	loggerId?: string;
	logger?: any;
	container: Container;
	identifier: string;
	router: any;
	methodToInvoke?: string;
}

interface Controller {
	configureEndpoints: Function
}
export abstract class IracaController implements Controller  {
	loggerId = 'Logger';
	logger: any;
	container: Container;
	identifier: string;
	router: Router;
	methodToInvoke = 'call';
	public routesTable: Map<string, any>;
	constructor(protected configuration: ControllerConfiguration) {
		this.container = configuration.container;
		this.identifier = configuration.identifier;
		this.router = configuration.router;
		this.routesTable = new Map<string, any>();
		this.methodToInvoke = configuration.methodToInvoke ?? 'call';
		this.resolveLogger();
		this.configureEndpoints();
	}

	public abstract configureEndpoints(): void;
	protected configureEndpointsByPattern(pattern: string) {
		const identifiers = this.container.configsTable.keys();

		for (const identifier of identifiers) {
			const p = new RegExp(pattern, 'gi');
			const result = p.exec(identifier);
			if (result) {
				this.register({usecase: identifier});
			}
		}
	}

	private resolveLogger() {
		if (this.configuration.logger) {
			this.logger = this.configuration.logger;
		} else if (this.configuration.loggerId) {
			this.logger = this.container.getInstance<any>(this.loggerId).instance;
		}
	}

	public readyHandler(_request: Request, response: Response) {
		return response.status(200).json({});
	}

	private logParam(logInformation: string, param: any) {
		if (typeof param == 'object') {
			logInformation += `Param:\n${JSON.stringify(param, null, 2)}`;
		} else if (typeof param == 'undefined') {
			logInformation += `\n\tWitout Param`;
		} else {
			logInformation += `Param:\n\t\t${param}`;
		}
		return logInformation;
	}
	private logResponse(logInformation: string, response: any) {
		if (typeof response == 'object') {
			logInformation += `Usecase response:\n\t${JSON.stringify(response, null, 2)}`;
		} else if (typeof response == 'undefined') {
			logInformation += `\n\tWitout Response`;
		} else {
			logInformation += `Usecase response:\n\t\t${response}`;
		}
		return logInformation;
	}
	private logError(logInformation: string, error: Error) {
		logInformation += `Error: ${error?.name}, ${error?.message}`;
		return logInformation;
	}

	private logTitle(logInformation: string, title: string) {
		logInformation += `**  ${title}\n`;
		return logInformation;
	}

	private makeHttpPath(usercaseId: string) {
		const segment = usercaseId
			.replace(/Usecase/gi, '')
			.replace(/([a-z])([A-Z])/g, '$1-$2')
			.toLowerCase();
		return `/${segment}`;
	}
	// private getSuccessCode(usercaseId: string) {
	// 	const segment = usercaseId
	// 		.replace(/Usecase/gi, '')
	// 		.replace(/([a-z])([A-Z])/g, '$1-$2')
	// 		.toUpperCase();
	// 	return `${segment}:SUCCESS`;
	// }
	private extractParam(request: Request) {
		if (request.body && Object.keys(request.body).length) {
			return request.body;
		}

		if (request.query && Object.keys(request.query).length) {
			return request.query;
		}

		if (request.params && Object.keys(request.params).length) {
			return request.params;
		}

		return null;
	}

	private returnSuccessResponse(
		response: Response,
		logInformation: string,
		data: DomainEvent<any>
	) {
		this.logResponse(logInformation, data);

		let code = `${this.identifier}:${data.name}`;

		response.send({
			meta: {
				code,
			},
			data: data.payload,
		} as BaseHTTPResponse<any>);
	}

	private returnErrorResponse(response: Response, error: Error) {
		let code = `${this.identifier}:${error.name}`;

		response.status(500).send({
			meta: {
				code,
			},
		} as BaseHTTPResponse<any>);
	}

	public register<U extends Usecase<any, any>>(registerConfiguration: RegisterConfiguration) {
		const id =
			typeof registerConfiguration.usecase == 'string'
				? registerConfiguration.usecase
				: registerConfiguration.usecase.name;

		let usecaseHttpPath = registerConfiguration.path || this.makeHttpPath(id);

		usecaseHttpPath = usecaseHttpPath.startsWith('/') ? usecaseHttpPath : `/${usecaseHttpPath}`;

		const method = (registerConfiguration.method || 'get').toLowerCase();
		this.routesTable.set(usecaseHttpPath, method);

		const handler = (request: Request, response: Response) => {
			let logInformation = '';

			let alfa = process.hrtime.bigint();
			try {
				const usecase = this.container.getInstance<U>(id);
				logInformation = this.logTitle(logInformation, id);
				const param = this.extractParam(request);
				logInformation = this.logParam(logInformation, param);
				const paramsMapper = registerConfiguration.paramsMapper;

				let convertedParams = param;
				if (paramsMapper) {
					convertedParams = paramsMapper(param);
				}

				const methodToInvoke = (usecase as any)[this.methodToInvoke];
				if (methodToInvoke) {
					const dataRes = methodToInvoke.bind(usecase, convertedParams)();

					if (dataRes instanceof Promise) {
						dataRes
							.then((data) => {
								this.returnSuccessResponse(response, logInformation, data);
							})
							.catch((error) => {
								logInformation = this.logError(logInformation, error);
								this.returnErrorResponse(response, error);
							})
							.finally(() => {
								this.endTransaction<U>(alfa, logInformation);
							});
					} else if (!!dataRes.subscribe) {
						dataRes.subscribe({
							next: (data: any) => {
								this.returnSuccessResponse(response, logInformation, data);
							},
							error: (error: any) => {
								logInformation = this.logError(logInformation, error);
								this.returnErrorResponse(response, error);
							},
							complete: () => {
								this.endTransaction<U>(alfa, logInformation);
							},
						});
					} else {
						this.returnSuccessResponse(response, logInformation, dataRes);
						this.endTransaction<U>(alfa, logInformation);
					}
				} else {
					const sdf = generateError(
						'MethodToInvokeIsNotSupported',
						'The {method} does not exists in this ellement'
					);
					this.returnErrorResponse(response, new sdf({method: this.methodToInvoke}));
				}
			} catch (error: any) {
				this.returnErrorResponse(response, error);
			}
		};

		if (method == 'get') {
			this.router.get(usecaseHttpPath, handler);
		} else if (method == 'post') {
			this.router.post(usecaseHttpPath, handler);
		} else if (method == 'put') {
			this.router.put(usecaseHttpPath, handler);
		}

		// methodHandler.bind(this.app, usecaseHttpPath, handler);
		// methodHandler(usecaseHttpPath, handler );
	}

	private endTransaction<U extends Usecase<any, any>>(alfa: bigint, logInformation: string) {
		let beta = process.hrtime.bigint();
		const endDiff = beta - alfa;
		this.logger?.info(logInformation);
		const micro = endDiff / 1000n;
		const mili = micro / 1000n;
		const sec = mili / 1000n;
		this.logger?.info(`Process Time: ${endDiff}ns ${micro}us ${mili}ms ${sec}s `);
	}

	//private makeErrorMessage(
	// 	config: MessagesConfiguration | MessagesConfiguration,
	// 	error?: Error
	// ): BaseHTTPResponse<undefined> {
	// 	let httpMessageCode = '';
	// 	let message = '';

	// 	httpMessageCode = 'SERVER:ERROR';
	// 	message = DEFAULT_MESSAGES[httpMessageCode];
	// 	if (error && Object.keys(error).length > 0) {
	// 		const exception: Error = {...error};

	// 		const exceptionName = exception.name;

	// 		if (!(config as MessagesConfigurationWithExceptions).exceptions) {
	// 			const exceptionCode = this.makeErrorCode(exceptionName);

	// 			if (exceptionCode) {
	// 				httpMessageCode = exceptionCode;
	// 				message = exception.message;
	// 			} else {
	// 				httpMessageCode = 'SERVER:ERROR';
	// 				message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
	// 			}
	// 		} else {
	// 			const castedConfig = config as MessagesConfigurationWithExceptions;
	// 			httpMessageCode = castedConfig.exceptions[exceptionName];

	// 			if (httpMessageCode) {
	// 				if (castedConfig.errorCodes) {
	// 					message = castedConfig.errorCodes[httpMessageCode];
	// 					message = this.formatMessage(message, exception);
	// 				} else {
	// 					message = exception.message;
	// 				}
	// 			} else {
	// 				httpMessageCode = 'SERVER:ERROR';
	// 				message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
	// 			}
	// 		}
	// 	}
	// 	const p = /[A-Z]+:[A-Z\-]+:[A-Z]+/g;
	// 	let code = `${httpMessageCode}`;
	// 	if (!httpMessageCode.match(p)) {
	// 		code = `${config.identifier}:${httpMessageCode}`;
	// 	}
	// 	return {
	// 		meta: {
	// 			code,
	// 			message,
	// 		},
	// 	} as BaseHTTPResponse<undefined>;
	// }

	// private formatMessage(message: string, data: any) {
	// 	if (!data) {
	// 		return message;
	// 	}
	// 	const pattern = '{([A-Za-z]+)}';
	// 	const regex = new RegExp(pattern);
	// 	let temp = regex.exec(message);
	// 	while (temp && temp.length > 0) {
	// 		const key = temp[1];
	// 		message = message.replace(`{${key}}`, data[key] || '');

	// 		temp = regex.exec(message);
	// 	}

	// 	return message;
	// }
}

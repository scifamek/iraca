import { Request, Response } from 'express';
import { Express, Router } from 'express-serve-static-core';

import { Container } from '../dependency-injection/container';
import { Usecase } from '../domain/usecase';
import { DEFAULT_MESSAGES } from './code-responses';
import { MessagesConfiguration, MessagesConfigurationWithExceptions } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';
import moment = require('moment');

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
	usecaseId: string;
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
	app: any;
}

export abstract class ExpressController {
	loggerId = 'Logger';
	logger: any;
	container: Container;
	identifier: string;
	router: Router;
	app: Express;
	constructor(protected configuration: ControllerConfiguration) {
		this.container = configuration.container;
		this.identifier = configuration.identifier;
		this.app = configuration.app;
		this.router = configuration.router;

		this.resolveLogger();
	}

	public abstract configureEndpoints(): void;

	private resolveLogger() {
		if (this.configuration.logger) {
			this.logger = this.configuration.logger;
		} else if (this.configuration.loggerId) {
			this.logger = this.container.getInstance<any>(this.loggerId).instance;
		}
	}

	makeErrorCode(exceptionName: string): string {
		return exceptionName
			.replace(/([a-z])([A-Z])/g, '$1-$2')
			.replace(/-Error$/, ':ERROR')
			.toUpperCase();
	}
	makeErrorMessage(
		config: MessagesConfiguration | MessagesConfiguration,
		error?: Error
	): BaseHTTPResponse<undefined> {
		let httpMessageCode = '';
		let message = '';

		httpMessageCode = 'SERVER:ERROR';
		message = DEFAULT_MESSAGES[httpMessageCode];
		if (error && Object.keys(error).length > 0) {
			const exception: Error = {...error};

			const exceptionName = exception.name;

			if (!(config as MessagesConfigurationWithExceptions).exceptions) {
				const exceptionCode = this.makeErrorCode(exceptionName);

				if (exceptionCode) {
					httpMessageCode = exceptionCode;
					message = exception.message;
				} else {
					httpMessageCode = 'SERVER:ERROR';
					message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
				}
			} else {
				const castedConfig = config as MessagesConfigurationWithExceptions;
				httpMessageCode = castedConfig.exceptions[exceptionName];

				if (httpMessageCode) {
					if (castedConfig.errorCodes) {
						message = castedConfig.errorCodes[httpMessageCode];
						message = this.formatMessage(message, exception);
					} else {
						message = exception.message;
					}
				} else {
					httpMessageCode = 'SERVER:ERROR';
					message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
				}
			}
		}
		const p = /[A-Z]+:[A-Z\-]+:[A-Z]+/g;
		let code = `${httpMessageCode}`;
		if (!httpMessageCode.match(p)) {
			code = `${config.identifier}:${httpMessageCode}`;
		}
		return {
			meta: {
				code,
				message,
			},
		} as BaseHTTPResponse<undefined>;
	}

	makeErrorResponse(error: Error): BaseHTTPResponse<undefined> {
		let httpMessageCode = '';
		let message = '';

		const exception: Error = {...error};

		message = exception.message;
		const p = /[A-Z]+:[A-Z\-]+:[A-Z]+/g;
		let code = exception.name;
		if (!httpMessageCode.match(p)) {
			const e = this.makeErrorCode(exception.name);
			code = `${this.identifier.toUpperCase()}:${e}`;
		}
		return {
			meta: {
				code,
				message,
			},
		} as BaseHTTPResponse<undefined>;
	}
	public readyHandler(_request: Request, response: Response) {
		return response.status(200).json({});
	}

	private formatMessage(message: string, data: any) {
		if (!data) {
			return message;
		}
		const pattern = '{([A-Za-z]+)}';
		const regex = new RegExp(pattern);
		let temp = regex.exec(message);
		while (temp && temp.length > 0) {
			const key = temp[1];
			message = message.replace(`{${key}}`, data[key] || '');

			temp = regex.exec(message);
		}

		return message;
	}

	private logParam(logInformation: string, param: any) {
		if (typeof param == 'object') {
			logInformation += `Param:\n\t${JSON.stringify(param, null, 2)}`;
		} else if (typeof param == 'undefined') {
			logInformation += `\n\tWitout Param`;
		} else {
			logInformation += `Param:\n\t\t${param}`;
		}
		return logInformation;
	}
	private logResponse(logInformation: string, response: any) {
		if (typeof response == 'object') {
			logInformation += `Usecase response:\n\t\t${JSON.stringify(response, null, 2)}`;
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
	private getSuccessCode(usercaseId: string) {
		return usercaseId
			.replace(/Usecase/gi, '')
			.replace(/([a-z])([A-Z])/g, '$1-$2')
			.toUpperCase();
	}
	extractParam(request: Request) {
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

	public register<U extends Usecase<any, any>>(registerConfiguration: RegisterConfiguration) {
		type MethodHandler = (
			path: string,
			...handlers: Array<(request: Request, response: Response) => void>
		) => void;

		const usecaseHttpPath = this.makeHttpPath(registerConfiguration.usecaseId);

		const method = (registerConfiguration.method || 'get').toLowerCase();

		const methodHandler: MethodHandler = (this.app as any)[method];
		
		console.log({methodHandler, router: this.router, app: this.app, method, usecaseHttpPath});

		const handler = (request: Request, response: Response) => {
			const {path, method} = request;
			console.log(' * ', path, method);
			let logInformation = '';
			const prev = moment();

			const usecase = this.container.getInstance<U>(registerConfiguration.usecaseId).instance;
			this.logTitle(logInformation, registerConfiguration.usecaseId);
			const param = this.extractParam(request);
			this.logParam(logInformation, param);
			const paramsMapper = registerConfiguration.paramsMapper;
			if (!usecase) {
				const error = new Error('The usecase is not registered');
				error.name = 'UsecaseNotRegistered';
				const resp = this.makeErrorResponse(error);
				response.json(resp);
			} else {
				let convertedParams = null;
				if (paramsMapper) {
					convertedParams = paramsMapper(param);
				}
				const dataRes = usecase.call(convertedParams);

				dataRes.subscribe({
					next: (data: any) => {
						this.logResponse(logInformation, data);

						let code = '';
						let message = '';
						code = `${this.identifier}:${
							registerConfiguration.successCode ||
							this.getSuccessCode(registerConfiguration.usecaseId)
						}`;
						message = '';

						response.send({
							meta: {
								code,
								message,
							},
							data,
						} as BaseHTTPResponse<any>);
					},
					error: (error: any) => {
						this.logError(logInformation, error);
						const resp = this.makeErrorResponse(error);
						response.send(resp);
					},
					complete: () => {
						const final = moment();
						const rest = final.diff(prev, 'milliseconds');
						this.logger?.info(logInformation);
						this.logger?.info(`Process Time: ${rest}ms, ${rest / 1000}s`);
					},
				});
			}
		};

		this.app.get(usecaseHttpPath, handler);

		methodHandler.bind(this.app, usecaseHttpPath, handler);
		// methodHandler(usecaseHttpPath, handler );
	}
}

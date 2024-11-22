import { Response } from 'express';
import { Container } from '../dependency-injection/container';
import { Usecase } from '../domain/usecase';
import { DEFAULT_MESSAGES } from './code-responses';
import { MessagesConfiguration, MessagesConfigurationWithExceptions } from './messages-configuration';
import { BaseHTTPResponse } from './response.model';
import { Traslator } from './translator';
import moment = require('moment');

export interface HandlerConfiguration {
	container: Container;
	usecaseId: string;
	response: Response;
	messageConfiguration: MessagesConfiguration;
	translatorId?: string;
	loggerId?: string;
	usecaseParam?: any;
}

export abstract class HttpController {
	static loggerId = 'Logger';
	static logger: any;
	public static handler<U extends Usecase<any, any>>(config: HandlerConfiguration) {
		let func = null;
		const {translatorId, container, usecaseId, usecaseParam, response, messageConfiguration} =
			config;
		if (translatorId) {
			const translator = container.getInstance<Traslator<any>>(translatorId).instance;
			if (translator) {
				func = translator.fromJson;
			}
		}

		this.generalHandlerController<U>(
			container,
			usecaseId,
			usecaseParam,
			func,
			response,
			messageConfiguration
		);
	}

	static makeErrorCode(exceptionName: string): string {
		return exceptionName
			.replace(/([a-z])([A-Z])/g, '$1-$2')
			.replace(/Error$/, ':ERROR')
			.toUpperCase();
	}
	static makeErrorMessage(
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
				const exceptionCode = HttpController.makeErrorCode(exceptionName);

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
						message = HttpController.formatMessage(message, exception);
					} else {
						message = exception.message;
					}
				} else {
					httpMessageCode = 'SERVER:ERROR';
					message = DEFAULT_MESSAGES[httpMessageCode] + ' : ' + error.message;
				}
			}
		}
		const code = `${config.identifier}:${httpMessageCode}`;
		return {
			meta: {
				code,
				message,
			},
		} as BaseHTTPResponse<undefined>;
	}

	public static readyHandler(_request: Request, response: Response) {
		return response.status(200).json({});
	}

	private static formatMessage(message: string, data: any) {
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

	private static generalHandlerController<U extends {call: (param?: any) => any}>(
		container: Container,
		usecaseIdentifier: string,
		param: any,
		func: Function | null,
		response: Response,
		config: MessagesConfiguration
	) {
		let insideLogger: any;
		if (this.logger) {
			insideLogger = this.logger;
		} else if (this.loggerId) {
			insideLogger = container.getInstance<any>(this.loggerId).instance;
		}
		const usecase = container.getInstance<U>(usecaseIdentifier).instance;

		insideLogger?.group(usecaseIdentifier);

		if (typeof param == 'object') {
			insideLogger?.info(`Param:\n\t${JSON.stringify(param, null, 2)}`);
		} else if (typeof param == 'undefined') {
			insideLogger?.info(`\n\tWitout Param`);
		} else {
			insideLogger?.info(`Param:\n\t\t${param}`);
		}

		let dataRes = null;
		let params = param;
		const prev = moment();
		if (!usecase) {
			const resp = this.makeErrorMessage(config);
			response.send(resp);
		} else {
			if (func) {
				if (param) {
					params = func(param);
					dataRes = usecase.call(params);
				} else {
					dataRes = usecase.call();
				}
			} else {
				if (param) {
					dataRes = usecase.call(param);
				} else {
					dataRes = usecase.call();
				}
			}

			dataRes.subscribe({
				next: (data: any) => {
					if (typeof data == 'object') {
						insideLogger?.info(`Usecase response:\n\t\t${JSON.stringify(data, null, 2)}`);
					} else if (typeof data == 'undefined') {
						insideLogger?.info(`\n\tWitout Response`);
					} else {
						insideLogger?.info(`Usecase response:\n\t\t${param}`);
					}

					let code = '';
					let message = '';
					if (typeof config.successCode == 'string') {
						code = `${config.identifier}:${config.successCode}`;
						message = DEFAULT_MESSAGES[config.successCode];
					} else {
						code = `${config.identifier}:${config.successCode.code}`;
						message = config.successCode.message || '';
					}
					message = HttpController.formatMessage(message, config.extraData);

					response.send({
						meta: {
							code,
							message,
						},
						data,
					} as BaseHTTPResponse<any>);
				},
				error: (error: any) => {
					insideLogger?.error(`Error: ${error?.name}, ${error?.message}`);
					const resp = this.makeErrorMessage(config, error);
					response.send(resp);
				},
				complete: () => {
					const final = moment();
					const rest = final.diff(prev, 'milliseconds');
					insideLogger?.info(`Process Time: ${rest}ms, ${rest / 1000}s`);
					insideLogger?.closeGroup();
				},
			});
		}
	}
}

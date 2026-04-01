import { APIRequestContext } from "@playwright/test";
import { expect } from "@playwright/test";
import { APILogger } from "./logger";
import { test } from "@playwright/test";

export class RequestHandler {
  // --- КОРОБКИ ДЛЯ ДАННЫХ (Свойства) ---
  private request: APIRequestContext; // Машина Playwright для отправки запросов
  private logger: APILogger;
  private baseUrl: string | undefined; // Специфический адрес (если нужно переопределить)
  private defaultBaseUrl: string; // 
  private apiPath: string = ""; // Хвостик адреса (например, /articles)
  private queryParams: Record<string, any> = {}; // Параметры поиска (?limit=10)
  private apiHeaders: Record<string, string> = {}; // Заголовки (токены и т.д.)
  private apiBody: object = {}; // Тело запроса (данные статьи)
  private defaultAuthToken: string;
  private clearAuthFlag: boolean = false;

  // --- НАСТРОЙКИ ПРИ РОЖДЕНИИ ---
  constructor(
    request: APIRequestContext,
    apiBaseUrl: string,
    logger: APILogger,
    authToken: string = "",
  ) {
    this.request = request; // Получаем "машину" от Playwright
    this.defaultBaseUrl = apiBaseUrl; // Запоминаем главный адрес
    this.logger = logger;
    this.defaultAuthToken = authToken;
  }

  // --- МЕТОДЫ-КОНСТРУКТОРЫ (Настройка запроса) ---
  // Каждый из них сохраняет данные и возвращает 'this' (самого себя),
  // чтобы можно было ставить точки и писать цепочкой.
  url(url: string) {
    this.baseUrl = url;
    return this;
  }
  path(path: string) {
    this.apiPath = path;
    return this;
  }
  params(params: Record<string, any>) {
    this.queryParams = params;
    return this;
  }
  headers(headers: Record<string, string>) {
    this.apiHeaders = headers;
    return this;
  }
  body(body: object) {
    this.apiBody = body;
    return this;
  }

  clearAuth() {
    this.clearAuthFlag = true;
    return this;
  }

  // GET REQUEST
  async getRequest(statusCode: number) {
    let responseJSON: any;
    const url = this.getUrl();

    await test.step(`Get request to ${url}`, async () => {
      this.logger.logRequest("GET", url, this.getHeaders());
      const response = await this.request.get(url, {
        headers: this.getHeaders(),
        params: this.queryParams,
      });

      this.cleanupFields();

      const actualStatus = response.status();
      responseJSON = await response.json();

      this.logger.logResponse(actualStatus, responseJSON);
      this.statusCodeValidator(actualStatus, statusCode, this.getRequest);
    });

    return responseJSON;
  }
  // POST REQUEST
  async postRequest(statusCode: number) {
    let responseJSON: any;
    const url = this.getUrl();

    await test.step(`POST request to ${url}`, async () => {
      this.logger.logRequest("POST", url, this.getHeaders(), this.apiBody);

      const response = await this.request.post(url, {
        headers: this.getHeaders(),
        data: this.apiBody,
      });

      this.cleanupFields();

      const actualStatus = response.status();
      responseJSON = await response.json();
      this.logger.logResponse(actualStatus, responseJSON);

      this.statusCodeValidator(actualStatus, statusCode, this.postRequest);
    });

    return responseJSON;
  }

  // PUT REQUEST
  async putRequest(statusCode: number) {
    let responseJSON: any;
    const url = this.getUrl();

    await test.step(`PUT request to ${url}`, async () => {
      this.logger.logRequest("PUT", url, this.getHeaders(), this.apiBody);

      const response = await this.request.put(url, {
        headers: this.getHeaders(),
        data: this.apiBody,
      });

      this.cleanupFields();

      const actualStatus = response.status();
      responseJSON = await response.json();
      this.logger.logResponse(actualStatus, responseJSON);

      this.statusCodeValidator(actualStatus, statusCode, this.putRequest);
    });

    return responseJSON;
  }

  // DELETE REQUEST
  async deleteRequest(statusCode: number) {
    const url = this.getUrl();

    await test.step(`DELETE request to ${url}`, async () => {
      this.logger.logRequest("DELETE", url, this.getHeaders());

      const response = await this.request.delete(url, {
        headers: this.getHeaders(),
      });

      this.cleanupFields();

      const actualStatus = response.status();
      this.logger.logResponse(actualStatus);

      this.statusCodeValidator(actualStatus, statusCode, this.deleteRequest);
    });
  }

  // --- ВНУТРЕННЯЯ КУХНЯ (Сборка адреса) ---
  private getUrl() {
    const base = this.baseUrl || this.defaultBaseUrl; // Берем свой URL или дефолтный
    const url = new URL(`${base}${this.apiPath}`); // Склеиваем

    // Добавляем параметры из объекта queryParams в строку URL
    for (const [key, value] of Object.entries(this.queryParams)) {
      url.searchParams.append(key, String(value));
    }

    return url.toString(); // Отдаем готовую строку-ссылку
  }
  private statusCodeValidator(
    actualStatus: number,
    expectStatus: number,
    callingMethod: Function,
  ) {
    if (actualStatus !== expectStatus) {
      const logs = this.logger.getRecentLogs();
      const error = new Error(
        `Expected status ${expectStatus} but got ${actualStatus}\n\nRecent API Activity: \n${logs}`,
      );
      Error.captureStackTrace(error, callingMethod);
      throw error;
    }
  }

  private getHeaders() {
    if (!this.clearAuthFlag) {
      this.apiHeaders["Authorization"] =
        this.apiHeaders["Authorization"] || this.defaultAuthToken;
    }
    return this.apiHeaders;
  }

  private cleanupFields() {
    this.apiBody = {};
    this.apiHeaders = {};
    this.baseUrl = undefined;
    this.apiPath = "";
    this.queryParams = {};
    this.clearAuthFlag = false;
  }
}

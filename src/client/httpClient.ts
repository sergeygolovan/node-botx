import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// Интерфейс HTTP клиента
export interface HttpClient {
  request<T = any>(config: AxiosRequestConfig): Promise<HttpResponse<T>>;
  get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  getStream(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<ReadableStream<Uint8Array>>>;
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
  patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>>;
}

// Интерфейс HTTP ответа
export interface HttpResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  headers: Record<string, string>;
  config: any;
  request?: any;
  
  // Методы для совместимости с fetch API
  ok: boolean;
  json(): Promise<any>;
  text(): Promise<string>;
  arrayBuffer(): Promise<ArrayBuffer>;
  
  // Поддержка потокового чтения (как в Python)
  body?: ReadableStream<Uint8Array>;
}

// Реализация на Axios
export class AxiosHttpClient implements HttpClient {
  private axiosInstance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create(config);
  }

  async request<T = any>(config: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.request<T>(config);
    return this.wrapAxiosResponse(response);
  }

  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.get<T>(url, config);
    return this.wrapAxiosResponse(response);
  }

  // Специальный метод для потокового чтения (как в Python)
  async getStream(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<ReadableStream<Uint8Array>>> {
    const response = await this.axiosInstance.get(url, {
      ...config,
      responseType: 'stream'
    });
    
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      config: response.config,
      request: response.request,
      ok: response.status >= 200 && response.status < 300,
      
      // Методы для совместимости с fetch API
      json: async () => {
        throw new Error('Cannot call json() on stream response');
      },
      text: async () => {
        throw new Error('Cannot call text() on stream response');
      },
      arrayBuffer: async () => {
        throw new Error('Cannot call arrayBuffer() on stream response');
      },
      
      // Потоковое чтение
      body: response.data as ReadableStream<Uint8Array>
    };
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.post<T>(url, data, config);
    return this.wrapAxiosResponse(response);
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.put<T>(url, data, config);
    return this.wrapAxiosResponse(response);
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.delete<T>(url, config);
    return this.wrapAxiosResponse(response);
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<HttpResponse<T>> {
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return this.wrapAxiosResponse(response);
  }

  private wrapAxiosResponse<T>(response: AxiosResponse<T>): HttpResponse<T> {
    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers as Record<string, string>,
      config: response.config,
      request: response.request,
      ok: response.status >= 200 && response.status < 300,
      
      // Методы для совместимости с fetch API
      json: async () => {
        if (typeof response.data === 'string') {
          return JSON.parse(response.data);
        }
        return response.data;
      },
      text: async () => {
        if (typeof response.data === 'string') {
          return response.data;
        }
        return JSON.stringify(response.data);
      },
      arrayBuffer: async () => {
        if (response.data instanceof ArrayBuffer) {
          return response.data;
        }
        if (response.data instanceof Uint8Array) {
          return response.data.buffer;
        }
        throw new Error('Response data is not an ArrayBuffer');
      }
    };
  }
}

// Фабричная функция для создания HTTP клиента
export function createHttpClient(config?: AxiosRequestConfig): HttpClient {
  return new AxiosHttpClient(config);
} 
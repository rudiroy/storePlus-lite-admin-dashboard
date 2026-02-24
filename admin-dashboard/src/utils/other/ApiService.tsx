/* eslint-disable @typescript-eslint/ban-ts-comment */
/** @format */
//@ts-nocheck
import axios from "axios";
import { API_URL } from "../../constants";
import toast from "react-hot-toast";
import { errorToast } from "../../helpers/other/services";

class ApiService {
  constructor() {
    this.isRefreshing = false;
    this.refreshSubscribers = [];

    this.client = axios.create({
      baseURL: API_URL,
      withCredentials: true, // cookies auto-included
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": true,
      },
    });

    // Interceptors
    this.client.interceptors.request.use(
      this.handleRequest,
      this.handleRequestError
    );
    this.client.interceptors.response.use(
      this.handleSuccess,
      this.handleResponseError
    );
  }

  // === Interceptors ===
  handleRequest = (config) => {
    if (config.data && !(config.data instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }
    return config;
  };

  handleRequestError = (error) => {
    return Promise.reject(error);
  };

  handleSuccess = (response) => {
    const { data, config } = response;

    if (data?.type && data?.message) {
      if (data.type === "error") {
        // Backend explicitly says it's an error
        toast.error((t) => (
          <p className="flex text-nowrap items-center gap-1">
            {data.message} &nbsp;
            <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
          </p>
        ));
      } else if (
        config.method !== "get" &&
        data.message !== "Token refreshed"
      ) {
        // 🔒 No success toast for GET
        toast.success(data.message);
      }
    }

    return data;
  };

  handleError = (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "An error occurred.";

    const noToast =
      error.response?.data?.message === "Refresh token expired or invalid" &&
      error.response?.status === 403;
    // Avoid duplicate toast spam if refresh also failed
    if (!error.config?._skipToast && !noToast) {
      toast.error((t) => (
        <p className="flex text-nowrap items-center gap-1">
          {message} &nbsp;
          <button onClick={() => toast.dismiss(t.id)}>Dismiss</button>
        </p>
      ));
    }
    return Promise.reject({ ...error, message });
  };

  handleResponseError = async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      error.response?.data?.message === "No refresh token provided"
    ) {
      return this.handleError(error);
    }

    // Case 1: Token expired (401)
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (this.isRefreshing) {
        // Wait for refresh to finish
        return new Promise((resolve) => {
          this.refreshSubscribers.push(() =>
            resolve(this.client(originalRequest))
          );
        });
      }

      originalRequest._retry = true;
      this.isRefreshing = true;

      try {
        await this.client.post("create/auth/refresh"); // backend sets new access cookie

        this.isRefreshing = false;
        this.refreshSubscribers.forEach((cb) => cb());
        this.refreshSubscribers = [];

        return this.client(originalRequest); // retry original request
      } catch (refreshError) {
        errorToast("Session expired. Please log in again.");
        window.location.href = "/login";
        this.isRefreshing = false;
        localStorage.clear();
        return Promise.reject({ ...refreshError, _skipToast: true });
      }
    }

    // Case 2: Other errors
    return this.handleError(error);
  };

  // === CRUD methods ===
  retrieve = (url, params = {}, config = {}) =>
    this.client.get(`retrieve/${url}`, { params, ...config });

  get = (url, params = {}, config = {}) =>
    this.client.get(url, { params, ...config });

  post = (url, data = {}, config = {}) =>
    this.client.post(`create/${url}`, data, config);

  put = (url, data = {}, config = {}) =>
    this.client.put(`update/${url}`, data, config);

  delete = (url, data = {}, config = {}) =>
    this.client.delete(`delete/${url}`, { data, ...config });
}

export const $crud = new ApiService();

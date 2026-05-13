import axios from "axios";

const axiosInstance = axios.create({
  // baseURL: "http://localhost:3333/api/",
  baseURL: "http://3.82.253.20:3333/api/",
  
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach token to every request
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is an authentication error
    if (error.response?.status === 401) {
      // Special case: If this is a refresh token request itself, don't retry
      if (originalRequest.url.includes("refresh-token")) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      // If already refreshing, queue the request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = localStorage.getItem("RefreshToken");

      if (!refreshToken) {
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        const res = await axios.post(
          // "http://localhost:3333/api/auth/refresh-token",
          "http://3.82.253.20:3333/api/auth/refresh-token",
          { refreshToken },
          {
            // Important: Don't use axiosInstance here to avoid infinite loop
            // baseURL: "http://localhost:3333/api/",
            baseURL: "http://3.82.253.20:3333/api/",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        const newToken = res?.data?.data?.accessToken;
        // console.log(res.data)

        // Store the new token
        if (newToken) {
          localStorage.setItem("token", newToken);
        }

        // Update default headers
        axiosInstance.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${newToken}`;

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

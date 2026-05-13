import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store/index.js";
import links from "./contstants/links.js";
import axios from "axios";

import { QueryClientProvider, QueryClient } from "@tanstack/react-query";
import { userActions } from "./store/reducers/userReducers.js";
// import { refreshAccessToken } from "./services/index/users.js";

axios.defaults.baseURL = links.BASE_URL;

// axios.interceptors.request.use(
//   (request) => {
//     const userInfo = JSON.parse(localStorage.getItem("account"));
//     // console.log(userInfo);
//     const accessToken = userInfo?.accessToken;
//     if (accessToken) {
//       request.headers["Authorization"] = `Bearer ${accessToken}`;
//     }
//     return request;
//   },
//   (error) => Promise.reject(error)
// );

// axios.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     const originalRequest = error.config;

//     if (
//       error.response &&
//       error.response.status === 401
//     ) {

//       try {
//         const account = JSON.parse(localStorage.getItem("account"));
//         const refreshToken = account?.refreshToken;

//         if (refreshToken) {
//           const response = await axios.post("auth/refresh-token", {
//             refreshToken,
//           });

//           if (response.status !== 200) {
//             throw new Error("Failed to refresh token");
//           }

//           const { accessToken, refreshToken: newRefreshToken } =
//             response.data?.data;

//           if (!accessToken || !newRefreshToken) {
//             throw new Error("Failed to refresh tokens");
//           }

//           const updatedAccount = {
//             ...account,
//             accessToken: accessToken,
//             refreshToken: newRefreshToken,
//           };
//           // console.log("Updated account:", updatedAccount);
//           localStorage.setItem("account", JSON.stringify(updatedAccount));
//           store.dispatch(userActions.setUserInfo(updatedAccount));

//           // Update the authorization header for the original request
//           originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;

//           return axios.request(originalRequest);
//         }
//       } catch (refreshError) {
//         console.error("Token refresh failed:", refreshError);
//         console.error("Logging out user due to token refresh failure");
//         localStorage.removeItem("account");
//         store.dispatch(userActions.resetUserInfo());

//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   }
// );

const axiosInstance = axios.create({
  baseURL: links.BASE_URL,
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

axiosInstance.interceptors.request.use(
  (config) => {
    const account = JSON.parse(localStorage.getItem("account"));
    const accessToken = account?.accessToken;
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401) {
      // If the failing request IS the refresh-token call itself — log out immediately
      if (originalRequest.url.includes("refresh-token")) {
        localStorage.removeItem("account");
        store.dispatch(userActions.resetUserInfo());
        window.location.href = "/";
        return Promise.reject(error);
      }

      // If a refresh is already in progress, queue this request until it resolves
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const account = JSON.parse(localStorage.getItem("account"));
        const refreshToken = account?.refreshToken;

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Use plain axios (not axiosInstance) to avoid triggering this interceptor again
        const response = await axios.post(
          `${links.BASE_URL}auth/refresh-token`,
          { refreshToken },
          { headers: { "Content-Type": "application/json" } },
        );

        if (response.status !== 200) {
          throw new Error("Failed to refresh token");
        }

        const { accessToken, refreshToken: newRefreshToken } =
          response.data?.data;

        if (!accessToken || !newRefreshToken) {
          throw new Error("Missing tokens in refresh response");
        }

        // Persist updated tokens — same shape as main.jsx expects
        const updatedAccount = {
          ...account,
          accessToken,
          refreshToken: newRefreshToken,
        };
        localStorage.setItem("account", JSON.stringify(updatedAccount));

        // Sync Redux store
        store.dispatch(userActions.setUserInfo(updatedAccount));

        // Update default header for future requests
        axiosInstance.defaults.headers.common["Authorization"] =
          `Bearer ${accessToken}`;

        // Unblock queued requests
        processQueue(null, accessToken);

        // Retry the original failed request with the new token
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed — clear everything and redirect to login
        processQueue(refreshError, null);
        localStorage.removeItem("account");
        store.dispatch(userActions.resetUserInfo());
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
);

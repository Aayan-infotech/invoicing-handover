// src/api/authAxios.js
import axios from "axios";
import { refreshAccessToken } from "../services/index/users";


export const fetchWithAuth = async (url, options = {}) => {
  const account = localStorage.getItem("account");
  const token = account ? JSON.parse(account).accessToken : null;
  try {
    const response = await axios({
      ...options,
      url,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });

    return response;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      const newToken = await refreshAccessToken();
      if (newToken) {
        try {
          const retryResponse = await axios({
            ...options,
            url,
            headers: {
              ...(options.headers || {}),
              Authorization: `Bearer ${newToken}`,
            },
          });
          return retryResponse;
        } catch (error) {
          console.error("Retry request failed:", error);
        }
      }
    }
    throw error;
  }
};

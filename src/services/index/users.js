import axios from "axios";
import { userActions } from "../../store/reducers/userReducers";
import store from "../../store";

export const login = async ({ username, password }) => {
    try {
        const { data } = await axios.post("auth/login", {
            username,
            password,
        });
        return data;
    } catch (error) {
        if (error.response && error.response.data.message)
            throw new Error(error.response.data.message);
        throw new Error(error.message);
    }
};


export const refreshAccessToken = async () => {
    try {
        const account = localStorage.getItem("account");
        const token = account ? JSON.parse(account).refreshToken : null;
        const response = await axios.post("auth/refresh-token", {
            refreshToken: token,
        });
        const newToken = response.data.data.accessToken;
        const newRefreshToken = response.data.data.refreshToken;

        const updatedAccount = {
            ...JSON.parse(account),
            accessToken: newToken,
            refreshToken: newRefreshToken,
        };
        localStorage.setItem("account", JSON.stringify(updatedAccount));
        store.dispatch(userActions.setUserInfo(updatedAccount));

        return newToken;
    } catch (error) {
        console.error("Refresh token failed", error);
        localStorage.clear(); 
        window.location.href = "/login"; 
        return null;
    }
}

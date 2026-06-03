import axios from "axios";
import { getToken } from "../utils/token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// axios 인스턴스 생성
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// 요청마다 토큰 자동 첨부해서 보내줌
api.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});


export async function registerUser(formData) {
    const response = await axios.post(
        `${API_BASE_URL}/api/auth/register`,
        formData,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
}

export async function loginUser(formData) {
    const response = await axios.post(
        `${API_BASE_URL}/api/auth/login`,
        formData,
        {
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    return response.data;
}

export async function findEmail(formData) {
    const response = await axios.post(
        `${API_BASE_URL}/api/auth/find-email`,
        formData
    );
    return response.data;
}

export async function verifyPasswordUser(formData) {
    const response = await axios.post(
        `${API_BASE_URL}/api/auth/verify-password-user`,
        formData
        );

    return response.data;
}

export async function changePassword(formData) {
    const response = await axios.patch(
        `${API_BASE_URL}/api/auth/password`,
        formData
    );
    
    return response.data;
}
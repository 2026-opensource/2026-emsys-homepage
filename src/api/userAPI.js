import axios from "axios";
import { getToken } from "../utils/token"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("API_BASE_URL:", API_BASE_URL); // API_BASE_URL이 올바르게 로드되는지 확인

export async function getMyInfo() {
    const token = getToken();
    const response = await axios.get(
        `${API_BASE_URL}/api/auth/me`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

export async function updateProfileImage(file) {
    const token = getToken();

    const formData = new FormData();
    formData.append("profileImage", file);

    const response = await axios.patch(
        `${API_BASE_URL}/api/auth/me/profile-image`,
        formData,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "multipart/form-data",
            },
        }
    );

    return response.data;
}

export async function resetProfileImage() {
    const token = getToken();

    const response = await axios.delete(
        `${API_BASE_URL}/api/auth/me/profile-image`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

export async function updateGreetingMessage(greetingMessage) {
    const token = getToken();

    const response = await axios.patch(
        `${API_BASE_URL}/api/auth/me/greeting`,
        {
            greeting_message: greetingMessage,
        },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

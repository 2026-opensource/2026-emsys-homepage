import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
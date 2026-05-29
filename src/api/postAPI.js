import axios from "axios";
import { getToken } from "../utils/token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function createPost(postData) {
    const token = getToken();

    const response = await axios.post(
        `${API_BASE_URL}/api/posts`,
        postData,
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}
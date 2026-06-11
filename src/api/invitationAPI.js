import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function getInvitationCode({ student_id, name }) {
    const response = await axios.get(`${API_BASE_URL}/api/invitation`, {
        params: { student_id, name },
    });
    return response.data;
}
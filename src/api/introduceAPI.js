import axios from 'axios';


const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

export const fetchExecutives = async () => {
    try {
        const response = await axios.get(`${BASE_URL}/introduce/executives`);;
        return response.data;
    } catch (error) {
        console.error('임원 목록 조회 실패:', error);
        throw error;
    }
};
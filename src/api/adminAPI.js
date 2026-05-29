// 관리자 페이지 api 연결 
import axios from 'axios';

// 백엔드 기본 주소 (프론트와 포트가 다르다면 백엔드가 켜진 5000번 포트를 적습니다)
const BASE_URL = 'http://localhost:5000/api'; 

// 전체 부원 목록 가져오기 (관리자용 창구일 확률이 높음)
export const fetchMembers = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/admin/users`
        );
        return response.data; 
    } catch (error) {
        console.error('부원 목록 조회 실패:', error);
        throw error;
    }
};

// 전체 게시글 목록 가져오기
export const fetchPosts = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/posts`
        );
        return response.data;
    } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
        throw error;
    }
};

// 임원 목록 불러오기
export const fetchExecutives = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/admin/officers`
        );
        return response.data;
    } catch (error) {
        console.error('임원 목록 조회 실패:', error);
        throw error;
    }
};

// 임원 임명
export const appointExecutive = async (userId) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/officers/${userId}/appoint`
        );

        return response.data;
    } catch (error) {
        console.error('임원 임명 실패:', error);
        throw error;
    }
};

// 임원 해임
export const dismissExecutive = async (userId) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/officers/${userId}/dismiss`
        );

        return response.data;
    } catch (error) {
        console.error('임원 해임 실패:', error);
        throw error;
    }
};

// 회장 권한 위임
export const delegateMaster = async (userId) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/president/delegate`,{
                targetUserId: userId,
                confirmText: "위임합니다"
            }
        );

        return response.data;
    } catch (error) {
        console.error('회장 권한 위임 실패', error);
        throw error;
    }
}
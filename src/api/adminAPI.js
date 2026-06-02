// 관리자 페이지 api 연결 
import axios from 'axios';
import { getToken } from "../utils/token";

// 백엔드 기본 주소 (프론트와 포트가 다르다면 백엔드가 켜진 5000번 포트를 적습니다)
const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const authHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// 전체 부원 목록 가져오기
export const fetchMembers = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/admin/users?active=true`,
            authHeaders()
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
            `${BASE_URL}/posts`,
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('게시글 목록 조회 실패:', error);
        throw error;
    }
};

// 게시글 단건 삭제
export const deletePost = async (postId) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/posts/${postId}`,
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('게시글 삭제 실패:', error);
        throw error;
    }
};

// 부원 학적 상태 일괄 변경
export const updateUsersStatus = async (userIds, status) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/users/status`,
            { userIds, status },
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('부원 상태 변경 실패:', error);
        throw error;
    }
};


// 부원 일괄 탈퇴
export const withdrawUsers = async (userIds, withdrawReason) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/users/withdraw`,
            { userIds, withdrawReason },
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('부원 탈퇴 처리 실패:', error);
        throw error;
    }
};

// 임원 목록 불러오기
export const fetchExecutives = async () => {
    try {
        const response = await axios.get(
            `${BASE_URL}/admin/officers`,
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('임원 목록 조회 실패:', error);
        throw error;
    }
};

// 임원 임명
export const appointExecutive = async (userId, position) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/officers/${userId}/appoint`,
            { position },
            authHeaders()
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
            `${BASE_URL}/admin/officers/${userId}/dismiss`, 
            {}, authHeaders()
        );

        return response.data;
    } catch (error) {
        console.error('임원 해임 실패:', error);
        throw error;
    }
};

// 회장 권한 위임
export const delegateMaster = async (userId, confirmText) => {
    try {
        const response = await axios.patch(
            `${BASE_URL}/admin/president/delegate`,{
                targetUserId: userId,
                confirmText: confirmText
            },
            authHeaders()
        );

        return response.data;
    } catch (error) {
        console.error('회장 권한 위임 실패', error);
        throw error;
    }
}

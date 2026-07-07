// 회원 정보(초대코드) 관리 페이지 api 연결
import axios from 'axios';
import { getToken } from "../utils/token";

const BASE_URL = `${import.meta.env.VITE_API_BASE_URL}/api`;

const authHeaders = () => ({
    headers: {
        Authorization: `Bearer ${getToken()}`
    }
});

// 회원(초대코드) 목록 조회 - 검색/필터/페이지네이션
export const fetchInvitationMembers = async ({ page = 1, pageSize = 15, search = '', status = 'all' }) => {
    try {
        const response = await axios.get(
            `${BASE_URL}/admin/invitation-members?page=${page}&pageSize=${pageSize}&search=${search}&status=${status}`,
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('회원 정보 조회 실패:', error);
        throw error;
    }
};

// 회원 신규 등록 (초대코드는 서버에서 자동 생성)
export const createInvitationMember = async ({ name, student_id, phone }) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/admin/invitation-members`,
            { name, student_id, phone },
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('회원 등록 실패:', error);
        throw error;
    }
};

// 회원 정보 수정
export const updateInvitationMember = async (id, { name, student_id, phone }) => {
    try {
        const response = await axios.put(
            `${BASE_URL}/admin/invitation-members/${id}`,
            { name, student_id, phone },
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('회원 정보 수정 실패:', error);
        throw error;
    }
};

// 회원 삭제
export const deleteInvitationMember = async (id) => {
    try {
        const response = await axios.delete(
            `${BASE_URL}/admin/invitation-members/${id}`,
            authHeaders()
        );
        return response.data;
    } catch (error) {
        console.error('회원 삭제 실패:', error);
        throw error;
    }
};

// 엑셀 업로드 - 서버에서 파싱 후 학번 기준 중복 제외하고 신규만 등록
export const uploadInvitationExcel = async (formData) => {
    try {
        const response = await axios.post(
            `${BASE_URL}/admin/invitation-members/upload`,
            formData,
            {
                headers: {
                    ...authHeaders().headers,
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (error) {
        console.error('엑셀 업로드 실패:', error);
        throw error;
    }
};
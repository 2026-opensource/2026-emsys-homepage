// 글 작성 데이터를 백엔드로 보내는 파일
import axios from "axios";
import { getToken } from "../utils/token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// 게시글 작성
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

// 게시글 수정
export async function updatePost(id, postData) {
    const token = getToken();

    const response = await axios.put(
        `${API_BASE_URL}/api/posts/${id}`,
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

// 게시글 삭제
export async function deletePost(id) {
    const token = getToken();

    const response = await axios.delete(
        `${API_BASE_URL}/api/posts/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

// 게시글 목록 조회
export async function getPosts({ board_type = "COMMUNITY", category = "all", search = "", page = 1, limit = 5 }) {
    const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        params: {
            board_type,
            category,
            search,
            page,
            limit,
        },
    });

    return response.data;
}

// 게시글 상세 내용 조회
export async function getPostById(id) {
    const token = getToken();

    const response = await axios.get(
        `${API_BASE_URL}/api/posts/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

// 게시글 조회수 증가
export async function increasePostView(id) {
    const token = getToken();

    const response = await axios.post(
        `${API_BASE_URL}/api/posts/${id}/view`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

// 게시글 좋아요, 싫어요
export async function togglePostLike(postId) {
    const token = getToken();

    const response = await axios.post(
        `${API_BASE_URL}/api/posts/${postId}/like`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

export async function togglePostDislike(postId) {
    const token = getToken();

    const response = await axios.post(
        `${API_BASE_URL}/api/posts/${postId}/dislike`,
        {},
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

// 댓글 작성, 수정, 삭제
export async function createComment(postId, content) {
    const token = getToken();

    const response = await axios.post(
        `${API_BASE_URL}/api/comment`,
        {
            post_id: Number(postId),
            content,
        },
        {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
}

export const updateComment = async (commentId, content) => {
    const token = getToken();

    const response = await axios.put(
        `${API_BASE_URL}/api/comment/${commentId}`,
        { content },
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

export const deleteComment = async (commentId) => {
    const token = getToken();

    const response = await axios.delete(
        `${API_BASE_URL}/api/comment/${commentId}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    return response.data;
};

// 게시글 이미지 업로드, 삭제
export async function uploadPostImages(files) {
    const token = getToken();
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("images", file);
    });

    const response = await axios.post(
        `${API_BASE_URL}/api/posts/upload/post-images`,
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

export async function deleteUnusedPostImages(images) {
    const token = getToken();

    const response = await axios.delete(
        `${API_BASE_URL}/api/posts/upload/post-images`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            data: {
                images,
            },
        }
    );

    return response.data;
}
export async function getMyPosts({ page = 1, limit = 5 }) {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/api/posts/my`, {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

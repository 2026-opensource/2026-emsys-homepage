// 글 작성 데이터를 백엔드로 보내는 파일
import axios from "axios";
import { getToken } from "../utils/token";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const authHeaders = () => {
    const token = getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
};

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
export async function getPosts({ board_type = "COMMUNITY", category = "all", sub_category = "all", exclude_category, search = "", page = 1, limit = 5, sort = "latest" }) {
    const params = {
        board_type,
        category,
        search,
        page,
        limit,
        sort,
        sub_category,
    };

    if (exclude_category) {
        params.exclude_category = exclude_category;
    }

    const response = await axios.get(`${API_BASE_URL}/api/posts`, {
        params,
        headers: authHeaders(),
    });
    return response.data;
}

// 커뮤니티 인기글 목록 조회
export async function getPopularPosts({ category = "all", search = "", page = 1, limit = 15 }) {
    const response = await axios.get(`${API_BASE_URL}/api/posts/popular`, {
        params: { category, search, page, limit },
        headers: authHeaders(),
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

// 댓글 작성, 수정, 삭제 (parentId가 있으면 대댓글로 작성)
export async function createComment(postId, content, parentId) {
    const token = getToken();

    const response = await axios.post(
        `${API_BASE_URL}/api/comment`,
        {
            post_id: Number(postId),
            content,
            ...(parentId ? { parent_id: Number(parentId) } : {}),
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
export async function getMyPosts({
    page = 1,
    limit = 5,
    board_type = "all",
    category = "all",
    sub_category = "all",
    exclude_category,
    search = "",
    sort = "latest",
}) {
    const token = getToken();
    const params = {
        page,
        limit,
        board_type,
        category,
        sub_category,
        search,
        sort,
    };

    if (exclude_category) {
        params.exclude_category = exclude_category;
    }

    const response = await axios.get(`${API_BASE_URL}/api/posts/my`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export async function getUserPosts(userId, {
    page = 1,
    limit = 5,
    board_type = "all",
    category = "all",
    sub_category = "all",
    exclude_category,
    search = "",
    sort = "latest",
}) {
    const token = getToken();
    const params = {
        page,
        limit,
        board_type,
        category,
        sub_category,
        search,
        sort,
    };

    if (exclude_category) {
        params.exclude_category = exclude_category;
    }

    const response = await axios.get(`${API_BASE_URL}/api/posts/users/${userId}`, {
        params,
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 내 임시저장 글 목록 조회
export async function getMyDrafts() {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/api/posts/my/drafts`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
}

export async function getMyPostCategoryStats() {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/api/posts/my/category-stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export async function getUserPostCategoryStats(userId) {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/api/posts/users/${userId}/category-stats`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export async function getMyPostActivityStats(year) {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/api/posts/my/activity`, {
        params: { year },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

export async function getUserPostActivityStats(userId, year) {
    const token = getToken();
    const response = await axios.get(`${API_BASE_URL}/api/posts/users/${userId}/activity`, {
        params: { year },
        headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
};

// 게시글 첨부파일 업로드
// 게시글 첨부파일 업로드
export async function uploadPostFiles(files) {
    const token = getToken();
    const formData = new FormData();

    files.forEach((file) => {
        formData.append("files", file);
    });

    const response = await axios.post(
        `${API_BASE_URL}/api/posts/upload/post-files`,
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

// 업로드했지만 게시글에 사용하지 않은 첨부파일 삭제
export async function deleteUnusedPostFiles(files) {
    const token = getToken();

    const response = await axios.delete(
        `${API_BASE_URL}/api/posts/upload/post-files`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            data: {
                files,
            },
        }
    );

    return response.data;
}

import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  getPostById,
  togglePostLike,
  togglePostDislike,
  increasePostView,
  createComment,
  updateComment,
  deletePost,
  deleteComment,
} from "../api/postAPI";
import DOMPurify from "dompurify";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import { getToken, isAuthError, isLoggedIn, redirectToLogin } from "../utils/token";
import defaultProfile from "../assets/images/기본_프로필_라이트.png";

import "../styles/post-detail.css";
import "../styles/board.css";

function PostDetail() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const fetchedRef = useRef(false);

  const [commentContent, setCommentContent] = useState("");
  // 댓글 관련 메시지는 댓글창 안에서
  const [commentMessage, setCommentMessage] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingCommentContent, setEditingCommentContent] = useState("");
  const [replyingToId, setReplyingToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  const [viewerImages, setViewerImages] = useState([]); // 전체 이미지 목록
  const [viewerIndex, setViewerIndex] = useState(0); // 현재 이미지의 인덱스

  // 좋아요 / 싫어요 상태
  const [like, setLike] = useState(false);
  const [dislike, setDislike] = useState(false);
  const [reactionMessage, setReactionMessage] = useState("");

  function getCategoryText(category) {
    if (category === "notice") return "공지사항";
    if (category === "free") return "자유";
    if (category === "qna") return "질문";
    if (category === "recruit") return "팀원 모집";
    if (category === "study") return "스터디";
    if (category === "project") return "프로젝트";
    if (category === "contest") return "대회/공모전";
    if (category === "class") return "수업";
    if (category === "activity") return "행사";
    if (category === "maintenance") return "점검안내";
    return category;
  }

  function getListPath(board_type, category) {
    if (board_type === "COMMUNITY" && category === "notice") return "/notice";
    if (board_type === "ARCHIVE") return "/resources";
    if (board_type === "GALLERY") return "/gallery";
    if (board_type === "MAINTENANCE") return "/maintenance";
    return "/community";
  }

  // 게시글 상세 정보 가져오기
  useEffect(() => {
    if (fetchedRef.current) {
      return;
    }

    fetchedRef.current = true;

    async function fetchPostDetail() {
      try {
        setLoading(true);
        setErrorMessage("");

        const viewResult = await increasePostView(id);
        const result = await getPostById(id);

        console.log("게시글 상세 응답:", result);

        setPost({
          ...result.data,
          view_count: viewResult.data.view_count,
        });

        setLike(result.data.isLiked);
        setDislike(result.data.isDisliked);
      } catch (error) {
        console.error("게시글 상세 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
          return;
        }

        setErrorMessage(
          error.response?.data?.message || "게시글을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPostDetail();
  }, [id, navigate]);

  // 학번 따오기용
  function getStudentYear(studentId) {
    if (!studentId) return "";

    const id = String(studentId);

    return id.slice(2, 4);
  }

  // 상세용: 학번 이름 (status)
  function getUserDisplayName(user) {
    if (!user || user.is_active === false || user.is_active === 0) {
      return "존재하지 않는 사용자입니다";
    }

    const studentYear = user.student_id?.slice(2, 4) || "";

    return `${studentYear} ${user.name}`;
  }

  function getUserProfileImageUrl(user) {
    if (!user?.profile_image || user.is_active === false || user.is_active === 0) {
      return defaultProfile;
    }

    if (user.profile_image.startsWith("http")) {
      return user.profile_image;
    }

    return `${import.meta.env.VITE_API_BASE_URL}${user.profile_image}`;
  }

  // 글 수정 시간
  function isEdited(createdAt, updatedAt) {
    if (!createdAt || !updatedAt) return false;

    return new Date(updatedAt).getTime() > new Date(createdAt).getTime();
  }

  // 글 작성 날짜
  function formatDate(date) {
    if (!date) return "";

    return date.slice(0, 10);
  }

  function formatFileSize(size) {
    if (!size) return "";

    if (size < 1024 * 1024) {
      return `${Math.ceil(size / 1024)}KB`;
    }

    return `${(size / 1024 / 1024).toFixed(1)}MB`;
  }

  const handleDelete = async () => {
    const isDelete = window.confirm(
      "게시글을 삭제하면 복구할 수 없습니다. 삭제하시겠습니까?",
    );

    if (!isDelete) return;

    try {
      await deletePost(id);

      alert("게시글이 삭제되었습니다.");
      navigate(getListPath(post.board_type, post.category));
    } catch (error) {
      console.error("게시글 삭제 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setReactionMessage(
        error.response?.data?.message || "게시글 삭제에 실패했습니다.",
      );
    }
  };

  // =========================
  // 좋아요 클릭
  // =========================
  const handleLike = async () => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate);
      return;
    }

    try {
      const result = await togglePostLike(id);

      console.log("좋아요 응답:", result);

      // 성공 메시지는 화면에 보여주지 않음
      setReactionMessage("");

      // getPostById(id)를 다시 호출하면 조회수가 증가하므로,
      // 백엔드 toggleLike 응답으로 받은 개수만 현재 post state에 반영
      setPost({
        ...post,
        _count: {
          ...post._count,
          post_likes: result.data.likeCount,
          post_dislikes: result.data.dislikeCount,
        },
      });

      setLike(result.data.isLiked);
      setDislike(result.data.isDisliked);
    } catch (error) {
      console.error("좋아요 처리 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setReactionMessage(
        error.response?.data?.message || "좋아요 처리에 실패했습니다.",
      );
    }
  };

  // =========================
  // 싫어요 클릭
  // =========================
  const handleDislike = async () => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate);
      return;
    }

    try {
      const result = await togglePostDislike(id);

      console.log("싫어요 응답:", result);

      // 성공 메시지는 화면에 보여주지 않음
      setReactionMessage("");

      // getPostById(id)를 다시 호출하면 조회수가 증가하므로,
      // 백엔드 toggleDislike 응답으로 받은 개수만 현재 post state에 반영
      setPost({
        ...post,
        _count: {
          ...post._count,
          post_likes: result.data.likeCount,
          post_dislikes: result.data.dislikeCount,
        },
      });

      setLike(result.data.isLiked);
      setDislike(result.data.isDisliked);
    } catch (error) {
      console.error("싫어요 처리 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setReactionMessage(
        error.response?.data?.message || "싫어요 처리에 실패했습니다.",
      );
    }
  };

  // =========================
  // 댓글 작성
  // =========================
  const handleCommentSubmit = async () => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate);
      return;
    }

    if (!commentContent.trim()) {
      setCommentMessage("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const result = await createComment(id, commentContent);

      console.log("댓글 작성 응답:", result);

      setPost({
        ...post,
        comments: [result.data, ...(post.comments || [])],
      });

      setCommentContent("");
      setCommentMessage("");
    } catch (error) {
      console.error("댓글 작성 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setCommentMessage(
        error.response?.data?.message || "댓글 작성에 실패했습니다.",
      );
    }
  };

  // =========================
  // 대댓글 (답글) 작성
  // =========================
  const getTopLevelComments = () =>
    (post.comments || []).filter((comment) => !comment.parent_id);

  const getReplies = (commentId) =>
    (post.comments || [])
      .filter((comment) => comment.parent_id === commentId)
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const handleReplyStart = (commentId) => {
    setReplyingToId((prev) => (prev === commentId ? null : commentId));
    setReplyContent("");
  };

  const handleReplySubmit = async (parentId) => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate);
      return;
    }

    if (!replyContent.trim()) {
      setCommentMessage("답글 내용을 입력해주세요.");
      return;
    }

    try {
      const result = await createComment(id, replyContent, parentId);

      setPost({
        ...post,
        comments: [result.data, ...(post.comments || [])],
      });

      setReplyContent("");
      setReplyingToId(null);
      setCommentMessage("");
    } catch (error) {
      console.error("답글 작성 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setCommentMessage(
        error.response?.data?.message || "답글 작성에 실패했습니다.",
      );
    }
  };

  const handleCommentEditStart = (comment) => {
    setEditingCommentId(comment.id);
    setEditingCommentContent(comment.content);
  };
  const handleCommentUpdate = async (commentId) => {
    if (!editingCommentContent.trim()) {
      setCommentMessage("댓글 내용을 입력해주세요.");
      return;
    }

    try {
      const result = await updateComment(commentId, editingCommentContent);

      setPost({
        ...post,
        comments: post.comments.map((comment) =>
          comment.id === commentId
            ? {
              ...comment,
              content: result.data.content,
              updated_at: result.data.updated_at,
            }
            : comment,
        ),
      });

      setEditingCommentId(null);
      setEditingCommentContent("");
      setCommentMessage("");
    } catch (error) {
      console.error("댓글 수정 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setCommentMessage(
        error.response?.data?.message || "댓글 수정에 실패했습니다.",
      );
    }
  };

  const handleCommentDelete = async (commentId) => {
    const isDelete = window.confirm("댓글을 삭제하시겠습니까?");

    if (!isDelete) return;

    try {
      await deleteComment(commentId);

      setPost({
        ...post,
        comments: post.comments.filter((comment) => comment.id !== commentId),
      });

      setCommentMessage("");
    } catch (error) {
      console.error("댓글 삭제 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      setCommentMessage(
        error.response?.data?.message || "댓글 삭제에 실패했습니다.",
      );
    }
  };

  // 댓글/답글 카드 렌더링 (isReply면 답글 UI 생략)
  const renderCommentCard = (comment, isReply = false) => (
    <div
      className={`comment-card${isReply ? " comment-reply-card" : ""}`}
      key={comment.id}
    >
      <div className="comment-main">
        <div className="comment-header">
          <h3 className="comment-writer">
            <Link
              className="comment-author-link"
              to={`/mypage/${comment.author_id}`}
            >
              <img
                className="comment-author-avatar"
                src={getUserProfileImageUrl(comment.users)}
                alt=""
              />
              <span className="comment-writer-name">
                {getUserDisplayName(comment.users)}
              </span>
            </Link>
            <span>·</span>
            <span className="comment-date-info">
              작성일{" "}
              {isEdited(comment.created_at, comment.updated_at)
                ? formatDate(comment.updated_at)
                : formatDate(comment.created_at)}
              {isEdited(comment.created_at, comment.updated_at) &&
                " (수정됨)"}
            </span>
          </h3>
          <div className="comment-actions">
            {(() => {
              const commentAuthorId = comment.user_id ?? comment.author_id;

              const isCommentAuthor =
                Number(commentAuthorId) === Number(loginUser?.id);

              const canEditComment = isCommentAuthor;
              const canDeleteComment = isCommentAuthor || isAdmin;

              return (
                <>
                  {canEditComment && (
                    <>
                      {editingCommentId === comment.id ? (
                        <button
                          type="button"
                          className="comment-edit-btn"
                          onClick={() => handleCommentUpdate(comment.id)}
                        >
                          저장
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="comment-edit-btn"
                          onClick={() => handleCommentEditStart(comment)}
                        >
                          수정
                        </button>
                      )}
                    </>
                  )}

                  {canDeleteComment && (
                    <button
                      type="button"
                      className="comment-delete-btn"
                      onClick={() => handleCommentDelete(comment.id)}
                    >
                      삭제
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
        {editingCommentId === comment.id ? (
          <input
            type="text"
            className="comment-input"
            value={editingCommentContent}
            onChange={(e) => setEditingCommentContent(e.target.value)}
          />
        ) : (
          <p className="comment-text">{comment.content}</p>
        )}

        {!isReply && (
          <button
            type="button"
            className="comment-reply-btn"
            onClick={() => handleReplyStart(comment.id)}
          >
            {replyingToId === comment.id ? "답글 취소" : "답글"}
          </button>
        )}

        {!isReply && replyingToId === comment.id && (
          <div className="comment-reply-input-section">
            <input
              type="text"
              className="comment-input"
              placeholder="답글을 입력하세요..."
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
            />
            <button
              type="button"
              className="comment-submit-btn"
              onClick={() => handleReplySubmit(comment.id)}
            >
              ➤
            </button>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="board-page">
          <div className="detail-container">
            <p>게시글을 불러오는 중...</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (errorMessage) {
    return (
      <>
        <Navbar />
        <main className="board-page">
          <div className="detail-container">
            <p>{errorMessage}</p>
            <button type="button" onClick={() => navigate(-1)}>
              돌아가기
            </button>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (!post) {
    return (
      <>
        <Navbar />
        <main className="board-page">
          <div className="detail-container">
            <p>게시글이 없습니다.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const loginUser = JSON.parse(localStorage.getItem("userInfo"));

  const isAuthor = Number(post?.author_id) === Number(loginUser?.id);
  const isAdmin =
    loginUser?.role === "PRESIDENT" || loginUser?.role === "OFFICER";

  const canEditPost = isAuthor;
  const canDeletePost = isAuthor || isAdmin;

  const handleImageClick = (e) => {
    if (e.target.tagName !== "IMG") return;

    const allImgs = [...e.currentTarget.querySelectorAll("img")];
    const urls = allImgs.map((img) => img.dataset.display || img.src);
    const clickedUrl = e.target.dataset.display || e.target.src;
    const index = urls.indexOf(clickedUrl);

    setViewerImages(urls);
    setViewerIndex(index);
  };

  const downloadBlob = (blob, filename) => {
    const objectUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(objectUrl);
  };

  const handleImageDownload = async (url) => {
    if (!isLoggedIn()) {
      redirectToLogin(navigate);
      return;
    }

    const filename = url.split("/").pop().split("?")[0];
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
    const downloadUrl = `${API_BASE_URL}/api/posts/download-proxy?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(filename)}`;

    try {
      const response = await fetch(downloadUrl, {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error("이미지 다운로드에 실패했습니다.");
      }

      const blob = await response.blob();
      downloadBlob(blob, filename);
    } catch (error) {
      console.error("이미지 다운로드 실패:", error);
      setReactionMessage("이미지 다운로드에 실패했습니다.");
    }
  };

  const handleFileDownloadClick = (event) => {
    if (!isLoggedIn()) {
      event.preventDefault();
      redirectToLogin(navigate);
    }
  };

  return (
    <>
      <Navbar />

      <main className="board-page">
        <div className="detail-container">
          {/* 상단 (목록으로, 수정/삭제 버튼) */}
          <div className="detail-top-area">
            {/* 자료실은 자료실, 커뮤니티는 커뮤니티로 돌아가게 */}
            <a href={getListPath(post.board_type, post.category)} className="back-link">
              &lt; 목록으로
            </a>

            <div className="detail-top-buttons">
              {canEditPost && (
                <button
                  type="button"
                  className="edit-btn"
                  onClick={() => navigate(`/posts/${post.id}/edit`)}
                >
                  게시글 수정
                </button>
              )}
              {canDeletePost && (
                <button
                  type="button"
                  className="delete-btn"
                  onClick={handleDelete}
                >
                  게시글 삭제
                </button>
              )}
            </div>
          </div>

          {/* 제목 및 정보 */}
          <section className="detail-header">
            <div className="title-line"></div>

            <div className="detail-title-area">
              <div className="board-category">
                {getCategoryText(post.category)}
              </div>

              <div className="detail-title-content">
                <h1 className="detail-title">
                  {post.sub_category && (
                    <>
                      <span className="board-category-tag">
                        [{post.sub_category}]
                      </span>{" "}
                    </>
                  )}
                  {post.title}
                </h1>
                <div className="detail-info">
                  <Link
                    className="post-author-info post-author-link"
                    to={`/mypage/${post.author_id}`}
                  >
                    <img
                      className="post-author-avatar"
                      src={getUserProfileImageUrl(post.users)}
                      alt=""
                    />
                    <span>{getUserDisplayName(post.users)}</span>
                  </Link>
                  <span>· 작성일{" "}
                    {isEdited(post.created_at, post.updated_at)
                      ? formatDate(post.updated_at)
                      : formatDate(post.created_at)}
                    {isEdited(post.created_at, post.updated_at) && " (수정됨)"}</span>
                  <span>· 조회수 {post.view_count ?? 0}</span>
                </div>
              </div>
            </div>
          </section>

          {/* 본문 */}
          <section
            className="detail-content"
            onClick={handleImageClick}
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(post.content, {
                ADD_ATTR: ["target", "rel"],
              }),
            }}
          />

          {post.post_files?.length > 0 && (
            <section className="detail-file-section">
              <h2 className="detail-file-title">첨부파일</h2>

              <div className="detail-file-list">
                {post.post_files.map((file) => (
                  <a
                    key={file.id}
                    className="detail-file-item"
                    href={file.download_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={handleFileDownloadClick}
                  >
                    <span className="detail-file-name">
                      <span style={{ fontSize: "16px" }}>🗎</span> {file.original_name}
                    </span>

                    <span className="detail-file-size">
                      {formatFileSize(file.size)}
                    </span>
                  </a>
                ))}
              </div>
            </section>
          )}

          {viewerImages.length > 0 && (
            <div className="img-viewer-overlay">
              <div className="img-viewer-actions">
                <button
                  type="button"
                  className="img-viewer-download-all"
                  aria-label="전체 이미지 다운로드"
                >
                  <i className="fa-solid fa-download"></i>
                  <span>전체 다운로드</span>
                </button>

                <button
                  type="button"
                  className="img-viewer-download"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleImageDownload(viewerImages[viewerIndex]);
                  }}
                  aria-label="현재 이미지 다운로드"
                >
                  <i className="fa-solid fa-download"></i>
                </button>

                <button
                  type="button"
                  className="img-viewer-close"
                  onClick={() => setViewerImages([])}
                  aria-label="이미지 뷰어 닫기"
                >
                  <i className="fa-solid fa-xmark"></i>
                </button>
              </div>

              {viewerImages.length > 1 && (
                <button
                  className="img-viewer-prev"
                  onClick={() =>
                    setViewerIndex(
                      viewerIndex === 0
                        ? viewerImages.length - 1
                        : viewerIndex - 1,
                    )
                  }
                >
                  <i className="fa-solid fa-angle-left"></i>
                </button>
              )}

              <img
                className="img-viewer-img"
                src={viewerImages[viewerIndex]}
                alt="원본 이미지"
              />

              {viewerImages.length > 1 && (
                <button
                  className="img-viewer-next"
                  onClick={() =>
                    setViewerIndex(
                      viewerIndex === viewerImages.length - 1
                        ? 0
                        : viewerIndex + 1,
                    )
                  }
                >
                  <i className="fa-solid fa-angle-right"></i>
                </button>
              )}

              <span className="img-viewer-count">
                {viewerIndex + 1} / {viewerImages.length}
              </span>
            </div>
          )}

          {/* 좋아요 / 싫어요 */}
          <section className="reaction-section">
            <button
              className={`reaction-btn ${like ? "active" : ""}`}
              onClick={handleLike}
            >
              👍 좋아요 {post._count?.post_likes ?? 0}
            </button>

            <button
              className={`reaction-btn ${dislike ? "active" : ""}`}
              onClick={handleDislike}
            >
              👎 싫어요 {post._count?.post_dislikes ?? 0}
            </button>
          </section>

          {reactionMessage && (
            <p className="reaction-message">{reactionMessage}</p>
          )}

          {/* 댓글 */}
          <div className="comment-wrapper">
            <h2 className="comment-title">
              💬 댓글 {post.comments?.length ?? 0}개
            </h2>

            <div className="comment-list">
              {post.comments?.length > 0 ? (
                getTopLevelComments().map((comment) => (
                  <div className="comment-thread" key={comment.id}>
                    {renderCommentCard(comment, false)}

                    {getReplies(comment.id).length > 0 && (
                      <div className="comment-replies">
                        {getReplies(comment.id).map((reply) =>
                          renderCommentCard(reply, true),
                        )}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="comment-text">아직 댓글이 없습니다.</p>
              )}
            </div>

            <p className="reaction-message">{commentMessage}</p>

            <div className="comment-input-section">
              <input
                type="text"
                className="comment-input"
                placeholder="댓글을 입력하세요..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
              />
              <button
                type="button"
                className="comment-submit-btn"
                onClick={handleCommentSubmit}
              >
                ➤
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default PostDetail;

import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createPost, getPostById, updatePost } from "../api/postAPI";
import JoditEditor from "jodit-react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/post-write.css";
import "../styles/board.css";

function PostWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const editor = useRef(null);
  // 에디터 기본 설정 (높이, 언어, 플레이스홀더 등)
  const config = useMemo(() => ({
    readonly: false,
    placeholder: "내용을 입력하세요.",
    height: 450,
    language: "ko", // 한국어 툴바 지원
    toolbarButtonSize: "middle",
    // 툴바에 너무 많은 버튼이 나오는 게 싫다면 아래 배열을 수정해서 뺄 수 있습니다.
    buttons: [
      "source", "|",
      "bold", "strikethrough", "underline", "italic", "|",
      "ul", "ol", "|",
      "outdent", "indent", "|",
      "font", "fontsize", "brush", "paragraph", "|",
      "image", "video", "table", "link", "|",
      "align", "undo", "redo", "|",
      "hr", "eraser", "fullsize"
    ]
  }), []);

  const { id } = useParams();
  const isEditMode = Boolean(id);

  // URL 경로를 보고 어느 게시판 글쓰기인지 체크
  function getBoardType(pathname) {
    if (pathname.startsWith("/resources")) return "ARCHIVE";
    if (pathname.startsWith("/gallery")) return "GALLERY";
    return "COMMUNITY";
  }

  const initialBoardType = getBoardType(location.pathname);

  const [formData, setFormData] = useState({
    board_type: initialBoardType,
    category: "",
    title: "",
    content: "",
  });

  const board_type = formData.board_type;

  function getListPath(board_type) {
    if (board_type === "ARCHIVE") return "/resources";
    if (board_type === "GALLERY") return "/gallery";
    return "/community";
  }

  const categoryOptions = {
    COMMUNITY: [
      { value: "notice", label: "공지사항" },
      { value: "free", label: "자유" },
      { value: "qna", label: "질문" },
      { value: "recruit", label: "팀원 모집" },
    ],
    ARCHIVE: [
      { value: "study", label: "스터디" },
      { value: "project", label: "과제/프로젝트" },
      { value: "contest", label: "대회/공모전" },
      { value: "class", label: "수업" },
    ],
    GALLERY: [
      { value: "event", label: "행사" },
    ],
  };

  // 로딩 표시
  const [loading, setLoading] = useState(false);

  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  }

  async function handleSubmit(e) {
    // form 제출 시 페이지 새로고침 방지
    e.preventDefault();

    setErrorMessage("");


    const postData = {
      ...formData,
      board_type,
    };

    if (!postData.title.trim()) {
      setErrorMessage("제목을 입력해주세요.");
      return;
    }

    if (!postData.content.trim() || postData.content === "<p><br></p>") {
      setErrorMessage("내용을 입력해주세요.");
      return;
    }

    if (!postData.category) {
      setErrorMessage("카테고리를 선택해주세요.");
      return;
    }

    try {
      setLoading(true);

      if (isEditMode) {
        const result = await updatePost(id, postData);

        console.log("글 수정 응답:", result);
        alert("게시글이 수정되었습니다.");

        navigate(`/posts/${id}`);
      } else {
        const result = await createPost(postData);

        console.log("글 작성 응답:", result);
        alert("게시글이 작성되었습니다.");

        // 게시글 작성 성공 후 해당 게시판 목록으로 이동
        navigate(getListPath(board_type));
      }
    } catch (error) {
      console.error(isEditMode ? "글 수정 실패:" : "글 작성 실패:", error);

      setErrorMessage(
        error.response?.data?.message ||
        error.message ||
        (isEditMode
          ? "게시글 수정에 실패했습니다."
          : "게시글 작성에 실패했습니다.")
      );
    } finally {
      setLoading(false);
    }
  }

  // 수정 모드일 때 기존 게시글 불러오기
  useEffect(() => {
    if (!isEditMode) return;

    async function fetchPostForEdit() {
      try {
        setLoading(true);
        setErrorMessage("");

        const result = await getPostById(id);
        const post = result.data;

        setFormData({
          board_type: post.board_type,
          category: post.category,
          title: post.title,
          content: post.content,
        });


      } catch (error) {
        console.error("수정할 게시글 조회 실패:", error);

        setErrorMessage(
          error.response?.data?.message ||
          error.message ||
          "수정할 게시글을 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPostForEdit();
  }, [id, isEditMode]);

  return (
    <>
      <Navbar />
      <main className="board-page">
        <div className="write-container">
          <div className="write-top-area">
            <form onSubmit={handleSubmit}>
              <div className="board-header">
                <h3 className="write-board-title">
                  {isEditMode ? "게시글 수정" : "게시글 작성"}
                </h3>

                <div className="board-button">
                  <button
                    className="cancel-write-btn btn btn-default"
                    type="button"
                    onClick={() => {
                      const isLeave = window.confirm(
                        "나가면 변경사항이 저장되지 않습니다. 나가시겠습니까?"
                      );

                      if (!isLeave) return;

                      if (isEditMode) {
                        navigate(`/posts/${id}`);
                      } else {
                        navigate(getListPath(board_type));
                      }
                    }}
                  >
                    {isEditMode ? "취소" : "목록으로"}
                  </button>

                  <button
                    className="post-write-btn btn btn-default"
                    type="submit"
                    disabled={loading}
                  >
                    {loading
                      ? isEditMode
                        ? "수정 중..."
                        : "등록 중..."
                      : isEditMode
                        ? "수정"
                        : "등록"}
                  </button>
                </div>
              </div>
              <hr className="header-divider" />

              {errorMessage && <p className="error-message">{errorMessage}</p>}

              <div className="form-group">
                <div className="title-box">
                  <select
                    className="category-select"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                  >
                    <option value="" disabled hidden>
                      게시판 선택
                    </option>

                    {categoryOptions[board_type].map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <input
                    className="title-input-box form-control"
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="제목을 입력해주세요."
                    required
                  />
                </div>

                <div className="content-box">
                  {/* Jodit 에디터가 들어가는 곳 (툴바 자동 생성!) */}
                  <JoditEditor
                    ref={editor}
                    value={formData.content}
                    config={config}
                    // 글자가 입력될 때마다 상태 업데이트
                    onBlur={(newContent) =>
                      setFormData((prev) => ({
                        ...prev,
                        content: newContent,
                      }))
                    }
                    onChange={() => { }}
                  />
                </div>
              </div>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default PostWrite;
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { createPost, getPostById, updatePost, uploadPostImage } from "../api/postAPI";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/post-write.css";

import $ from "jquery";
import "summernote/dist/summernote-lite.css";
import "summernote/dist/summernote-lite.js";

// 🔥 중요: summernote 로드 이후에 jQuery 연결
window.$ = window.jQuery = $;

function PostWrite() {
  const navigate = useNavigate();
  const location = useLocation();

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

    // Summernote 내용은 submit할 때 직접 가져와야 함
    const content = $("#summernote").summernote("code");

    const postData = {
      ...formData,
      board_type,
      content,
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

  // Summernote 초기화
  useEffect(() => {
    const el = $("#summernote");

    if (!el.length) return;

    // 🔥 이미 생성된 editor 있으면 제거 (중복 방지)
    if (el.next(".note-editor").length) {
      try {
        el.summernote("destroy");
      } catch (e) { }
    }

    // Summernote 초기화
    el.summernote({
      height: 320,
      minHeight: 300,
      maxHeight: 380,
      placeholder: "내용을 입력하세요.",
      toolbar: [
        ["style", ["style"]],
        ["fontsize", ["fontsize"]],
        ["font", ["bold", "underline", "clear"]],
        ["color", ["color"]],
        ["para", ["ul", "ol", "paragraph"]],
        ["insert", ["link", "picture"]],
        ["view", ["fullscreen"]],
      ],
      fontSizes: ["10", "14", "18", "24", "36", "48", "64"],

      callbacks: {
        onImageUpload: async function (files) {
          for (const file of files) {
            try {
              const result = await uploadPostImage(file);

              $("#summernote").summernote("insertImage", result.imageUrl);
            } catch (error) {
              console.error("이미지 업로드 실패:", error);
              alert("이미지 업로드에 실패했습니다.");
            }
          }
        },
      },
    });

    // cleanup
    return () => {
      try {
        if (el.next(".note-editor").length) {
          el.summernote("destroy");
        }
      } catch (e) { }
    };
  }, []);

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

        // Summernote가 만들어진 뒤 기존 내용 넣기
        setTimeout(() => {
          if ($("#summernote").next(".note-editor").length) {
            $("#summernote").summernote("code", post.content);
          }
        }, 0);
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

      <section className="post-write-box">
        <div className="write-container container">
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
                <textarea
                  id="summernote"
                  className="form-control post-content"
                  required
                />
              </div>
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default PostWrite;
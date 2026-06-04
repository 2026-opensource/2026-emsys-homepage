import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createPost, getPostById, updatePost,
  uploadPostImages, deleteUnusedPostImages, uploadPostFiles
} from "../api/postAPI";
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

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  // 글 작성/수정 여부에 따라 에디터 로딩 제어
  const [isDirty, setIsDirty] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(!isEditMode);

  const allowNavigationRef = useRef(false);

  const board_type = formData.board_type;

  const editorButtons = [
    "bold", "strikethrough", "underline", "italic", "|",
    "ul", "ol", "|",
    "font", "fontsize", "brush", "paragraph", "|",
    "uploadImages", "uploadFiles", "video", "table", "link", "|",
    "align", "undo", "redo", "|",
    "hr", "eraser"
  ];

  // 에디터 기본 설정 (높이, 언어, 플레이스홀더 등)
  const config = useMemo(() => ({
    readonly: false,
    placeholder: isEditMode ? "" : "내용을 입력하세요.",
    height: 450,
    language: "ko",
    toolbarButtonSize: "middle",

    // 반응형 툴바가 기본 버튼 섞는 것 방지
    toolbarAdaptive: false,

    // 이미지 클릭 시 리사이즈 테두리/핸들 방지
    allowResizeX: false,
    allowResizeY: false,

    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    defaultActionOnPaste: "insert_clear_html",

    disablePlugins: ["image-processor", "image-properties"],

    // 화면 크기에 상관없이 항상 같은 버튼 보이도록 설정
    buttons: editorButtons,
    buttonsMD: editorButtons,
    buttonsSM: editorButtons,
    buttonsXS: editorButtons,

    controls: {
      uploadImages: {
        icon: "image",
        tooltip: "사진 업로드",
        exec: async (jodit) => {
          const input = document.createElement("input");

          input.type = "file";
          input.accept = "image/png,image/jpeg,image/jpg,image/webp";
          input.multiple = true;

          input.onchange = async () => {
            const files = Array.from(input.files || []);

            const MAX_IMAGE_FILE_SIZE = 10 * 1024 * 1024; // 10MB

            if (files.length === 0) return;

            const oversizedFiles = files.filter(
              (file) => file.size > MAX_IMAGE_FILE_SIZE
            );

            if (oversizedFiles.length > 0) {
              const fileNames = oversizedFiles
                .map((file) => `- ${file.name}`)
                .join("\n");

              alert(
                `다음 이미지가 10MB를 초과했습니다.\n\n${fileNames}\n\n이미지 1장당 최대 10MB까지 업로드할 수 있습니다.`
              );

              return;
            }

            try {
              setUploadingImages(true);

              const chunks = chunkArray(files, 30);
              const uploadedResults = [];

              for (const chunk of chunks) {
                const result = await uploadPostImages(chunk);
                uploadedResults.push(...result.data);
              }

              setUploadedImages((prev) => [...prev, ...uploadedResults]);
              setIsDirty(true);

              const imageHtml = uploadedResults
                .map(
                  (image) => `
                    <p>
                      <img class="post-editor-image"
                        src="${image.thumbnailUrl}"
                        data-display="${image.displayUrl}"
                        alt="${image.originalName}"
                      />
                    </p>
                  `
                )
                .join("");

              jodit.s.insertHTML(imageHtml);

              setFormData((prev) => ({
                ...prev,
                content: jodit.value,
              }));
            } catch (error) {
              console.error("이미지 업로드 실패:", error);

              alert(
                error.response?.data?.message ||
                "이미지 업로드에 실패했습니다."
              );
            } finally {
              setUploadingImages(false);
            }
          };

          input.click();
        },
      },
      uploadImages: {
        icon: "image",
        tooltip: "사진 업로드",
        exec: async (jodit) => {
          // 기존 이미지 업로드 코드 그대로
        },
      },

      uploadFiles: {
        icon: "file",
        tooltip: "파일 업로드",
        exec: async (jodit) => {
          const input = document.createElement("input");

          input.type = "file";
          input.accept = ".pdf,.zip,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.hwp,.txt";
          input.multiple = true;

          input.onchange = async () => {
            const files = Array.from(input.files || []);

            if (files.length === 0) return;

            const MAX_FILE_SIZE = 30 * 1024 * 1024; // 파일 1개당 30MB

            const oversizedFiles = files.filter(
              (file) => file.size > MAX_FILE_SIZE
            );

            if (oversizedFiles.length > 0) {
              const fileNames = oversizedFiles
                .map((file) => `- ${file.name}`)
                .join("\n");

              alert(
                `다음 파일이 30MB를 초과했습니다.\n\n${fileNames}\n\n파일 1개당 최대 30MB까지 업로드할 수 있습니다.`
              );

              return;
            }

            try {
              const result = await uploadPostFiles(files);

              setIsDirty(true);

              const fileHtml = result.data
                .map(
                  (file) => `
                <p>
                  <a class="post-editor-file"
                    href="${import.meta.env.VITE_API_BASE_URL}${file.downloadUrl}"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    📄 ${file.originalName}
                  </a>
                </p>
              `
                )
                .join("");

              jodit.s.insertHTML(fileHtml);

              setFormData((prev) => ({
                ...prev,
                content: jodit.value,
              }));
            } catch (error) {
              console.error("파일 업로드 실패:", error);

              alert(
                error.response?.data?.message ||
                "파일 업로드에 실패했습니다."
              );
            }
          };

          input.click();
        },
      },
    },
  }), [isEditMode]);

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
      { value: "activity", label: "행사" },
    ],
  };

  // 로딩 표시
  const [loading, setLoading] = useState(false);

  // 에러 메시지
  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;

    setIsDirty(true);

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  function chunkArray(array, size) {
    const chunks = [];

    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }

    return chunks;
  }

  function getUnusedImages(content, uploadedImages) {
    return uploadedImages.filter((image) => {
      return (
        !content.includes(image.thumbnailUrl) &&
        !content.includes(image.displayUrl)
      );
    });
  }

  async function cleanupTemporaryUploadedImages() {
    if (uploadedImages.length === 0) return;

    try {
      await deleteUnusedPostImages(uploadedImages);
      setUploadedImages([]);
    } catch (error) {
      console.error("임시 업로드 이미지 삭제 실패:", error);
    }
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

        const unusedImages = getUnusedImages(postData.content, uploadedImages);

        if (unusedImages.length > 0) {
          await deleteUnusedPostImages(unusedImages);
        }

        console.log("글 수정 응답:", result);
        alert("게시글이 수정되었습니다.");

        allowNavigationRef.current = true;
        setIsDirty(false);

        navigate(`/posts/${id}`, { replace: true });
      } else {
        const result = await createPost(postData);

        const unusedImages = getUnusedImages(postData.content, uploadedImages);

        if (unusedImages.length > 0) {
          await deleteUnusedPostImages(unusedImages);
        }

        console.log("글 작성 응답:", result);
        alert("게시글이 작성되었습니다.");

        allowNavigationRef.current = true;
        setIsDirty(false);

        navigate(getListPath(board_type));
      }
    } catch (error) {
      console.error(isEditMode ? "글 수정 실패:" : "글 작성 실패:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        (isEditMode
          ? "게시글 수정에 실패했습니다."
          : "게시글 작성에 실패했습니다.");

      setErrorMessage(message);
      alert(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (isDirty) {
      const isLeave = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?"
      );

      if (!isLeave) return;
    }

    allowNavigationRef.current = true;

    await cleanupTemporaryUploadedImages();

    if (isEditMode) {
      navigate(`/posts/${id}`, { replace: true });
    } else {
      navigate(getListPath(board_type));
    }
  }

  // 수정 모드일 때 기존 게시글 불러오기
  useEffect(() => {
    if (!isEditMode) {
      setIsEditorReady(true);
      return;
    }

    async function fetchPostForEdit() {
      try {
        setLoading(true);
        setIsEditorReady(false);
        setErrorMessage("");

        const result = await getPostById(id);
        const post = result.data;

        setFormData({
          board_type: post.board_type,
          category: post.category,
          title: post.title,
          content: post.content || "",
        });

        setIsDirty(false);
        setIsEditorReady(true);
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

  // 새로고침 / 탭 닫기 / 주소 직접 변경 방지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty || allowNavigationRef.current) return;

      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // Navbar / Link / a 태그 내부 이동 방지
  useEffect(() => {
    const handleLinkClick = async (e) => {
      if (!isDirty || allowNavigationRef.current) return;

      const link = e.target.closest("a");

      if (!link) return;

      const href = link.getAttribute("href");

      if (!href) return;
      if (href.startsWith("#")) return;
      if (link.target === "_blank") return;
      if (link.hasAttribute("download")) return;

      const url = new URL(href, window.location.origin);

      // 외부 사이트는 브라우저 기본 동작 + beforeunload에 맡김
      if (url.origin !== window.location.origin) return;

      const nextPath = `${url.pathname}${url.search}${url.hash}`;
      const currentPath = `${location.pathname}${location.search}${location.hash}`;

      if (nextPath === currentPath) return;

      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation?.();

      const isLeave = window.confirm(
        "저장하지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?"
      );

      if (!isLeave) return;

      allowNavigationRef.current = true;
      await cleanupTemporaryUploadedImages();
      navigate(nextPath);
    };

    document.addEventListener("click", handleLinkClick, true);

    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [isDirty, navigate, location.pathname, location.search, location.hash, uploadedImages]);

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
                    onClick={handleCancel}
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
              {uploadingImages && (
                <p className="board-message">
                  이미지 업로드 중입니다. 사진이 많으면 시간이 걸릴 수 있습니다.
                </p>
              )}

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
                  {isEditorReady && (
                    <JoditEditor
                      key={isEditMode ? `edit-${id}` : "create"}
                      ref={editor}
                      value={formData.content || ""}
                      config={config}
                      // 글자가 입력될 때마다 상태 업데이트
                      onChange={(newContent) => {
                        setFormData((prev) => {
                          if (prev.content === newContent) {
                            return prev;
                          }

                          setIsDirty(true);

                          return {
                            ...prev,
                            content: newContent,
                          };
                        });
                      }}
                    />
                  )}
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
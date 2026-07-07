import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createPost,
  getPostById,
  updatePost,
  uploadPostImages,
  deleteUnusedPostImages,
  uploadPostFiles,
  deleteUnusedPostFiles,
} from "../api/postAPI";
import JoditEditor from "jodit-react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import { isAuthError, redirectToLogin, requireLogin } from "../utils/token";

import "../layout/common.css";
import "../styles/post-write.css";
import "../styles/board.css";

function PostWrite() {
  const navigate = useNavigate();
  const location = useLocation();
  const editor = useRef(null);

  // 에디터 내용
  const contentRef = useRef("");

  const { id } = useParams();
  const isEditMode = Boolean(id);

  // 게시판 종류 확인
  function getBoardType(pathname) {
    if (pathname.startsWith("/resources")) return "ARCHIVE";
    if (pathname.startsWith("/gallery")) return "GALLERY";
    return "COMMUNITY";
  }

  const initialBoardType = getBoardType(location.pathname);

  // 글 작성하는게 계속 업데이트 되면 안되므로 content는 따로 관리하는 것
  const [formData, setFormData] = useState({
    board_type: initialBoardType,
    category: "",
    title: "",
  });

  // 서버에서 받아온 최초 데이터
  const [initialContent, setInitialContent] = useState("");

  const [uploadedImages, setUploadedImages] = useState([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [tempFiles, settempFiles] = useState([]);

  const [isDirty, setIsDirty] = useState(false);
  const [isEditorReady, setIsEditorReady] = useState(!isEditMode);

  const canNavigateRef = useRef(false);
  const board_type = formData.board_type;
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (!requireLogin(navigate)) return;
    setAuthChecked(true);
  }, [navigate]);

  const editorButtons = [
    "bold",
    "strikethrough",
    "underline",
    "italic",
    "|",
    "ul",
    "ol",
    "|",
    "font",
    "fontsize",
    "brush",
    "paragraph",
    "|",
    "uploadImages",
    "uploadFiles",
    "video",
    "table",
    "link",
    "|",
    "align",
    "undo",
    "redo",
    "|",
    "hr",
    "eraser",
  ];

  // 에디터 설정
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: isEditMode ? "" : "내용을 입력하세요.",
      height: 450,
      language: "ko",
      toolbarButtonSize: "middle",

      toolbarAdaptive: false,

      allowResizeX: false,
      allowResizeY: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
      disablePlugins: ["image-processor", "image-properties", "add-new-line"],

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
                (file) => file.size > MAX_IMAGE_FILE_SIZE,
              );

              if (oversizedFiles.length > 0) {
                const fileNames = oversizedFiles
                  .map((file) => `- ${file.name}`)
                  .join("\n");

                alert(
                  `다음 이미지가 10MB를 초과했습니다.\n\n${fileNames}\n\n이미지 1장당 최대 10MB까지 업로드할 수 있습니다.`,
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

                uploadedResults.forEach((image) => {
                  // 1. 에디터 내부의 문서 객체를 사용해 직접 img 엘리먼트 생성
                  const imgNode = jodit.createInside.element("img");

                  // 2. 속성 부여
                  imgNode.className = "post-editor-image";
                  imgNode.src = image.thumbnailUrl;
                  imgNode.setAttribute("data-display", image.displayUrl);
                  imgNode.alt = image.originalName;

                  // 3. 문자열이 아닌 DOM 노드 자체를 에디터에 삽입
                  const figure = jodit.createInside.element("figure");
                  figure.appendChild(imgNode);

                  jodit.s.insertNode(figure);
                });

                // 본문 상태 업데이트
                contentRef.current = jodit.value;
              } catch (error) {
                console.error("이미지 업로드 실패:", error);

                if (isAuthError(error)) {
                  redirectToLogin(navigate);
                  return;
                }

                alert(
                  error.response?.data?.message ||
                    "이미지 업로드에 실패했습니다.",
                );
              } finally {
                setUploadingImages(false);
              }
            };

            input.click();
          },
        },
        uploadFiles: {
          icon: "file",
          tooltip: "파일 업로드",
          exec: async (jodit) => {
            const input = document.createElement("input");

            input.type = "file";
            input.accept =
              ".pdf,.zip,.ppt,.pptx,.doc,.docx,.xls,.xlsx,.hwp,.txt";
            input.multiple = true;

            input.onchange = async () => {
              const files = Array.from(input.files || []);

              if (files.length === 0) return;

              const MAX_FILE_SIZE = 30 * 1024 * 1024; // 파일 1개당 30MB

              const oversizedFiles = files.filter(
                (file) => file.size > MAX_FILE_SIZE,
              );

              if (oversizedFiles.length > 0) {
                const fileNames = oversizedFiles
                  .map((file) => `- ${file.name}`)
                  .join("\n");

                alert(
                  `다음 파일이 30MB를 초과했습니다.\n\n${fileNames}\n\n파일 1개당 최대 30MB까지 업로드할 수 있습니다.`,
                );

                return;
              }

              try {
                const result = await uploadPostFiles(files);

                setIsDirty(true);

                const uploaded = result.data;

                setUploadedFiles((prev) => [...prev, ...uploaded]);
                settempFiles((prev) => [...prev, ...uploaded]);
                setIsDirty(true);
              } catch (error) {
                console.error("파일 업로드 실패:", error);

                if (isAuthError(error)) {
                  redirectToLogin(navigate);
                  return;
                }

                alert(
                  error.response?.data?.message ||
                    "파일 업로드에 실패했습니다.",
                );
              }
            };

            input.click();
          },
        },
      },
    }),
    [isEditMode, navigate],
  );

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
    GALLERY: [{ value: "activity", label: "행사" }],
  };

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setIsDirty(true);
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  function handleRemoveFile(targetFile) {
    setUploadedFiles((prev) =>
      prev.filter((file) => file.fileUrl !== targetFile.fileUrl),
    );

    setIsDirty(true);
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

  function getUnusedFiles(finalFiles, temporaryFiles) {
    return temporaryFiles.filter((tempFile) => {
      return !finalFiles.some(
        (finalFile) => finalFile.fileUrl === tempFile.fileUrl,
      );
    });
  }

  async function cleanupTempImages() {
    if (uploadedImages.length === 0) return;
    try {
      await deleteUnusedPostImages(uploadedImages);
      setUploadedImages([]);
    } catch (error) {
      console.error("임시 업로드 이미지 삭제 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate);
      }
    }
  }

  async function cleanupTempFiles() {
    if (tempFiles.length === 0) return;

    try {
      await deleteUnusedPostFiles(tempFiles);
      settempFiles([]);
    } catch (error) {
      console.error("임시 업로드 파일 삭제 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requireLogin(navigate)) return;

    setErrorMessage("");

    const postData = {
      ...formData,
      content: contentRef.current, // Ref에서 최신 본문을 가져오므로 안전합니다.
      board_type,
      files: uploadedFiles,
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
        const unusedFiles = getUnusedFiles(uploadedFiles, tempFiles);

        if (unusedFiles.length > 0) {
          await deleteUnusedPostFiles(unusedFiles);
        }

        settempFiles([]);

        console.log("글 수정 응답:", result);
        alert("게시글이 수정되었습니다.");
        canNavigateRef.current = true;
        setIsDirty(false);
        navigate(`/posts/${id}`, { replace: true });
      } else {
        const result = await createPost(postData);
        const unusedImages = getUnusedImages(postData.content, uploadedImages);
        if (unusedImages.length > 0) {
          await deleteUnusedPostImages(unusedImages);
        }
        const unusedFiles = getUnusedFiles(uploadedFiles, tempFiles);

        if (unusedFiles.length > 0) {
          await deleteUnusedPostFiles(unusedFiles);
        }

        settempFiles([]);

        console.log("글 작성 응답:", result);
        alert("게시글이 작성되었습니다.");
        canNavigateRef.current = true;
        setIsDirty(false);
        navigate(getListPath(board_type));
      }
    } catch (error) {
      console.error(isEditMode ? "글 수정 실패:" : "글 작성 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate);
        return;
      }

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
        "저장하지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?",
      );
      if (!isLeave) return;
    }
    canNavigateRef.current = true;
    await cleanupTempImages();
    await cleanupTempFiles();

    if (isEditMode) {
      navigate(`/posts/${id}`, { replace: true });
    } else {
      navigate(getListPath(board_type));
    }
  }

  // 게시글 조회
  useEffect(() => {
    if (!requireLogin(navigate)) return;

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

        setUploadedFiles(
          (post.post_files || []).map((file) => ({
            originalName: file.original_name,
            fileName: file.file_name,
            fileUrl: file.file_url,
            downloadUrl: file.download_url,
            size: file.size,
          })),
        );

        settempFiles([]);

        setFormData({
          board_type: post.board_type,
          category: post.category,
          title: post.title,
        });
        setInitialContent(post.content || "");
        contentRef.current = post.content || "";

        setIsDirty(false);
        setIsEditorReady(true);
      } catch (error) {
        console.error("수정할 게시글 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate);
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
            error.message ||
            "수정할 게시글을 불러오지 못했습니다.",
        );
      } finally {
        setLoading(false);
      }
    }

    fetchPostForEdit();
  }, [id, isEditMode, navigate]);

  // 페이지 이탈 방지
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!isDirty || canNavigateRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  // 링크 이동 처리
  useEffect(() => {
    const handleLinkClick = async (e) => {
      if (!isDirty || canNavigateRef.current) return;
      const link = e.target.closest("a");
      if (!link) return;

      const href = link.getAttribute("href");
      if (
        !href ||
        href.startsWith("#") ||
        link.target === "_blank" ||
        link.hasAttribute("download")
      )
        return;

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
        "저장하지 않은 변경사항이 있습니다. 페이지를 나가시겠습니까?",
      );
      if (!isLeave) return;

      canNavigateRef.current = true;
      await cleanupTempImages();
      await cleanupTempFiles();
      navigate(nextPath);
    };

    document.addEventListener("click", handleLinkClick, true);
    return () => {
      document.removeEventListener("click", handleLinkClick, true);
    };
  }, [
    isDirty,

    navigate,

    location.pathname,

    location.search,

    location.hash,

    uploadedImages,
    tempFiles,
  ]);

  const memoizedEditor = useMemo(() => {
    return (
      <JoditEditor
        key={isEditMode ? `edit-${id}` : "create"}
        ref={editor}
        value={initialContent} // 최초 1회 혹은 서버 로드 시에만 이 값이 들어갈 것
        config={config}
        onChange={(newContent) => {
          contentRef.current = newContent;
          if (!isDirty) setIsDirty(true);
        }}
      />
    );
  }, [initialContent, config, isEditMode, id]);

  if (!authChecked) {
    return null;
  }

  return (
    <>
      <Navbar />
      <main className="board-page">
        <div className="write-container">
          <form onSubmit={handleSubmit}>
            <div className="write-top-area">
              <h3 className="write-board-title">
                {isEditMode ? "게시글 수정" : "게시글 작성"}
              </h3>

              <div className="write-button-area">
                {errorMessage && (
                  <p className="error-message">{errorMessage}</p>
                )}
                {uploadingImages && (
                  <p className="board-message">
                    이미지 업로드 중입니다. 사진이 많으면 시간이 걸릴 수
                    있습니다.
                  </p>
                )}
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
                {isEditorReady && (
                  <>
                    {memoizedEditor}

                    {uploadedFiles.length > 0 && (
                      <div className="attached-file-list">
                        <p className="attached-file-title">첨부파일</p>

                        {uploadedFiles.map((file) => (
                          <div
                            className="attached-file-item"
                            key={file.fileUrl}
                          >
                            <a
                              className="attached-file-name"
                              href={`${import.meta.env.VITE_API_BASE_URL}${file.downloadUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              📄 {file.originalName}
                            </a>

                            <button
                              type="button"
                              className="attached-file-remove"
                              onClick={() => handleRemoveFile(file)}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default PostWrite;

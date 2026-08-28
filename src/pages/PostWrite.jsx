import React, { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
  createPost,
  getPostById,
  updatePost,
  deletePost,
  uploadPostImages,
  deleteUnusedPostImages,
  uploadPostFiles,
  deleteUnusedPostFiles,
  getMyDrafts,
} from "../api/postAPI";
import JoditEditor from "jodit-react";
import { Jodit } from "jodit";

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
    if (pathname.startsWith("/notice")) return "COMMUNITY";
    if (pathname.startsWith("/resources")) return "ARCHIVE";
    if (pathname.startsWith("/gallery")) return "GALLERY";
    if (pathname.startsWith("/maintenance")) return "MAINTENANCE";
    return "COMMUNITY";
  }

  const initialBoardType = getBoardType(location.pathname);
  const isNoticeWritePage = location.pathname.startsWith("/notice");

  // 글 작성하는게 계속 업데이트 되면 안되므로 content는 따로 관리하는 것
  const [formData, setFormData] = useState({
    board_type: initialBoardType,
    category: isNoticeWritePage ? "notice" : "",
    sub_category: isNoticeWritePage ? "공지" : "",
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

  // 임시저장 관련 상태
  const MAX_DRAFT_COUNT = 10;
  const [draftPostId, setDraftPostId] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [showDraftList, setShowDraftList] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [totalDraftCount, setTotalDraftCount] = useState(null);
  const [loadingDrafts, setLoadingDrafts] = useState(false);

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

  const mobileButtons = [
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
    "dots",
  ];

  const smallButtons = [
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
    "dots",
  ];

  const mobileSmallButtons = [
    "bold",
    "strikethrough",
    "underline",
    "italic",
    "|",
    "ul",
    "dots",
  ];

  // 에디터 설정
  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: isEditMode ? "" : "내용을 입력하세요.",
      height: 450,
      language: "ko",
      toolbarButtonSize: "middle",

      toolbarAdaptive: true,
      sizeLG: 890,
      sizeMD: 532,
      sizeSM: 420,
      sizeXS: 200,

      toolbarInline: false,
      toolbarInlineForSelection: false,

      link: {
        openInNewTabCheckbox: true,
        openInNewTabCheckboxDefaultChecked: false,
      },
      popup: {
        a: [],
        table: [],
        tr: [],
        td: [],
        th: [],
        cells: [],
      },

      allowResizeX: false,
      allowResizeY: false,
      askBeforePasteHTML: false,
      askBeforePasteFromWord: false,
      defaultActionOnPaste: "insert_clear_html",
      disablePlugins: ["image-processor", "image-properties", "add-new-line"],

      // 화면 크기에 상관없이 항상 같은 버튼 보이도록 설정
      buttons: editorButtons,
      buttonsMD: mobileButtons,
      buttonsSM: smallButtons,
      buttonsXS: mobileSmallButtons,

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

                const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

                uploadedResults.forEach((image) => {
                  const imgNode = jodit.createInside.element("img");

                  imgNode.className = "post-editor-image";
                  imgNode.src = image.thumbnailUrl;
                  imgNode.setAttribute("data-display", image.displayUrl);
                  imgNode.alt = image.originalName;

                  const figure = jodit.createInside.element("figure");
                  figure.appendChild(imgNode);

                  jodit.s.insertNode(figure);
                });

                // 본문 상태 업데이트
                contentRef.current = jodit.value;
              } catch (error) {
                console.error("이미지 업로드 실패:", error);

                if (isAuthError(error)) {
                  redirectToLogin(navigate, error);
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
                  redirectToLogin(navigate, error);
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

  function getListPath(board_type, category) {
    if (board_type === "COMMUNITY" && category === "notice") return "/notice";
    if (board_type === "ARCHIVE") return "/resources";
    if (board_type === "GALLERY") return "/gallery";
    if (board_type === "MAINTENANCE") return "/maintenance";
    return "/community";
  }

  const categoryOptions = {
    COMMUNITY: [
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
    MAINTENANCE: [{ value: "maintenance", label: "점검안내" }],
  };

  // 카테고리별 세부 말머리 목록 (없는 카테고리는 세부 선택 없이 큰 카테고리명이 그대로 말머리가 됨)
  const subCategoryOptions = {
    free: ["소모임", "게임", "기타"],
    recruit: ["공모전", "스터디", "소모임"],
    notice: ["공지"],
    study: ["초급반", "중급반", "심화반"],
    class: [
      "전필-수업자료/과제",
      "전필-족보",
      "전선-수업자료/과제",
      "전선-족보",
      "교양-수업자료/과제",
      "교양-족보",
    ],
    maintenance: ["점검일시", "점검내용"],
  };

  const currentSubCategoryOptions = subCategoryOptions[formData.category] || null;
  const isNoticeContext =
    isNoticeWritePage ||
    (formData.board_type === "COMMUNITY" && formData.category === "notice");
  const currentCategoryOptions = isNoticeContext
    ? [{ value: "notice", label: "공지사항" }]
    : categoryOptions[board_type];

  const [loading, setLoading] = useState(false);

  const [errorMessage, setErrorMessage] = useState("");

  function handleChange(e) {
    const { name, value } = e.target;
    setIsDirty(true);

    if (name === "category") {
      // 카테고리가 바뀌면 세부 말머리 선택도 초기화
      setFormData((prev) => ({ ...prev, category: value, sub_category: "" }));
      return;
    }

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
        redirectToLogin(navigate, error);
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
        redirectToLogin(navigate, error);
      }
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!requireLogin(navigate)) return;

    setErrorMessage("");

    const latestContent = editor.current?.value ?? contentRef.current;
    contentRef.current = latestContent;

    const postData = {
      ...formData,
      content: latestContent,
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

    if (subCategoryOptions[postData.category] && !postData.sub_category) {
      setErrorMessage("세부 말머리를 선택해주세요.");
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
        // 임시글로 저장해뒀던 게 있으면 새로 만들지 않고 그 글을 정식 게시글로 전환
        const result = draftPostId
          ? await updatePost(draftPostId, { ...postData, is_draft: false })
          : await createPost(postData);
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
        setDraftPostId(null);
        navigate(getListPath(board_type, postData.category));
      }
    } catch (error) {
      console.error(isEditMode ? "글 수정 실패:" : "글 작성 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
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
      navigate(getListPath(board_type, formData.category));
    }
  }

  // 임시저장
  async function handleSaveDraft() {
    if (!requireLogin(navigate)) return;

    const latestContent = editor.current?.value ?? contentRef.current;
    contentRef.current = latestContent;

    const draftData = {
      ...formData,
      content: latestContent,
      board_type,
      files: uploadedFiles,
      is_draft: true,
    };

    try {
      setSavingDraft(true);

      if (draftPostId) {
        await updatePost(draftPostId, draftData);
      } else {
        const result = await createPost(draftData);
        setDraftPostId(result.data.id);
        setTotalDraftCount((prev) => (prev === null ? prev : prev + 1));
      }

      setIsDirty(false);
      alert("임시저장되었습니다.");
    } catch (error) {
      console.error("임시저장 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(error.response?.data?.message || "임시저장에 실패했습니다.");
    } finally {
      setSavingDraft(false);
    }
  }

  // 임시글 목록 펼치기/불러오기
  async function handleToggleDraftList() {
    if (!requireLogin(navigate)) return;

    if (showDraftList) {
      setShowDraftList(false);
      return;
    }

    try {
      setLoadingDrafts(true);
      const result = await getMyDrafts();
      const allDrafts = result.data || [];
      setTotalDraftCount(allDrafts.length);
      setDrafts(
        allDrafts.filter((draft) => {
          if (draft.board_type !== board_type) return false;
          if (board_type !== "COMMUNITY") return true;

          return isNoticeWritePage
            ? draft.category === "notice"
            : draft.category !== "notice";
        }),
      );
      setShowDraftList(true);
    } catch (error) {
      console.error("임시글 목록 조회 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(error.response?.data?.message || "임시글 목록을 불러오지 못했습니다.");
    } finally {
      setLoadingDrafts(false);
    }
  }

  // 임시글 불러오기
  async function handleLoadDraft(draftId) {
    try {
      setIsEditorReady(false);
      setLoading(true);

      const result = await getPostById(draftId);
      const draft = result.data;

      setDraftPostId(draft.id);
      setUploadedFiles(
        (draft.post_files || []).map((file) => ({
          originalName: file.original_name,
          fileName: file.file_name,
          fileUrl: file.file_url,
          downloadUrl: file.download_url,
          size: file.size,
        })),
      );
      settempFiles([]);

      setFormData({
        board_type: draft.board_type,
        category: draft.category || "",
        sub_category: draft.sub_category || "",
        title: draft.title || "",
      });
      setInitialContent(draft.content || "");
      contentRef.current = draft.content || "";

      setIsDirty(false);
      setShowDraftList(false);
    } catch (error) {
      console.error("임시글 불러오기 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(error.response?.data?.message || "임시글을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
      setIsEditorReady(true);
    }
  }

  // 임시글 삭제
  async function handleDeleteDraft(draftId, event) {
    event.stopPropagation();

    const isDelete = window.confirm("이 임시글을 삭제하시겠습니까?");
    if (!isDelete) return;

    try {
      await deletePost(draftId);
      setDrafts((prev) => prev.filter((draft) => draft.id !== draftId));
      setTotalDraftCount((prev) => (prev === null ? prev : Math.max(0, prev - 1)));

      if (draftPostId === draftId) {
        setDraftPostId(null);
      }
    } catch (error) {
      console.error("임시글 삭제 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(error.response?.data?.message || "임시글 삭제에 실패했습니다.");
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
          sub_category: post.sub_category || "",
          title: post.title,
        });
        setInitialContent(post.content || "");
        contentRef.current = post.content || "";

        setIsDirty(false);
        setIsEditorReady(true);
      } catch (error) {
        console.error("수정할 게시글 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
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
        key={isEditMode ? `edit-${id}` : draftPostId ? `draft-${draftPostId}` : "create"}
        ref={editor}
        value={initialContent}
        config={config}
        onBlur={(newContent) => {
          contentRef.current = newContent;
        }}
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
      <main className="board-page post-write-page">
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
                {!isEditMode && (
                  <button
                    className="draft-list-btn btn btn-default"
                    type="button"
                    onClick={handleToggleDraftList}
                    disabled={loadingDrafts}
                  >
                    임시글 목록
                    {totalDraftCount !== null && (
                      <span className="draft-count-badge">
                        {" "}
                        {totalDraftCount}/{MAX_DRAFT_COUNT}
                      </span>
                    )}
                  </button>
                )}
                {!isEditMode && (
                  <button
                    className="draft-save-btn btn btn-default"
                    type="button"
                    onClick={handleSaveDraft}
                    disabled={
                      savingDraft ||
                      (!draftPostId &&
                        totalDraftCount !== null &&
                        totalDraftCount >= MAX_DRAFT_COUNT)
                    }
                  >
                    {savingDraft ? "저장 중..." : "임시저장"}
                  </button>
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

            {showDraftList && (
              <div className="draft-list-panel">
                {loadingDrafts ? (
                  <p className="board-message">임시글을 불러오는 중...</p>
                ) : drafts.length === 0 ? (
                  <p className="board-message">저장된 임시글이 없습니다.</p>
                ) : (
                  drafts.map((draft) => (
                    <div
                      className="draft-list-item"
                      key={draft.id}
                      onClick={() => handleLoadDraft(draft.id)}
                    >
                      <span className="draft-list-item-title">
                        {draft.title?.trim() ? draft.title : "(제목 없음)"}
                      </span>
                      <span className="draft-list-item-date">
                        {draft.updated_at?.slice(0, 10)}
                      </span>
                      <button
                        type="button"
                        className="draft-list-item-delete"
                        onClick={(e) => handleDeleteDraft(draft.id, e)}
                      >
                        삭제
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}

            <div className="form-group">
              <div className="title-box">
                <select
                  className="category-select"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                  disabled={isNoticeContext}
                >
                  <option value="" disabled hidden>
                    게시판 선택
                  </option>
                  {currentCategoryOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>

                <select
                  className="category-select sub-category-select"
                  name="sub_category"
                  value={currentSubCategoryOptions ? formData.sub_category : ""}
                  onChange={handleChange}
                  required={Boolean(currentSubCategoryOptions)}
                  disabled={!currentSubCategoryOptions}
                >
                  {currentSubCategoryOptions ? (
                    <>
                      <option value="" disabled hidden>
                        세부 말머리
                      </option>
                      {currentSubCategoryOptions.map((label) => (
                        <option key={label} value={label}>
                          {label}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value="">말머리 없음</option>
                  )}
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
                              href={file.downloadUrl}
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

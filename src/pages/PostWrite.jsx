import React, { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/post-write.css";
import "../styles/board.css";

function PostWrite() {
  const editor = useRef(null);
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

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

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!category) return alert("게시판을 선택해주세요.");
    if (!title.trim()) return alert("제목을 입력해주세요.");
    if (!content || content === "<p><br></p>") return alert("내용을 입력해주세요.");

    const postData = { category, title, content };
    console.log("🚀 서버로 전송될 데이터:", postData);
  };

  return (
    <>
      <Navbar />

      <main className="board-page">
        <div className="write-container">
          <div className="write-top-area">
            <h3 className="write-board-title">게시글 작성</h3>

            <div className="write-buttons-area">
              <button className="cancel-write-btn btn btn-default" type="button">
                목록으로
              </button>

              <button className="post-write-btn btn btn-default" type="button" onClick={handleSubmit}>
                등록
              </button>
            </div>
          </div>

          <div className="form-group">
            <form className="write-form" onSubmit={handleSubmit}>
              <div className="title-box">
                <select 
                  className="category-select" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  required
                >
                  <option value="" disabled>게시판 선택</option>
                  <option value="general">전체 글</option>
                  <option value="free">자유게시판</option>
                  <option value="notice">공지사항</option>
                  <option value="contest">대회/공모전</option>
                </select>

                <input
                  className="title-input-box form-control"
                  type="text"
                  placeholder="제목을 입력해주세요."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="content-box">
                {/* Jodit 에디터가 들어가는 곳 (툴바 자동 생성!) */}
                <JoditEditor
                  ref={editor}
                  value={content}
                  config={config}
                  // 글자가 입력될 때마다 상태 업데이트
                  onBlur={(newContent) => setContent(newContent)}
                  onChange={(newContent) => {}}
                />
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
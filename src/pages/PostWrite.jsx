import React, { useEffect } from "react";

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
  useEffect(() => {
    const el = $("#summernote");

    if (!el.length) return;

    // 🔥 이미 생성된 editor 있으면 제거 (중복 방지)
    if (el.next(".note-editor").length) {
      try {
        el.summernote("destroy");
      } catch (e) {}
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
    });

    // cleanup
    return () => {
      try {
        if (el.next(".note-editor").length) {
          el.summernote("destroy");
        }
      } catch (e) {}
    };
  }, []);

  return (
    <>
      <Navbar />

      <section className="post-write-box">
        <div className="write-container container">
          <div className="board-header">
            <h3 className="write-board-title">게시글 작성</h3>

            <div className="board-button">
              <button
                className="cancel-write-btn btn btn-default"
                type="button"
              >
                목록으로
              </button>

              <button className="post-write-btn btn btn-default" type="button">
                등록
              </button>
            </div>
          </div>

          <hr className="header-divider" />

          <div className="form-group">
            <form className="title-box">
              <select className="category-select" required>
                <option value="" disabled hidden>
                  게시판 선택
                </option>
                <option value="general">전체 글</option>
                <option value="free">자유게시판</option>
                <option value="notice">공지사항</option>
                <option value="contest">대회/공모전</option>
              </select>

              <input
                className="title-input-box form-control"
                type="text"
                placeholder="제목을 입력해주세요."
                required
              />
            </form>

            <form className="content-box">
              <textarea
                id="summernote"
                className="form-control post-content"
                required
              />
            </form>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

export default PostWrite;

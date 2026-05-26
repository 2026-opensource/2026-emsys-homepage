// Gallery.jsx
import React from "react";
import { Link } from "react-router-dom";

import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";

import "../layout/common.css";
import "../styles/gallery.css";

import logoGreen from "../assets/images/logo-green.png";

function Gallery() {
  const posts = [
    {
      id: 1,
      date: "2026-XX-XX",
      title: "아무튼 긴 글 아주 긴 글보다 더 긴 글 어디까지 가는 거에요?",
      image: logoGreen,
    },
    {
      id: 2,
      date: "2026-XX-XX",
      title: "아무튼 긴 글 아주 긴 글보다 더 긴 글 어디까지 가는 거에요?",
      image: logoGreen,
    },
    {
      id: 3,
      date: "2026-XX-XX",
      title: "아무튼 긴 글 아주 긴 글보다 더 긴 글 어디까지 가는 거에요?",
      image: logoGreen,
    },
    {
      id: 4,
      date: "2026-XX-XX",
      title: "아무튼 긴 글 아주 긴 글보다 더 긴 글 어디까지 가는 거에요?",
      image: logoGreen,
    },
    {
      id: 5,
      date: "2026-XX-XX",
      title: "아무튼 긴 글 아주 긴 글보다 더 긴 글 어디까지 가는 거에요?",
      image: logoGreen,
    },
  ];

  return (
    <>
      <Navbar />
      <div className="gallery-container">
        <h1 className="gallery-title">갤러리</h1>

        <hr className="header-divider" />

        <div className="gallery-box">
          <section className="gallery-button">
            <Link to="/post-write">
              <button className="write-button btn btn-default">글쓰기</button>
            </Link>
          </section>

          <div className="row">
            {posts.map((post) => (
              <div className="col-sm-3" key={post.id}>
                <Link to="/post-detail">
                  <div className="gallery-post">
                    <section className="post-image-box">
                      <img
                        className="post-image img-responsive"
                        src={post.image}
                        alt="엠시스 로고"
                      />
                    </section>

                    <section className="post-content">
                      <p className="post-date">{post.date}</p>

                      <p className="post-title">{post.title}</p>
                    </section>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}

export default Gallery;

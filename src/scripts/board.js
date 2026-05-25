// 게시판 기능. 게시글 목록, 검색, 글 작성, 상세보기, 댓글
const likeButton = document.querySelector(".like-btn");
const dislikeButton = document.querySelector(".dislike-btn");
const reactionMessage = document.querySelector(".reaction-message");

/* 좋아요 클릭 */
likeButton.addEventListener("click", () => {
  // 싫어요가 눌려있으면 막기
  if (dislikeButton.classList.contains("active")) {
    reactionMessage.textContent =
      "이미 싫어요를 누른 상태에서는 좋아요를 누를 수 없습니다.";

    return;
  }

  // 자기 자신 토글
  likeButton.classList.toggle("active");

  // 좋아요 취소 시 문구 제거
  if (!likeButton.classList.contains("active")) {
    reactionMessage.textContent = "";
  }
});

/* 싫어요 클릭 */
dislikeButton.addEventListener("click", () => {
  // 좋아요가 눌려있으면 막기
  if (likeButton.classList.contains("active")) {
    reactionMessage.textContent =
      "이미 좋아요를 누른 상태에서는 싫어요를 누를 수 없습니다.";

    return;
  }

  // 자기 자신 토글
  dislikeButton.classList.toggle("active");

  // 싫어요 취소 시 문구 제거
  if (!dislikeButton.classList.contains("active")) {
    reactionMessage.textContent = "";
  }
});

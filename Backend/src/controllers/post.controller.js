const postService = require("../services/post.service");

// 게시글 전체 조회
exports.getAllPosts = async (req, res, next) => {
  try {
    const result = await postService.getAllPosts(req.query);

    res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};



// 특정 게시글 상세 조회
exports.getPostById = async (req, res, next) => {
  try {
    const post = await postService.getPostById(req.params.id);

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    next(error);
  }
};



// 게시글 조회수 증가
exports.increaseViewCount = async (req, res, next) => {
  try {
    const updatedPost = await postService.increaseViewCount(req.params.id);

    return res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};



// 새로운 게시글 작성
exports.createPost = async (req, res, next) => {
  try {
    const newPost = await postService.createPost({
      body: req.body,
      user: req.user,
    });

    return res.status(201).json({
      success: true,
      message: "게시글이 작성되었습니다.",
      data: newPost,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 수정 (본인만 가능)
exports.updatePost = async (req, res, next) => {
  try {
    const updatedPost = await postService.updatePost({
      id: req.params.id,
      body: req.body,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "게시글이 수정되었습니다.",
      data: updatedPost,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 삭제 (본인 또는 임원 이상)
exports.deletePost = async (req, res, next) => {
  try {
    await postService.deletePost({
      id: req.params.id,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "게시글이 삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 좋아요 누르기
exports.toggleLike = async (req, res, next) => {
  try {
    const result = await postService.toggleLike({
      postId: req.params.postId,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "좋아요 처리가 완료되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 싫어요 누르기
exports.toggleDislike = async (req, res, next) => {
  try {
    const result = await postService.toggleDislike({
      postId: req.params.postId,
      user: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "싫어요 처리가 완료되었습니다.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// 게시글 이미지 업로드
exports.uploadPostImages = async (req, res, next) => {
  try {
    const uploadedImages = await postService.uploadPostImages(req.files);

    return res.status(201).json({
      success: true,
      message: "게시글 이미지가 업로드되었습니다.",
      data: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
};

// 업로드했지만 게시글에 사용하지 않은 이미지 삭제
// 이미지 업로드하면 서버 폴더에 저장되고 안 사라지는거 방지하기 위함
exports.deleteUnusedPostImages = async (req, res, next) => {
  try {
    await postService.deleteUnusedPostImages(req.body.images);

    return res.status(200).json({
      success: true,
      message: "사용하지 않는 이미지가 삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

// 파일 업로드
exports.uploadPostFiles = async (req, res, next) => {
  try {
    const uploadedFiles = await postService.uploadPostFiles(req.files);

    return res.status(201).json({
      success: true,
      message: "파일이 업로드되었습니다.",
      data: uploadedFiles,
    });
  } catch (error) {
    next(error);
  }
};

// 파일 다운로드 함수
exports.downloadPostFile = async (req, res, next) => {
  try {
    const fileInfo = await postService.getPostFileForDownload({
      fileName: req.params.fileName,
      originalName: req.query.name,
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename*=UTF-8''${encodeURIComponent(fileInfo.originalName)}`
    );

    return res.download(fileInfo.filePath, fileInfo.originalName);
  } catch (error) {
    next(error);
  }
};

// 업로드했지만 게시글에 사용하지 않은 파일 삭제
// 파일 업로드하면 서버 폴더에 저장되고 안 사라지는거 방지하기 위함
exports.deleteUnusedPostFiles = async (req, res, next) => {
  try {
    await postService.deleteUnusedPostFiles(req.body.files);

    return res.status(200).json({
      success: true,
      message: "사용하지 않는 파일이 삭제되었습니다.",
    });
  } catch (error) {
    next(error);
  }
};

// 마이페이지 내가 쓴 글 불러오기
exports.getMyPosts = async (req, res, next) => {
  try {
    const result = await postService.getMyPosts({
      user: req.user,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      data: result.posts,
      pagination: result.pagination,
    });
  } catch (error) {
      next(error);
  }
};
import Navbar from "../layout/Nav";
import Footer from "../layout/Footer";
import Pagination from "../components/pagination";
import "../layout/common.css";
import "../styles/mypage.css";

import { useEffect, useRef, useState } from "react";
import { PencilLine, UserKey, FileText, Heart, MessageSquare, Settings } from "lucide-react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { useNavigate, useParams } from "react-router-dom";
import { getMyInfo, getUserInfoById, resetProfileImage, updateGreetingMessage, updateProfileImage } from "../api/userAPI";
import { getMyPosts, getMyPostActivityStats, getMyPostCategoryStats, getUserPosts, getUserPostActivityStats, getUserPostCategoryStats } from "../api/postAPI";
import { getUserInfo as getStoredUserInfo, isAuthError, redirectToLogin, requireLogin } from "../utils/token";
import defaultProfile from "../assets/images/기본_프로필_라이트.png";

const ACTIVITY_YEAR = new Date().getFullYear();
const ACTIVITY_YEARS = [ACTIVITY_YEAR, ACTIVITY_YEAR - 1, ACTIVITY_YEAR - 2];
const ACTIVITY_WEEKDAYS = ["S", "M", "T", "W", "T", "F", "S"];
const ACTIVITY_MONTHS = ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월", "9월", "10월", "11월", "12월"];
const DEFAULT_GREETING_MESSAGE = "안녕하세요!";
const MY_POST_BOARD_OPTIONS = [
  { value: "all", label: "게시판 선택" },
  { value: "notice", label: "공지사항" },
  { value: "community", label: "커뮤니티" },
  { value: "resources", label: "자료실" },
  { value: "gallery", label: "갤러리" },
  { value: "maintenance", label: "점검안내" },
];
const MY_POST_SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "views", label: "조회수 순" },
  { value: "likes", label: "좋아요 순" },
  { value: "comments", label: "댓글 순" },
];
const MY_POST_SUB_CATEGORY_OPTIONS = {
  all: [
    "공지",
    "소모임",
    "게임",
    "기타",
    "공모전",
    "스터디",
    "초급반",
    "중급반",
    "심화반",
    "전필-수업자료/과제",
    "전필-족보",
    "전선-수업자료/과제",
    "전선-족보",
    "교양-수업자료/과제",
    "교양-족보",
    "점검일시",
    "점검내용",
  ],
  notice: ["공지"],
  community: ["소모임", "게임", "기타", "공모전", "스터디"],
  resources: [
    "초급반",
    "중급반",
    "심화반",
    "전필-수업자료/과제",
    "전필-족보",
    "전선-수업자료/과제",
    "전선-족보",
    "교양-수업자료/과제",
    "교양-족보",
  ],
  gallery: [],
  maintenance: ["점검일시", "점검내용"],
};
const CATEGORY_CHART_COLORS = [
  "#00ffa3",
  "#4fc3f7",
  "#8fb8ff",
  "#ffd166",
  "#ff7d6e",
  "#c792ea",
  "#63d2c6",
  "#b4d455",
];
function formatActivityDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const TODAY_ACTIVITY_DATE_KEY = formatActivityDateKey(new Date());

function getActivityLevel(count) {
  if (!count) return 0;
  if (count <= 2) return 1;
  if (count <= 4) return 2;
  if (count <= 8) return 3;
  return 4;
}

function createActivityWeeks(year, activityCountByDate = {}) {
  const firstDay = new Date(year, 0, 1);
  const lastDay = new Date(year, 11, 31);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - firstDay.getDay());

  const totalDays = Math.ceil((lastDay - gridStart) / 86400000) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  return Array.from({ length: totalWeeks }, (_, weekIndex) =>
    Array.from({ length: 7 }, (_, dayIndex) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + weekIndex * 7 + dayIndex);

      const dateKey = formatActivityDateKey(date);
      const count = date.getFullYear() === year
        ? activityCountByDate[dateKey] || 0
        : null;

      return {
        count,
        date,
        dateKey,
        isToday: dateKey === TODAY_ACTIVITY_DATE_KEY && date.getFullYear() === year,
        inYear: date.getFullYear() === year,
        level: getActivityLevel(count),
      };
    })
  );
}

function createMonthLabels(weeks, year) {
  return weeks.map((week) => {
    const firstOfMonth = week.find(
      (day) => day.inYear && day.date.getDate() === 1
    );

    if (!firstOfMonth) return "";
    if (firstOfMonth.date.getFullYear() !== year) return "";

    return ACTIVITY_MONTHS[firstOfMonth.date.getMonth()];
  });
}

function CategoryChartTooltip({ active, payload, coordinate, viewBox }) {
  if (!active || !payload?.length) return null;

  const item = payload[0].payload;
  const centerY = viewBox ? viewBox.y + viewBox.height / 2 : 80;
  const placement = coordinate?.y <= centerY ? "above" : "below";

  return (
    <div className={`category-chart-tooltip ${placement}`}>
      <span
        className="category-chart-tooltip-dot"
        style={{ backgroundColor: item.color }}
      />
      <strong>{item.name}</strong>
      <span>{item.percent}%</span>
    </div>
  );
}

function MyPage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const requestedUserId = userId ? Number(userId) : null;
  const storedUserId = Number(getStoredUserInfo()?.id);
  const isInvalidRequestedUserId = userId && (Number.isNaN(requestedUserId) || requestedUserId < 1);
  const isOwnPage = !requestedUserId || requestedUserId === storedUserId;
  const profileUserId = isOwnPage ? null : requestedUserId;

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  const [myPosts, setMyPosts] = useState([]);
  const [categoryStats, setCategoryStats] = useState([]);
  const [activityStats, setActivityStats] = useState([]);
  const [myPostsPage, setMyPostsPage] = useState(1);
  const [myPostsTotalPages, setMyPostsTotalPages] = useState(1);
  const [myPostsBoard, setMyPostsBoard] = useState("all");
  const [myPostsSubCategory, setMyPostsSubCategory] = useState("all");
  const [myPostsSort, setMyPostsSort] = useState("latest");
  const [myPostsSearch, setMyPostsSearch] = useState("");
  const [selectedActivityYear, setSelectedActivityYear] = useState(ACTIVITY_YEAR);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const [greetingEditOpen, setGreetingEditOpen] = useState(false);
  const [greetingDraft, setGreetingDraft] = useState("");
  const [greetingSaving, setGreetingSaving] = useState(false);
  const profileFileInputRef = useRef(null);
  const activityScrollRef = useRef(null);
  const MY_POSTS_PER_PAGE = 10;
  const activityCountByDate = activityStats.reduce((stats, item) => {
    stats[item.date] = item.count;
    return stats;
  }, {});
  const activityWeeks = createActivityWeeks(selectedActivityYear, activityCountByDate);
  const activityMonthLabels = createMonthLabels(activityWeeks, selectedActivityYear);
  const currentActivityWeekIndex = activityWeeks.findIndex((week) =>
    week.some((day) => day.isToday)
  );
  const activityTotalCount = activityWeeks
    .flat()
    .reduce((total, day) => total + (day.count || 0), 0);

  useEffect(() => {
    setProfileSettingsOpen(false);
    setGreetingEditOpen(false);
    setGreetingDraft("");
    setMyPostsPage(1);
    setMyPostsBoard("all");
    setMyPostsSubCategory("all");
    setMyPostsSort("latest");
    setMyPostsSearch("");
  }, [profileUserId]);

  function handleOpenProfileUpload() {
    setProfileSettingsOpen(false);
    profileFileInputRef.current?.click();
  }

  async function handleSelectResetProfileImage() {
    setProfileSettingsOpen(false);
    await handleResetProfileImage();
  }

  function handleOpenGreetingEdit() {
    setGreetingDraft(user?.greeting_message || "");
    setGreetingEditOpen(true);
  }

  function handleCancelGreetingEdit() {
    setGreetingDraft(user?.greeting_message || "");
    setGreetingEditOpen(false);
  }

  async function handleSaveGreetingMessage() {
    try {
      setGreetingSaving(true);
      const result = await updateGreetingMessage(greetingDraft);

      setUser({
        ...user,
        greeting_message: result.data.greeting_message,
      });
      setGreetingEditOpen(false);
    } catch (error) {
      console.error("사용자 인사말 수정 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(
        error.response?.data?.message ||
        "사용자 인사말 수정에 실패했습니다."
      );
    } finally {
      setGreetingSaving(false);
    }
  }

  async function handleProfileImageChange(e) {
    const file = e.target.files[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file.size > maxSize) {
      alert("이미지 파일은 5MB 이하만 업로드할 수 있습니다.");
      return;
    }

    try {
      const result = await updateProfileImage(file);

      console.log("프로필 이미지 변경 응답:", result);

      setUser({
        ...user,
        profile_image: result.data.profile_image,
      });

      alert("프로필 이미지가 변경되었습니다.");
    } catch (error) {
      console.error("프로필 이미지 변경 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(
        error.response?.data?.message ||
        "프로필 이미지 변경에 실패했습니다."
      );
    }
  }

  async function handleResetProfileImage() {
    if (!user?.profile_image) {
      alert("이미 기본 프로필 이미지입니다.");
      return;
    }

    const confirmReset = window.confirm("기본 프로필 이미지로 변경하시겠습니까?");

    if (!confirmReset) {
      return;
    }

    try {
      const result = await resetProfileImage();

      console.log("기본 프로필 변경 응답:", result);

      setUser({
        ...user,
        profile_image: null,
      });

      alert("기본 프로필 이미지로 변경되었습니다.");
    } catch (error) {
      console.error("기본 프로필 변경 실패:", error);

      if (isAuthError(error)) {
        redirectToLogin(navigate, error);
        return;
      }

      alert(
        error.response?.data?.message ||
        "기본 프로필 이미지로 변경하지 못했습니다."
      );
    }
  }

  useEffect(() => {
    async function fetchMyInfo() {
      if (!requireLogin(navigate)) return;

      setLoading(true);
      setErrorMessage("");

      if (isInvalidRequestedUserId) {
        setErrorMessage("잘못된 사용자 ID입니다.");
        setLoading(false);
        return;
      }

      try {
        const result = profileUserId
          ? await getUserInfoById(profileUserId)
          : await getMyInfo();

        console.log("마이페이지 사용자 정보:", result);

        setUser(result.data);
      } catch (error) {
        console.error("마이페이지 정보 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
          return;
        }

        setErrorMessage(
          error.response?.data?.message ||
          "사용자 정보를 불러오지 못했습니다."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMyInfo();
  }, [isInvalidRequestedUserId, navigate, profileUserId]);

  useEffect(() => {
    async function fetchMyPosts() {
      if (!requireLogin(navigate)) return;
      if (isInvalidRequestedUserId) return;

      try {
        const postFilters = getMyPostFilters();
        const result = profileUserId
          ? await getUserPosts(profileUserId, {
            page: myPostsPage,
            limit: MY_POSTS_PER_PAGE,
            ...postFilters,
            sub_category: myPostsSubCategory,
            search: myPostsSearch,
            sort: myPostsSort,
          })
          : await getMyPosts({
            page: myPostsPage,
            limit: MY_POSTS_PER_PAGE,
            ...postFilters,
            sub_category: myPostsSubCategory,
            search: myPostsSearch,
            sort: myPostsSort,
          });
        setMyPosts(result.data);
        setMyPostsTotalPages(result.pagination?.totalPages || 1);
      } catch (error) {
        console.error("내 게시글 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
        }
      }
    }
    fetchMyPosts();
  }, [
    isInvalidRequestedUserId,
    myPostsBoard,
    myPostsPage,
    myPostsSearch,
    myPostsSort,
    myPostsSubCategory,
    navigate,
    profileUserId,
  ]);

  useEffect(() => {
    async function fetchMyPostCategoryStats() {
      if (!requireLogin(navigate)) return;
      if (isInvalidRequestedUserId) return;

      try {
        const result = profileUserId
          ? await getUserPostCategoryStats(profileUserId)
          : await getMyPostCategoryStats();
        setCategoryStats(result.data || []);
      } catch (error) {
        console.error("작성 글 비율 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
        }
      }
    }

    fetchMyPostCategoryStats();
  }, [isInvalidRequestedUserId, navigate, profileUserId]);

  useEffect(() => {
    async function fetchMyPostActivityStats() {
      if (!requireLogin(navigate)) return;
      if (isInvalidRequestedUserId) return;

      try {
        const result = profileUserId
          ? await getUserPostActivityStats(profileUserId, selectedActivityYear)
          : await getMyPostActivityStats(selectedActivityYear);
        setActivityStats(result.data || []);
      } catch (error) {
        console.error("작성 글 활동 기록 조회 실패:", error);

        if (isAuthError(error)) {
          redirectToLogin(navigate, error);
        }
      }
    }

    fetchMyPostActivityStats();
  }, [isInvalidRequestedUserId, navigate, profileUserId, selectedActivityYear]);

  useEffect(() => {
    if (loading || selectedActivityYear !== ACTIVITY_YEAR || currentActivityWeekIndex < 0) {
      return;
    }

    const scrollContainer = activityScrollRef.current;
    const currentWeek = scrollContainer?.querySelector('[data-current-week="true"]');

    if (!scrollContainer || !currentWeek) {
      return;
    }

    const animationFrameId = window.requestAnimationFrame(() => {
      const containerRect = scrollContainer.getBoundingClientRect();
      const currentWeekRect = currentWeek.getBoundingClientRect();
      const rightPadding = 8;
      const targetScrollLeft =
        scrollContainer.scrollLeft +
        currentWeekRect.right -
        containerRect.right +
        rightPadding;

      scrollContainer.scrollLeft = Math.max(0, targetScrollLeft);
    });

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [currentActivityWeekIndex, loading, selectedActivityYear]);

  if (loading) {
    return (
      <div className="mypage-page">
        <Navbar />
        <div className="mypage-container">
          <p className="mypage-loading">사용자 정보를 불러오는 중...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="mypage-page">
        <Navbar />
        <div className="mypage-container">
          <p className="mypage-error">{errorMessage}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const profileImageUrl = user?.profile_image
    ? `${import.meta.env.VITE_API_BASE_URL}${user.profile_image}`
    : defaultProfile;

  function getCategoryText(category) {
    if (category === "notice") return "공지사항";
    if (category === "free") return "자유";
    if (category === "qna") return "질문";
    if (category === "recruit") return "팀원 모집";
    if (category === "study") return "스터디";
    if (category === "project") return "과제/프로젝트";
    if (category === "contest") return "대회/공모전";
    if (category === "class") return "수업";
    if (category === "activity") return "행사";
    if (category === "maintenance") return "점검안내";
    if (category === "uncategorized") return "미분류";
    return category;
  }

  function getMyPostFilters() {
    if (myPostsBoard === "notice") {
      return { board_type: "COMMUNITY", category: "notice" };
    }

    if (myPostsBoard === "community") {
      return {
        board_type: "COMMUNITY",
        category: "all",
        exclude_category: "notice",
      };
    }

    if (myPostsBoard === "resources") {
      return { board_type: "ARCHIVE", category: "all" };
    }

    if (myPostsBoard === "gallery") {
      return { board_type: "GALLERY", category: "all" };
    }

    if (myPostsBoard === "maintenance") {
      return { board_type: "MAINTENANCE", category: "all" };
    }

    return { board_type: "all", category: "all" };
  }

  function getPostTitlePrefix(post) {
    if (post.sub_category) return post.sub_category;
    if (post.category === "notice") return "공지";

    return "";
  }

  function formatDateOnly(date) {
    return date ? String(date).slice(0, 10) : "";
  }

  function getUserStatusText(targetUser) {
    const studentYear = targetUser?.student_id
      ? String(targetUser.student_id).slice(2, 4)
      : "";
    const status = targetUser?.status || "";

    if (studentYear && status) {
      return `${studentYear}학번 ${status}`;
    }

    return status || "-";
  }

  const categoryTotalCount = categoryStats.reduce(
    (total, item) => total + item.count,
    0
  );
  const categoryChartData = categoryStats.map((item, index) => ({
    ...item,
    color: CATEGORY_CHART_COLORS[index % CATEGORY_CHART_COLORS.length],
    name: getCategoryText(item.category),
    percent: categoryTotalCount > 0
      ? Math.round((item.count / categoryTotalCount) * 100)
      : 0,
  }));
  const myPostSubCategoryOptions = MY_POST_SUB_CATEGORY_OPTIONS[myPostsBoard] || [];
  const hasMyPostSubCategoryOptions = myPostSubCategoryOptions.length > 0;

  return (
    <div className="mypage-page">
      <Navbar />
      <div className="mypage-container">
        <h1 className="mypage-text">{isOwnPage ? "마이페이지" : `${user?.name || "사용자"}님의 페이지`}</h1>

        {/* 사용자 정보 */}
        <div className="user-info-box">
          <h2 className="section-title">사용자 정보</h2>

          <div className="user-info-body">
            <div className="user-info-left-panel">
              <div className="user-info-top">
                <section className="profile-image-section">
              <div className="profile-avatar-control">
                <img
                  className="profile-image"
                  src={profileImageUrl}
                  alt="프로필 이미지"
                />

                {isOwnPage && (
                  <>
                    <input
                      ref={profileFileInputRef}
                      className="profile-file-input"
                      type="file"
                      accept="image/*"
                      hidden
                      tabIndex={-1}
                      onChange={handleProfileImageChange}
                    />

                    <button
                      type="button"
                      className="profile-settings-btn"
                      aria-label="프로필 설정"
                      aria-expanded={profileSettingsOpen}
                      onClick={() => setProfileSettingsOpen((isOpen) => !isOpen)}
                    >
                      <Settings size={20} strokeWidth={2.4} />
                    </button>

                    {profileSettingsOpen && (
                      <div className="profile-settings-menu">
                        <button
                          type="button"
                          className="profile-settings-option"
                          onClick={handleOpenProfileUpload}
                        >
                          프로필 사진 업로드
                        </button>
                        <button
                          type="button"
                          className="profile-settings-option"
                          onClick={handleSelectResetProfileImage}
                        >
                          기본 프로필로 변경
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </section>

            <section className="user-info-content1">
              <div className="user-info-heading">
                <h2 className="user-info-name">{user?.name}</h2>
                <p className="user-info-role">{user?.role}</p>
              </div>

              <dl className="user-info-inner-box">
                <div className="user-info-row">
                  <dt className="user-info-label">학번</dt>
                  <dd className="user-info-value">{user?.student_id}</dd>
                </div>
                <div className="user-info-row">
                  <dt className="user-info-label">가입일</dt>
                  <dd className="user-info-value">
                    {formatDateOnly(user?.created_at)}
                  </dd>
                </div>
                <div className="user-info-row">
                  <dt className="user-info-label">{isOwnPage ? "이메일" : "상태"}</dt>
                  <dd className="user-info-value">
                    {isOwnPage ? user?.email : getUserStatusText(user)}
                  </dd>
                </div>
              </dl>
            </section>

              </div>

              <section className="user-greeting-box">
                <div className="user-greeting-header">
                  <h3 className="user-greeting-title">사용자 인사말</h3>
                  {isOwnPage && (
                    <button
                      type="button"
                      className="user-greeting-edit-btn"
                      aria-label="사용자 인사말 수정"
                      onClick={handleOpenGreetingEdit}
                    >
                      <PencilLine size={18} strokeWidth={2.2} />
                    </button>
                  )}
                </div>

                {greetingEditOpen ? (
                  <div className="user-greeting-editor">
                    <textarea
                      className="user-greeting-textarea"
                      value={greetingDraft}
                      maxLength={100}
                      rows={3}
                      autoFocus
                      placeholder={DEFAULT_GREETING_MESSAGE}
                      onChange={(event) => setGreetingDraft(event.target.value)}
                    />
                    <div className="user-greeting-actions">
                      <span className="user-greeting-count">
                        {greetingDraft.length}/100
                      </span>
                      <button
                        type="button"
                        className="user-greeting-cancel-btn"
                        onClick={handleCancelGreetingEdit}
                        disabled={greetingSaving}
                      >
                        취소
                      </button>
                      <button
                        type="button"
                        className="user-greeting-save-btn"
                        onClick={handleSaveGreetingMessage}
                        disabled={greetingSaving}
                      >
                        {greetingSaving ? "저장 중" : "저장"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="user-greeting-text">
                    {user?.greeting_message || DEFAULT_GREETING_MESSAGE}
                  </p>
                )}
              </section>
            </div>

            <aside className="user-category-chart-panel" aria-label="작성 글 카테고리 비율">
              <div className="category-chart-header">
                <h3 className="category-chart-title">작성 글 비율</h3>
                <p className="category-chart-subtitle">카테고리 기준</p>
              </div>

              <div className="category-chart-area">
                {categoryTotalCount > 0 ? (
                  <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      allowEscapeViewBox={{ x: true, y: true }}
                      content={<CategoryChartTooltip />}
                      cursor={false}
                      isAnimationActive={false}
                      wrapperStyle={{ pointerEvents: "none" }}
                    />
                    <Pie
                      data={categoryChartData}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius="58%"
                      outerRadius="82%"
                      paddingAngle={2}
                      stroke="none"
                    >
                      {categoryChartData.map((entry) => (
                        <Cell key={entry.category} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>

                <div className="category-chart-center">
                  <strong>{categoryTotalCount}</strong>
                  <p>전체</p>
                </div>
                  </>
                ) : (
                  <p className="category-chart-empty">작성한 글이 없습니다.</p>
                )}
              </div>

              <dl className="category-activity-stats" aria-label="내 활동 요약">
                <div className="category-activity-stat">
                  <dt>
                    <UserKey className="category-activity-icon" size={16} strokeWidth={2.2} />
                    방문
                  </dt>
                  <dd>
                    <strong>{user?.visit_count ?? 0}</strong>
                    <span>회</span>
                  </dd>
                </div>
                <div className="category-activity-stat">
                  <dt>
                    <FileText className="category-activity-icon" size={16} strokeWidth={2.2} />
                    {isOwnPage ? "내가 쓴 게시글" : "작성 게시글"}
                  </dt>
                  <dd>
                    <strong>{user?.post_count ?? categoryTotalCount}</strong>
                    <span>개</span>
                  </dd>
                </div>
                <div className="category-activity-stat">
                  <dt>
                    <MessageSquare className="category-activity-icon" size={16} strokeWidth={2.2} />
                    {isOwnPage ? "내가 쓴 댓글" : "작성 댓글"}
                  </dt>
                  <dd>
                    <strong>{user?.comment_count ?? 0}</strong>
                    <span>개</span>
                  </dd>
                </div>
                <div className="category-activity-stat">
                  <dt>
                    <Heart className="category-activity-icon" size={16} strokeWidth={2.2} />
                    {isOwnPage ? "내가 보낸 좋아요" : "보낸 좋아요"}
                  </dt>
                  <dd>
                    <strong>{user?.liked_post_count ?? 0}</strong>
                    <span>개</span>
                  </dd>
                </div>
              </dl>
            </aside>
          </div>

        </div>
          {/* 내가 작성한 글 */}

          <section className="activity-grass-box">
            <div className="activity-header">
              <div>
                <h2 className="activity-title">활동 기록</h2>
                <p className="activity-summary">
                  {selectedActivityYear}년에 작성한 글{" "}
                  <span style={{ color: "var(--point-mint)" }}>
                    {activityTotalCount}
                  </span>
                  개
                </p>
              </div>

              <div className="activity-year-list" aria-label="연도 선택">
                {ACTIVITY_YEARS.map((year) => (
                  <span
                    key={year}
                    className={`activity-year-link${year === selectedActivityYear ? " active" : ""}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedActivityYear(year)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        setSelectedActivityYear(year);
                      }
                    }}
                  >
                    {year}
                  </span>
                ))}
              </div>
            </div>

            <div className="activity-board-scroll" ref={activityScrollRef}>
              <div className="activity-calendar">
                <div className="activity-month-row">
                  <div className="activity-corner" />
                  <div
                    className="activity-month-grid"
                    style={{
                      gridTemplateColumns: `repeat(${activityWeeks.length}, var(--grass-cell-size))`,
                    }}
                  >
                    {activityMonthLabels.map((month, index) => (
                      <span key={`${month || "empty"}-${index}`}>
                        {month}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="activity-body">
                  <div className="activity-weekdays">
                    {ACTIVITY_WEEKDAYS.map((weekday, index) => (
                      <span key={`${weekday}-${index}`}>{weekday}</span>
                    ))}
                  </div>

                  <div
                    className="activity-week-grid"
                    style={{
                      gridTemplateColumns: `repeat(${activityWeeks.length}, var(--grass-cell-size))`,
                    }}
                  >
                    {activityWeeks.map((week, weekIndex) => (
                      <div
                        className="activity-week"
                        key={`week-${weekIndex}`}
                        data-current-week={weekIndex === currentActivityWeekIndex ? "true" : undefined}
                      >
                        {week.map((day) => (
                          <span
                            key={day.dateKey}
                            className={`activity-cell${day.inYear ? "" : " outside-year"}${day.isToday ? " is-today" : ""}`}
                            data-level={day.level}
                            title={
                              day.inYear
                                ? `${day.dateKey}: ${day.count}개`
                                : ""
                            }
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="activity-legend" aria-label="작성 글 수 색상 단계">
              <div className="activity-legend-item">
                <span className="activity-cell" data-level="0" />
                <span>0개</span>
              </div>
              <div className="activity-legend-item">
                <span className="activity-cell" data-level="1" />
                <span>1-2개</span>
              </div>
              <div className="activity-legend-item">
                <span className="activity-cell" data-level="2" />
                <span>3-4개</span>
              </div>
              <div className="activity-legend-item">
                <span className="activity-cell" data-level="3" />
                <span>5-8개</span>
              </div>
              <div className="activity-legend-item">
                <span className="activity-cell" data-level="4" />
                <span>9개 이상</span>
              </div>
            </div>
          </section>

        <section className="mypage-posts-box">
          <div className="mypage-posts-header">
            <h2 className="mypage-post-section-title">
              {isOwnPage ? "내가 작성한 글" : `${user?.name || "사용자"}님이 작성한 글`}
            </h2>
          </div>

          <hr className="mypage-post-divider" />

          <div className="mypage-post-controls" aria-label="작성 글 필터 및 정렬">
            <select
              className="form-control mypage-post-select mypage-post-select-board"
              value={myPostsBoard}
              onChange={(event) => {
                setMyPostsBoard(event.target.value);
                setMyPostsSubCategory("all");
                setMyPostsPage(1);
              }}
            >
              {MY_POST_BOARD_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <select
              className="form-control mypage-post-select mypage-post-select-sub"
              value={hasMyPostSubCategoryOptions ? myPostsSubCategory : ""}
              onChange={(event) => {
                setMyPostsSubCategory(event.target.value);
                setMyPostsPage(1);
              }}
              disabled={!hasMyPostSubCategoryOptions}
            >
              {hasMyPostSubCategoryOptions ? (
                <>
                  <option value="all">세부 말머리</option>
                  {myPostSubCategoryOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </>
              ) : (
                <option value="">말머리 없음</option>
              )}
            </select>

            <select
              className="form-control mypage-post-select mypage-post-select-sort"
              value={myPostsSort}
              onChange={(event) => {
                setMyPostsSort(event.target.value);
                setMyPostsPage(1);
              }}
            >
              {MY_POST_SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            <input
              className="form-control mypage-post-search"
              type="text"
              value={myPostsSearch}
              placeholder="제목 또는 내용을 입력하세요"
              onChange={(event) => {
                setMyPostsSearch(event.target.value);
                setMyPostsPage(1);
              }}
            />
          </div>

          <div className="mypage-post-section-box">
            <div className="mypage-board-header" aria-hidden="true">
              <span>카테고리</span>
              <span>제목</span>
              <span>작성일</span>
              <span>조회</span>
              <span>좋아요</span>
              <span>댓글</span>
            </div>

            <div className="mypage-board-list">
              {myPosts.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>작성한 게시글이 없습니다.</p>
              ) : (
                myPosts.map((post) => (
                  <a key={post.id} href={`/posts/${post.id}`} className="mypage-post-link">
                    <article className="mypage-board-card">
                      <div className="mypage-board-row">
                        <div className="mypage-board-category">{getCategoryText(post.category)}</div>
                        <h2 className="mypage-board-title">
                          {getPostTitlePrefix(post) && (
                            <span className="mypage-board-title-prefix">
                              [{getPostTitlePrefix(post)}]
                            </span>
                          )}{" "}
                          {post.title}
                        </h2>
                        <time className="mypage-board-date" dateTime={post.created_at}>
                          {post.created_at?.slice(0, 10)}
                        </time>
                        <span className="mypage-board-stat mypage-board-view">{post.view_count ?? 0}</span>
                        <div className="mypage-board-reaction-box">
                          <span className="mypage-board-stat mypage-board-like">{post._count?.post_likes ?? 0}</span>
                          <span className="mypage-board-stat mypage-board-comment">{post._count?.comments ?? 0}</span>
                        </div>
                      </div>
                    </article>
                  </a>
                ))
              )}
            </div>
            <Pagination
              currentPage={myPostsPage}
              totalPages={myPostsTotalPages}
              onPageChange={setMyPostsPage}
            />
          </div>
        </section>
      </div>
      <Footer />
    </div>
  );
}

export default MyPage;

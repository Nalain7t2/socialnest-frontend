import { useState, useEffect, useContext, useRef } from "react";
import { getMyPosts, deletePost } from "../services/PostsApi";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEdit,
  FaTrash,
  FaHeart,
  FaComment,
  FaShare,
  FaImage,
  FaSearch,
  FaPlus,
  FaSignOutAlt,
  FaUserFriends,
  FaCamera,
  FaCheckCircle,
  FaCalendarAlt,
  FaEnvelope,
  FaRocket,
  FaUsers,
  FaUserPlus,
  FaUserCheck,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { getFollowers, getFollowing, getUserProfile } from "../services/api";
import "../style/MyPosts.css";
import FollowList from "./FollowList";

function MyPosts() {
  const { user, logout, refreshUser } = useContext(AuthContext);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [count, setCount] = useState(0);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [showFollowList, setShowFollowList] = useState(false);
  const [followListType, setFollowListType] = useState(null);


  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "info", 
    duration: 4000,
  });

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    postId: null,
    postTitle: "",
  });

  const navigate = useNavigate();
  const toastTimeoutRef = useRef(null);

  // Toast notification handler
  const showToast = (message, type = "info", duration = 4000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ show: true, message, type, duration });

    toastTimeoutRef.current = setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, duration);
  };

  const hideToast = () => {
    setToast((prev) => ({ ...prev, show: false }));
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  };

  // Cleanup toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  const openDeleteModal = (postId, postTitle) => {
    setDeleteModal({
      isOpen: true,
      postId,
      postTitle,
    });
  };

  const closeDeleteModal = () => {
    setDeleteModal({
      isOpen: false,
      postId: null,
      postTitle: "",
    });
  };

  // Function to get complete image URL
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/media/")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    return `http://127.0.0.1:8000/media/posts/${imagePath}`;
  };

  // Function to get avatar URL
  const getAvatarUrl = (avatarPath, username) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    if (avatarPath.includes("/")) {
      return `http://127.0.0.1:8000${avatarPath}`;
    }
    return `http://127.0.0.1:8000/media/profiles/${avatarPath}`;
  };

  const loadPosts = async (url = null) => {
    setLoading(true);
    try {
      const data = await getMyPosts(search, url);
      setPosts(data.results);
      setNext(data.next);
      setPrevious(data.previous);
      setCount(data.count);

      if (data.results.length === 0 && search) {
        showToast("No posts found matching your search", "info");
      }
    } catch (err) {
      // console.error("Error loading posts:", err);
      showToast(err.response?.data?.error || "Failed to load posts", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowCounts = async () => {
    try {
      const followersData = await getFollowers();
      const followingData = await getFollowing();
      setFollowersCount(followersData.followers_count || 0);
      setFollowingCount(followingData.following_count || 0);
    } catch (error) {
      // console.error("Failed to load follow counts:", error);
      showToast("Failed to load follow counts", "error");
    }
  };

  const openFollowers = () => {
    setFollowListType("followers");
    setShowFollowList(true);
  };

  const openFollowing = () => {
    setFollowListType("following");
    setShowFollowList(true);
  };

  const closeFollowList = () => {
    setShowFollowList(false);
    setFollowListType(null);
  };

  const fetchProfile = async () => {
    if (!user?.username) return;

    setProfileLoading(true);
    try {
      // console.log("Fetching profile for:", user.username);
      const data = await getUserProfile(user.username);
      // console.log("Profile data received:", data);
      setProfile(data);

      if (user && !user.bio && data.bio) {
        await refreshUser();
        showToast("Profile updated successfully", "success", 2000);
      }
    } catch (err) {
      // console.error("Profile fetch failed", err);
      showToast("Failed to load profile", "error");
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user?.username) {
      fetchProfile();
      loadPosts();
      fetchFollowCounts();
      showToast("Welcome to your profile!", "info", 2000);
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const timer = setTimeout(() => {
      loadPosts();
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const handleRouteChange = () => {
      if (user?.username) {
        fetchProfile();
        refreshUser();
      }
    };

    window.addEventListener("popstate", handleRouteChange);

    const handleFocus = () => {
      if (user?.username) {
        fetchProfile();
      }
    };

    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [user]);

  const joinDate = profile?.joined_date
    ? new Date(profile.joined_date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const handleDelete = async () => {
    const { postId } = deleteModal;
    if (!postId) return;

    try {
      await deletePost(postId);
      setPosts(posts.filter((p) => p.id !== postId));
      setCount((prev) => prev - 1);
      showToast("Post deleted successfully!", "success");
      closeDeleteModal();
    } catch (err) {
      // console.error("Delete error:", err);
      showToast(err.response?.data?.error || "Failed to delete post", "error");
      closeDeleteModal();
    }
  };

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "success", 2000);
    setTimeout(() => navigate("/login"), 1500);
  };

  const displayBio =
    profile?.bio || user?.bio || "No bio yet. Tell us about yourself!";

  return (
    <>
      <div className="my-posts-creative-container">
        {/* Toast Notification */}
        {toast.show && (
          <div
            className={`toast-notification-myposts toast-${toast.type}`}
            onClick={hideToast}
          >
            <div className="toast-icon">
              {toast.type === "success" && <FaCheckCircle />}
              {toast.type === "error" && <FaExclamationTriangle />}
              {toast.type === "warning" && <FaExclamationTriangle />}
              {toast.type === "info" && <FaInfoCircle />}
            </div>
            <div className="toast-message">{toast.message}</div>
            <button className="toast-close" onClick={hideToast}>
              <FaTimes />
            </button>
            <div
              className="toast-progress"
              style={{ animationDuration: `${toast.duration}ms` }}
            />
          </div>
        )}

        {/* Animated Background Elements */}
        <div className="floating-elements">
          <div className="floating-icon floating-icon-1">
            <FaCamera />
          </div>
          <div className="floating-icon floating-icon-2">
            <FaHeart />
          </div>
          <div className="floating-icon floating-icon-3">
            <FaUsers />
          </div>
          <div className="floating-icon floating-icon-4">
            <FaRocket />
          </div>
        </div>

        {/* Main Content */}
        <div className="profile-main-wrapper">
          {/* Profile Cover */}
          <div className="profile-cover">
            <div className="cover-pattern"></div>
          </div>

          {/* Profile Card */}
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar-large">
                  {user?.avatar ? (
                    <img
                      src={getAvatarUrl(user.avatar, user.username)}
                      alt={user.username}
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML = `<div class="avatar-placeholder-large">${user.username[0].toUpperCase()}</div>`;
                        showToast("Failed to load avatar", "error");
                      }}
                    />
                  ) : (
                    <div className="avatar-placeholder-large">
                      {user?.username?.[0]?.toUpperCase() || "U"}
                    </div>
                  )}
                </div>
                <div className="verified-badge-large">
                  <FaCheckCircle />
                </div>
              </div>

              <div className="profile-info">
                <div className="profile-name-section">
                  <h1 className="profile-display-name">
                    {user?.username || "Your Name"}
                  </h1>
                  <span className="profile-username">
                    @{user?.username?.toLowerCase() || "username"}
                  </span>
                </div>

                {profileLoading ? (
                  <div className="profile-bio-loading">
                    <span className="small-spinner"></span> Loading bio...
                  </div>
                ) : (
                  <p className="profile-bio">{displayBio}</p>
                )}

                <div className="profile-meta">
                  <div className="profile-meta-item">
                    <FaEnvelope />
                    <span>{user?.email || "email@example.com"}</span>
                  </div>
                  <div className="profile-meta-item">
                    <FaCalendarAlt />
                    <span>Joined {joinDate || "recently"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Profile Stats */}
            <div className="profile-stats">
              <div className="stat-card">
                <span className="stat-number">{count}</span>
                <span className="stat-label">
                  <FaRocket /> Posts
                </span>
              </div>
              <div className="stat-card clickable" onClick={openFollowers}>
                <span className="stat-number">
                  {followersCount.toLocaleString()}
                </span>
                <span className="stat-label">
                  <FaUsers /> Followers
                </span>
              </div>

              <div className="stat-card clickable" onClick={openFollowing}>
                <span className="stat-number">
                  {followingCount.toLocaleString()}
                </span>
                <span className="stat-label">
                  <FaUserFriends /> Following
                </span>
              </div>
            </div>

            {/* Profile Actions */}
            <div className="profile-actions">
              <button
                onClick={() => navigate("/post")}
                className="btn btn-primary"
              >
                <FaPlus /> Create Post
              </button>
              <button
                onClick={() => navigate("/edit-profile")}
                className="btn btn-secondary"
              >
                <FaEdit /> Edit Profile
              </button>
              <button
                onClick={() => navigate("/")}
                className="btn btn-secondary"
              >
                ← Back to Home
              </button>
              <button
                onClick={() => navigate("/delete_account")}
                className="btn btn-outline-danger"
              >
                <FaTrash /> Delete Account
              </button>
              <button onClick={handleLogout} className="btn btn-danger">
                <FaSignOutAlt /> Logout
              </button>
            </div>

            {/* Search Section */}
            <div className="search-section">
              <div className="search-wrapper">
                <FaSearch className="search-icon" />
                <input
                  className="search-input"
                  placeholder="Search your posts..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Posts Content */}
            {loading ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading your posts...</p>
              </div>
            ) : posts.length > 0 ? (
              <>
                <div className="posts-grid">
                  {posts.map((post) => (
                    <div key={post.id} className="post-card">
                      {post.image && (
                        <div className="post-image-container">
                          <img
                            src={getImageUrl(post.image)}
                            alt={post.title}
                            className="post-image"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentElement.innerHTML =
                                '<div class="image-error">📷 Image failed to load</div>';
                              showToast("Failed to load image", "error");
                            }}
                          />
                        </div>
                      )}
                      <div className="post-content">
                        <h3 className="post-title">{post.title}</h3>
                        <p className="post-text">{post.content}</p>
                        <div className="post-meta">
                          <span className="post-meta-item">
                            <FaCalendarAlt />
                            {new Date(post.created_at).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </span>
                          <span className="post-meta-item">
                            <FaHeart />
                            {post.likes_count || 0} likes
                          </span>
                          <span className="post-meta-item">
                            <FaComment />
                            {post.comments_count || 0} comments
                          </span>
                        </div>

                        {user && post.user === user.id && (
                          <div className="post-actions">
                            <button
                              onClick={() => navigate(`/post/${post.id}`)}
                              className="btn-action edit-btn"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() =>
                                openDeleteModal(post.id, post.title)
                              }
                              className="btn-action delete-btn"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {posts.length > 0 && (
                  <div className="pagination">
                    <button
                      onClick={() => previous && loadPosts(previous)}
                      disabled={!previous}
                      className="pagination-btn"
                    >
                      ← Previous
                    </button>
                    <span className="page-info">
                      Showing {posts.length} of {count} posts
                    </span>
                    <button
                      onClick={() => next && loadPosts(next)}
                      disabled={!next}
                      className="pagination-btn"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <FaRocket />
                </div>
                <h3>No posts yet</h3>
                <p>Start sharing your thoughts with the community!</p>
                <button
                  onClick={() => navigate("/post")}
                  className="btn btn-primary"
                >
                  <FaPlus /> Create Your First Post
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Background Particles */}
        <div className="particles-container">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
              }}
            ></div>
          ))}
        </div>
        {deleteModal.isOpen && (
          <div className="modal-overlay" onClick={closeDeleteModal}>
            <div className="delete-modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header delete">
                <div className="modal-icon">
                  <FaExclamationTriangle />
                </div>
                <h3>Delete Post</h3>
                <button className="modal-close" onClick={closeDeleteModal}>
                  <FaTimes />
                </button>
              </div>

              <div className="modal-body">
                <p className="delete-warning">
                  Are you sure you want to delete this post?
                </p>
                <div className="post-preview-delete">
                  <strong>"{deleteModal.postTitle}"</strong>
                </div>
                <p className="delete-consequences">
                  This action{" "}
                  <span className="highlight-danger">cannot be undone</span>.
                  The post will be permanently removed from your profile and
                  feed.
                </p>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-btn cancel-btn"
                  onClick={closeDeleteModal}
                >
                  Cancel
                </button>
                <button className="modal-btn delete-btn" onClick={handleDelete}>
                  <FaTrash /> Delete Permanently
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showFollowList && (
        <FollowList type={followListType} onClose={closeFollowList} />
      )}
    </>
  );
}

export default MyPosts;

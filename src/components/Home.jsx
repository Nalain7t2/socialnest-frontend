import React, { useState, useEffect, useContext, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { getPosts, LikePost, CommentPost } from "../services/PostsApi";
import {
  followUser,
  getFollowSuggestions,
  unfollowUser,
  getFollowers,
  getFollowing,
  searchUsers,
} from "../services/api";
import { useNavigate } from "react-router-dom";
import "../style/Home.css";
import logo from "../images/logo.png";
import { 
  FiMenu, 
  FiX, 
  FiUserPlus, 
  FiSearch, 
  FiHome, 
  FiUser, 
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiInfo,
  FiCopy,
  FiShare2
} from 'react-icons/fi';

function Home() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [next, setNext] = useState(null);
  const [previous, setPrevious] = useState(null);
  const [commentText, setCommentText] = useState({});
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [expandedComments, setExpandedComments] = useState({});

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info', 
    duration: 3000
  });

  // Follow suggestions states
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [followLoading, setFollowLoading] = useState({});

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const searchTimeoutRef = useRef(null);
  const toastTimeoutRef = useRef(null);

  // Mobile states
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMobileFollow, setShowMobileFollow] = useState(false);

  // Helper Functions
  const getImageUrl = (imagePath) => {
    if (!imagePath) return null;
    if (imagePath.startsWith("http")) return imagePath;
    if (imagePath.startsWith("/media/")) {
      return `http://127.0.0.1:8000${imagePath}`;
    }
    return `http://127.0.0.1:8000/media/posts/${imagePath}`;
  };

  const getAvatarUrl = (avatarPath, username) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    if (avatarPath.includes("/")) {
      return `http://127.0.0.1:8000${avatarPath}`;
    }
    return `http://127.0.0.1:8000/media/profiles/${avatarPath}`;
  };

  const showToast = (message, type = 'info', duration = 3000) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }

    setToast({ show: true, message, type, duration });

    toastTimeoutRef.current = setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, duration);
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
  };

  useEffect(() => {
    if (user) {
      loadPosts();
      fetchFollowCounts();
      loadFollowSuggestions();
    }
  }, [user, search]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Search functionality
  const handleUserSearch = async (query) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const results = await searchUsers(query);
      setSearchResults(results || []);
      setShowSearchResults(true);
      
      if (results.length === 0) {
        showToast('No users found', 'info');
      }
    } catch (error) {
      // console.error("Search failed:", error);
      setSearchResults([]);
      showToast(error.response?.data?.error || 'Failed to search users', 'error');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(() => {
        handleUserSearch(searchQuery);
      }, 500);
    } else {
      setShowSearchResults(false);
      setSearchResults([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  const handleShare = async (postID) => {
    const postUrl = `${window.location.origin}/post/${postID}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this post!",
          text: "Interesting post",
          url: postUrl,
        });
        showToast('Shared successfully!', 'success');
      } catch (err) {
        if (err.name !== 'AbortError') {
          showToast('Failed to share', 'error');
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(postUrl);
        showToast('Post link copied to clipboard!', 'success');
      } catch (err) {
        showToast('Failed to copy link', 'error');
      }
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
      showToast('Failed to load follow counts', 'error');
    }
  };

  const loadFollowSuggestions = async () => {
    setLoadingSuggestions(true);
    try {
      const data = await getFollowSuggestions();
      setSuggestions(data || []);
      if (data.length === 0) {
        showToast('No suggestions available', 'info');
      }
    } catch (error) {
      // console.error("Failed to load suggestions:", error);
      setSuggestions([]);
      showToast(error.response?.data?.error || 'Failed to load suggestions', 'error');
    } finally {
      setLoadingSuggestions(false);
    }
  };

  const loadPosts = async (url = null) => {
    if (!user) return;

    setPostsLoading(true);
    try {
      const data = await getPosts(search, url);
      setPosts(data.results || []);
      setNext(data.next);
      setPrevious(data.previous);
      
      if (data.results.length === 0 && search) {
        showToast('No posts found matching your search', 'info');
      }
    } catch (error) {
      // console.error("Failed to load posts:", error);
      showToast(error.response?.data?.error || 'Failed to load posts', 'error');
    } finally {
      setPostsLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!user) {
      showToast('Please login to like posts', 'info');
      navigate("/login");
      return;
    }

    try {
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? {
                ...post,
                is_liked: !post.is_liked,
                likes_count: post.is_liked
                  ? post.likes_count - 1
                  : post.likes_count + 1,
              }
            : post,
        ),
      );

      await LikePost(id);
    } catch (err) {
      // console.error("Failed to like post:", err);
      showToast(err.response?.data?.error || 'Failed to like post', 'error');

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === id
            ? {
                ...post,
                is_liked: !post.is_liked,
                likes_count: post.is_liked
                  ? post.likes_count + 1
                  : post.likes_count - 1,
              }
            : post,
        ),
      );
    }
  };

  const handleCommentSubmit = async (postId) => {
    if (!user) {
      showToast('Please login to comment', 'info');
      navigate("/login");
      return;
    }

    if (!commentText[postId]?.trim()) {
      showToast('Please enter a comment', 'info');
      return;
    }

    try {
      await CommentPost(postId, commentText[postId]);
      setCommentText((prev) => ({ ...prev, [postId]: "" }));
      loadPosts();
      showToast('Comment added successfully!', 'success');
    } catch (err) {
      // console.error("Failed to submit comment:", err);
      showToast(err.response?.data?.error || 'Failed to add comment', 'error');
    }
  };

  const handleCommentChange = (postId, value) => {
    setCommentText((prev) => ({ ...prev, [postId]: value }));
  };

  const toggleComments = (postId) => {
    setExpandedComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));
  };

  // Mobile menu handlers
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    document.body.style.overflow = !mobileMenuOpen ? 'hidden' : 'auto';
  };

  const toggleMobileFollow = () => {
    setShowMobileFollow(!showMobileFollow);
    document.body.style.overflow = !showMobileFollow ? 'hidden' : 'auto';
  };

  const closeMobileMenus = () => {
    setMobileMenuOpen(false);
    setShowMobileFollow(false);
    document.body.style.overflow = 'auto';
  };

  useEffect(() => {
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const handleCreatePost = () => {
    navigate("/post");
  };

  // Follow functionality
  const handleFollow = async (userId, username, isCurrentlyFollowing) => {
    if (!user) {
      showToast('Please login to follow users', 'info');
      navigate("/login");
      return;
    }

    setFollowLoading((prev) => ({ ...prev, [userId]: true }));

    // Optimistic update
    const updateOptimistic = (items) =>
      items.map((item) =>
        item.user_id === userId
          ? {
              ...item,
              is_following: !isCurrentlyFollowing,
              followers_count: isCurrentlyFollowing
                ? item.followers_count - 1
                : item.followers_count + 1,
            }
          : item
      );

    setSuggestions(updateOptimistic);
    setSearchResults(updateOptimistic);

    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
        showToast(`Unfollowed @${username}`, 'success');
      } else {
        await followUser(userId);
        showToast(`Now following @${username}`, 'success');
      }
      fetchFollowCounts();
    } catch (error) {
      // console.error("Follow action failed:", error);
      
      // Revert optimistic update
      const revertOptimistic = (items) =>
        items.map((item) =>
          item.user_id === userId
            ? {
                ...item,
                is_following: isCurrentlyFollowing,
                followers_count: isCurrentlyFollowing
                  ? item.followers_count + 1
                  : item.followers_count - 1,
              }
            : item
        );

      setSuggestions(revertOptimistic);
      setSearchResults(revertOptimistic);
      
      showToast(error.response?.data?.error || `Failed to ${isCurrentlyFollowing ? 'unfollow' : 'follow'} user`, 'error');
    } finally {
      setFollowLoading((prev) => ({ ...prev, [userId]: false }));
    }
  };

  // Avatar renderer
  const renderAvatar = (avatarPath, username, size = "medium") => {
    const avatarUrl = getAvatarUrl(avatarPath, username);

    return avatarUrl ? (
      <img
        src={avatarUrl}
        alt={username}
        className={`avatar-${size}`}
        onError={(e) => {
          e.target.style.display = "none";
          const parent = e.target.parentElement;
          const placeholder = document.createElement('div');
          placeholder.className = `avatar-placeholder ${size}`;
          placeholder.textContent = username?.[0]?.toUpperCase() || 'U';
          parent.appendChild(placeholder);
        }}
      />
    ) : (
      <div className={`avatar-placeholder ${size}`}>
        {username?.[0]?.toUpperCase() || 'U'}
      </div>
    );
  };

  // User item renderer
  const renderUserItem = (person, isSearchResult = false) => (
    <div key={person.id || person.user_id} className="follow-item">
      <div
        className="follow-avatar"
        onClick={() => {
          navigate(`/profile/${person.username}`);
          closeMobileMenus();
        }}
      >
        {renderAvatar(person.avatar, person.username, "small")}
      </div>
      <div
        className="follow-info"
        onClick={() => {
          navigate(`/profile/${person.username}`);
          closeMobileMenus();
        }}
      >
        <div className="follow-name">{person.username}</div>
        <div className="follow-email">@{person.username?.toLowerCase()}</div>
        {person.followers_count !== undefined && (
          <div className="follow-stats">
            {person.followers_count.toLocaleString()} followers
          </div>
        )}
      </div>
      <button
        className={`follow-btn ${person.is_following ? "following" : ""}`}
        onClick={() =>
          handleFollow(person.user_id, person.username, person.is_following)
        }
        disabled={followLoading[person.user_id]}
      >
        {followLoading[person.user_id] ? (
          <span className="btn-spinner"></span>
        ) : person.is_following ? (
          "Following"
        ) : (
          "Follow"
        )}
      </button>
    </div>
  );

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {toast.show && (
        <div className={`toast-notification toast-${toast.type}`} onClick={hideToast}>
          <div className="toast-icon">
            {toast.type === 'success' && <FiCheckCircle />}
            {toast.type === 'error' && <FiAlertCircle />}
            {toast.type === 'info' && <FiInfo />}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={hideToast}>
            <FiX />
          </button>
          <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
        </div>
      )}

      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
          {mobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        <div className="mobile-logo">
          <img src={logo} alt="SocialNest" />
        </div>
        <button className="mobile-follow-btn" onClick={toggleMobileFollow}>
          <FiUserPlus />
        </button>
      </div>

      {/* Desktop Navbar */}
      <div className="desktop-navbar">
        <div className="nav-right">
          <div className="logo-cover">
            <div className="logo">
              <img src={logo} alt="SocialNest Logo" />
            </div>
          </div>
          <div className="search-container-right">
            <div className="search-box">
              <input
                type="text"
                placeholder="Explore posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="nav-left">
          <div className="user-card" onClick={() => navigate(`/profile/${user.username}`)}>
            <div className="user-card-avatar">
              {renderAvatar(user.avatar, user.username, "small")}
            </div>
            <div className="user-card-info">
              <div className="user-card-name">{user.username}</div>
              <div className="user-card-email">
                @{user.username?.toLowerCase()}
              </div>
            </div>
            <button className="logout-btn" onClick={logout}>
              <FiLogOut />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar - Desktop Only */}
        <div className="sidebar-left">
          <div className="user-profile-card">
            <div className="profile-avatar-large">
              {renderAvatar(user.avatar, user.username, "large")}
            </div>
            <div className="profile-info" onClick={() => navigate(`/profile/${user.username}`)}>
              <h3>{user.username}</h3>
              <p>@{user.username?.toLowerCase()}</p>
            </div>
            <div className="profile-stats">
              <div className="stat-item">
                <span className="stat-value">{followersCount}</span>
                <span className="stat-label">Followers</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">{followingCount}</span>
                <span className="stat-label">Following</span>
              </div>
            </div>
            <button className="profile-btn" onClick={() => navigate("/my-posts/")}>
              My Profile
            </button>
          </div>
        </div>

        {/* Main Feed */}
        <div className="main-feed">
          {/* Create Post Card */}
          <div className="create-post-card">
            <div className="create-post-avatar">
              {renderAvatar(user.avatar, user.username, "small")}
            </div>
            <div className="create-post-content">
              <div
                className="create-post-input"
                onClick={() => navigate("/post/")}
              >
                What's happening?
              </div>
              <button onClick={() => navigate("/post/")}>Post</button>
            </div>
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {postsLoading ? (
              <div className="loading-feed">
                <div className="spinner"></div>
                <p>Loading posts...</p>
              </div>
            ) : posts.length > 0 ? (
              posts.map((post) => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <div
                      className="post-author-avatar"
                      onClick={() => navigate(`/profile/${post.user_name}`)}
                    >
                      {renderAvatar(post.user_avatar, post.user_name, "small")}
                    </div>
                    <div className="post-author-info">
                      <span
                        className="post-author-name"
                        onClick={() => navigate(`/profile/${post.user_name}`)}
                      >
                        {post.user_name}
                      </span>
                      <span className="post-time">
                        {new Date(post.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className="post-content">
                    <p>{post.content}</p>
                  </div>

                  {post.image && (
                    <div className="post-image">
                      <img
                        src={getImageUrl(post.image)}
                        alt="Post"
                        onError={(e) => {
                          e.target.style.display = "none";
                          showToast('Failed to load image', 'error');
                        }}
                      />
                    </div>
                  )}

                  <div className="post-actions">
                    <button
                      className={`action-btn ${post.is_liked ? "liked" : ""}`}
                      onClick={() => handleLike(post.id)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      <span>{post.likes_count || 0}</span>
                    </button>

                    <button className="action-btn">
                      <svg viewBox="0 0 24 24">
                        <path d="M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18z" />
                      </svg>
                      <span>{post.comments?.length || 0}</span>
                    </button>

                    <button
                      className="action-btn"
                      onClick={() => handleShare(post.id)}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L7.04 9.81C6.5 9.31 5.79 9 5 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z" />
                      </svg>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {post.comments?.length > 0 && (
                    <div className="post-comments">
                      {post.comments.slice(0, expandedComments[post.id] ? undefined : 2).map((comment) => (
                        <div key={comment.id} className="comment-item">
                          <div className="comment-avatar">
                            {renderAvatar(comment.user_avatar, comment.user, "tiny")}
                          </div>
                          <div className="comment-content">
                            <span className="comment-author">{comment.user}</span>
                            <p>{comment.text}</p>
                          </div>
                        </div>
                      ))}
                      
                      {post.comments.length > 2 && (
                        <button
                          className="show-more-comments"
                          onClick={() => toggleComments(post.id)}
                        >
                          {expandedComments[post.id]
                            ? "Show less"
                            : `Show ${post.comments.length - 2} more comments`}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Add Comment */}
                  <div className="add-comment">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={commentText[post.id] || ""}
                      onChange={(e) => handleCommentChange(post.id, e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleCommentSubmit(post.id)}
                    />
                    <button onClick={() => handleCommentSubmit(post.id)}>
                      Reply
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-feed">
                <h3>No posts yet</h3>
                <p>Be the first to post something!</p>
                <button onClick={handleCreatePost}>Create Post</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {(previous || next) && posts.length > 0 && (
            <div className="pagination">
              <button
                onClick={() => previous && loadPosts(previous)}
                disabled={!previous}
              >
                ← Previous
              </button>
              <button
                onClick={() => next && loadPosts(next)}
                disabled={!next}
              >
                Next →
              </button>
            </div>
          )}
        </div>

        {/* Right Sidebar - Desktop Only */}
        <div className="sidebar-right">
          <div className="follow-card">
            <h3>Who to follow</h3>

            {/* Search */}
            <div className="follow-search">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searching && <div className="small-spinner"></div>}
            </div>

            {showSearchResults ? (
              <div className="search-results">
                <div className="search-header">
                  <span>Results</span>
                  <button onClick={() => {
                    setSearchQuery("");
                    setShowSearchResults(false);
                  }}>Clear</button>
                </div>
                <div className="follow-list">
                  {searchResults.map((person) => renderUserItem(person, true))}
                </div>
              </div>
            ) : (
              <>
                {loadingSuggestions ? (
                  <div className="loading-state">
                    <div className="small-spinner"></div>
                    <p>Loading...</p>
                  </div>
                ) : suggestions.length > 0 ? (
                  <div className="follow-list">
                    {suggestions.slice(0, 5).map((person) => renderUserItem(person))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <p>No suggestions</p>
                  </div>
                )}
                <button className="show-more" onClick={loadFollowSuggestions}>
                  Refresh
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={closeMobileMenus}>
          <div className="mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <h3>Menu</h3>
              <button onClick={closeMobileMenus}>
                <FiX />
              </button>
            </div>

            <div className="mobile-menu-user">
              <div className="mobile-menu-avatar">
                {renderAvatar(user.avatar, user.username, "medium")}
              </div>
              <div className="mobile-menu-user-info">
                <h4>{user.username}</h4>
                <p>@{user.username?.toLowerCase()}</p>
              </div>
            </div>

            <div className="mobile-menu-items">
              <button onClick={() => { navigate('/'); closeMobileMenus(); }}>
                <FiHome /> Home
              </button>
              <button onClick={() => { navigate('/my-posts'); closeMobileMenus(); }}>
                <FiUser/>  Profile
              </button>
              <button onClick={() => { logout(); closeMobileMenus(); }}>
                <FiLogOut /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Follow Panel */}
      {showMobileFollow && (
        <div className="mobile-follow-overlay" onClick={closeMobileMenus}>
          <div className="mobile-follow-panel" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-follow-header">
              <h3>Who to follow</h3>
              <button onClick={closeMobileMenus}>
                <FiX />
              </button>
            </div>

            <div className="mobile-follow-search">
              <FiSearch />
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="mobile-follow-content">
              {searching ? (
                <div className="loading-state">
                  <div className="small-spinner"></div>
                </div>
              ) : showSearchResults ? (
                searchResults.length > 0 ? (
                  searchResults.map((person) => (
                    <div key={person.user_id} className="mobile-follow-item">
                      <div
                        className="mobile-follow-user"
                        onClick={() => {
                          navigate(`/profile/${person.username}`);
                          closeMobileMenus();
                        }}
                      >
                        <div className="mobile-follow-avatar">
                          {renderAvatar(person.avatar, person.username, "small")}
                        </div>
                        <div className="mobile-follow-info">
                          <div className="mobile-follow-name">{person.username}</div>
                          <div className="mobile-follow-email">
                            @{person.username?.toLowerCase()}
                          </div>
                        </div>
                      </div>
                      <button
                        className={`mobile-follow-btn-action ${person.is_following ? 'following' : ''}`}
                        onClick={() => handleFollow(
                          person.user_id,
                          person.username,
                          person.is_following
                        )}
                        disabled={followLoading[person.user_id]}
                      >
                        {followLoading[person.user_id] ? (
                          <span className="btn-spinner"></span>
                        ) : person.is_following ? (
                          'Following'
                        ) : (
                          'Follow'
                        )}
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <p>No users found</p>
                  </div>
                )
              ) : (
                suggestions.map((person) => (
                  <div key={person.user_id} className="mobile-follow-item">
                    <div
                      className="mobile-follow-user"
                      onClick={() => {
                        navigate(`/profile/${person.username}`);
                        closeMobileMenus();
                      }}
                    >
                      <div className="mobile-follow-avatar">
                        {renderAvatar(person.avatar, person.username, "small")}
                      </div>
                      <div className="mobile-follow-info">
                        <div className="mobile-follow-name">{person.username}</div>
                        <div className="mobile-follow-email">
                          @{person.username?.toLowerCase()}
                        </div>
                      </div>
                    </div>
                    <button
                      className={`mobile-follow-btn-action ${person.is_following ? 'following' : ''}`}
                      onClick={() => handleFollow(
                        person.user_id,
                        person.username,
                        person.is_following
                      )}
                      disabled={followLoading[person.user_id]}
                    >
                      {followLoading[person.user_id] ? (
                        <span className="btn-spinner"></span>
                      ) : person.is_following ? (
                        'Following'
                      ) : (
                        'Follow'
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
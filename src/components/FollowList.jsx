import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getFollowers, getFollowing, followUser, unfollowUser } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { 
  FaSearch, 
  FaArrowLeft, 
  FaArrowRight, 
  FaUser, 
  FaEnvelope, 
  FaCalendarAlt,
  FaUserPlus,
  FaUserCheck,
  FaTimes,
  FaSpinner,
  FaUsers,
  FaUserFriends
} from 'react-icons/fa';
import '../style/FollowList.css';

function FollowList({ type, onClose }) {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    has_next: false,
    has_previous: false,
    total_count: 0
  });
  const [followLoading, setFollowLoading] = useState({});

  // Fetch data when search or page changes
  useEffect(() => {
    fetchData();
  }, [type, search, pagination.current_page]);

  const fetchData = async () => {
    setLoading(true);
    try {
      let response;
      if (type === 'followers') {
        response = await getFollowers(search, pagination.current_page);
        setData(response.followers || []);
      } else {
        response = await getFollowing(search, pagination.current_page);
        setData(response.following || []);
      }
      
      setPagination({
        current_page: response.current_page || 1,
        total_pages: response.total_pages || 1,
        has_next: response.has_next || false,
        has_previous: response.has_previous || false,
        total_count: response.followers_count || response.following_count || 0
      });
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPagination(prev => ({ ...prev, current_page: 1 }));
    }, 500);
    
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleFollowToggle = async (userId, isCurrentlyFollowing) => {
    setFollowLoading(prev => ({ ...prev, [userId]: true }));
    
    try {
      if (isCurrentlyFollowing) {
        await unfollowUser(userId);
      } else {
        await followUser(userId);
      }
      
      // Update UI
      setData(prev =>
        prev.map(item =>
          item.user_id === userId
            ? { ...item, is_following: !isCurrentlyFollowing }
            : item
        )
      );
    } catch (error) {
      console.error('Follow action failed:', error);
    } finally {
      setFollowLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, current_page: newPage }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getAvatarUrl = (avatarPath, username) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    if (avatarPath.includes('/')) {
      return `http://127.0.0.1:8000${avatarPath}`;
    }
    return `http://127.0.0.1:8000/media/profiles/${avatarPath}`;
  };

  const formatJoinDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  };

  return (
    <div className="follow-list-overlay">
      <div className="follow-list-modal">
        {/* Header with gradient */}
        <div className="follow-list-header">
          <div className="header-content">
            <button className="back-button" onClick={onClose}>
              <FaArrowLeft />
            </button>
            <div className="header-title">
              <div className="title-icon">
                {type === 'followers' ? <FaUsers /> : <FaUserFriends />}
              </div>
              <h2>{type === 'followers' ? 'Followers' : 'Following'}</h2>
            </div>
            <span className="total-badge">{pagination.total_count}</span>
          </div>
          <button className="close-button" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {/* Search Section */}
        <div className="search-section">
          <div className="search-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder={`Search ${type}...`}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="search-input"
            />
            {searchInput && (
              <button 
                className="clear-search"
                onClick={() => setSearchInput('')}
              >
                <FaTimes />
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="follow-list-content">
          {loading ? (
            <div className="loading-state">
              <div className="spinner-container">
                <FaSpinner className="spinner" />
              </div>
              <p>Loading {type}...</p>
            </div>
          ) : data.length > 0 ? (
            <div className="users-grid">
              {data.map((person) => (
                <div key={person.user_id} className="user-card">
                  <div className="user-card-inner">
                    <div 
                      className="user-info"
                      onClick={() => {
                        navigate(`/profile/${person.username}`);
                        onClose();
                      }}
                    >
                      <div className="avatar-container">
                        {person.avatar ? (
                          <img
                            src={getAvatarUrl(person.avatar, person.username)}
                            alt={person.username}
                            className="avatar-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerHTML = `
                                <div class="avatar-fallback">
                                  ${person.username?.[0]?.toUpperCase()}
                                </div>
                              `;
                            }}
                          />
                        ) : (
                          <div className="avatar-fallback">
                            {person.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        {person.is_following && (
                          <div className="following-badge">
                            <FaUserCheck />
                          </div>
                        )}
                      </div>
                      
                      <div className="user-details">
                        <div className="user-name-wrapper">
                          <h3 className="user-name">{person.username}</h3>
                          {person.is_following && (
                            <span className="follows-you-badge">Follows you</span>
                          )}
                        </div>
                        
                        <div className="user-meta">
                          {person.email && (
                            <div className="meta-item">
                              <FaEnvelope className="meta-icon" />
                              <span className="meta-text">{person.email}</span>
                            </div>
                          )}
                          {person.joined_date && (
                            <div className="meta-item">
                              <FaCalendarAlt className="meta-icon" />
                              <span className="meta-text">
                                Joined {formatJoinDate(person.joined_date)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Follow/Unfollow Button */}
                    {person.user_id !== user?.id && (
                      <div className="action-container">
                        <button
                          className={`follow-action ${person.is_following ? 'following' : ''}`}
                          onClick={() => handleFollowToggle(person.user_id, person.is_following)}
                          disabled={followLoading[person.user_id]}
                        >
                          {followLoading[person.user_id] ? (
                            <FaSpinner className="button-spinner" />
                          ) : person.is_following ? (
                            <>
                              <FaUserCheck /> Following
                            </>
                          ) : (
                            <>
                              <FaUserPlus /> Follow
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-icon-wrapper">
                {type === 'followers' ? <FaUsers /> : <FaUserFriends />}
              </div>
              <h3>No {type} yet</h3>
              <p>
                {type === 'followers' 
                  ? "You don't have any followers yet. Share your profile to connect with others!"
                  : "You aren't following anyone yet. Discover interesting people to follow!"}
              </p>
              {type === 'following' && (
                <button 
                  className="explore-btn"
                  onClick={() => {
                    onClose();
                    navigate('/');
                  }}
                >
                  Explore People
                </button>
              )}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && data.length > 0 && pagination.total_pages > 1 && (
          <div className="pagination-section">
            <div className="pagination-wrapper">
              <button
                className="page-nav"
                onClick={() => handlePageChange(pagination.current_page - 1)}
                disabled={!pagination.has_previous}
              >
                <FaArrowLeft />
              </button>
              
              <div className="page-info">
                <span className="current-page">{pagination.current_page}</span>
                <span className="page-separator">/</span>
                <span className="total-pages">{pagination.total_pages}</span>
              </div>
              
              <button
                className="page-nav"
                onClick={() => handlePageChange(pagination.current_page + 1)}
                disabled={!pagination.has_next}
              >
                <FaArrowRight />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FollowList;
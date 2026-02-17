import React, { useState, useContext, useEffect,  } from 'react';
import { AuthContext } from '../context/AuthContext';
import axiosInstance, { getUserProfile } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { FaCamera } from 'react-icons/fa';
import '../style/EditProfile.css';

function EditProfile() {
  const { user, refreshUser } = useContext(AuthContext);  // ✅ Use refreshUser
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    bio: '',
    avatar: null
  });
  
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // Load current profile data
    const loadProfile = async () => {
      if (!user?.username) return;
      
      try {
        setLoading(true);
        const data = await getUserProfile(user.username);
        setFormData(prev => ({
          ...prev,
          bio: data.bio || ''
        }));
      } catch (error) {
        // console.error('Failed to load profile:', error);
        setError('Failed to load profile data', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadProfile();
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        setError('Image size must be less than 2MB');
        return;
      }
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      
      setFormData({
        ...formData,
        avatar: file
      });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    try {
      const formDataToSend = new FormData();
      
      // Only append if bio has changed
      if (formData.bio !== undefined) {
        formDataToSend.append('bio', formData.bio);
      }
      
      // Only append if new avatar is selected
      if (formData.avatar) {
        formDataToSend.append('avatar', formData.avatar);
      }
      
      // Send PATCH request to update profile
      await axiosInstance.patch('/update-profile/', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      // console.log('Profile updated:', response.data);
      
      // ✅ Refresh user data in context
      await refreshUser();
      
      setSuccess('Profile updated successfully!');
      
      // Navigate after short delay to show success message
      setTimeout(() => {
        navigate('/my-posts');
      }, 1500);
      
    } catch (error) {
      // console.error('Failed to update profile:', error);
      setError(error.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Function to get avatar URL
  const getAvatarUrl = (avatarPath) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith('http')) return avatarPath;
    if (avatarPath.startsWith('/media/')) {
      return `http://127.0.0.1:8000${avatarPath}`;
    }
    return `http://127.0.0.1:8000/media/profiles/${avatarPath}`;
  };

  return (
    <div className="edit-profile-container">
      <div className="edit-profile-card">
        <h2>Edit Profile</h2>
        <p className="subtitle">Update your profile information</p>

        <button 
              type="submit" 
              className="btn-change-password"
              onClick={()=>navigate('/change-password')}
            >
              Change Password
            </button>
        
        {error && (
          <div className="error-message">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {success}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {/* Avatar Upload Section */}
          <div className="avatar-upload-section">
            <div className="current-avatar">
              {preview ? (
                <img src={preview} alt="Preview" className="avatar-preview" />
              ) : user?.avatar ? (
                <img 
                  src={getAvatarUrl(user.avatar)} 
                  alt={user.username} 
                  className="avatar-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="avatar-placeholder">
                        ${user.username?.[0]?.toUpperCase() || 'U'}
                      </div>
                    `;
                  }}
                />
              ) : (
                <div className="avatar-placeholder">
                  {user?.username?.[0]?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
            
            <div className="upload-controls">
              <label htmlFor="avatar-upload" className="upload-btn">
                <FaCamera /> Change Avatar
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <small className="upload-hint">
                Max size: 2MB. JPG, PNG, GIF
              </small>
            </div>
          </div>
          
          {/* Bio Field */}
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about yourself..."
              rows="4"
              maxLength="500"
              className="bio-textarea"
              disabled={loading}
            />
            <div className="char-counter">
              <span className={formData.bio?.length >= 500 ? 'char-limit' : ''}>
                {formData.bio?.length || 0}/500
              </span>
            </div>
          </div>
          
          {/* Form Actions */}
          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => navigate('/my-posts')}
              className="btn-cancel"
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-save"
              disabled={loading || (!formData.bio && !formData.avatar)}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
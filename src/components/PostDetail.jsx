import { useState, useEffect, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addPost, updatePost, getPostDetail } from "../services/PostsApi";
import { AuthContext } from "../context/AuthContext";
import { 
  FaEdit, 
  FaImage, 
  FaHeart, 
  FaComment, 
  FaShare, 
  FaUser,
  FaRocket,
  FaCheckCircle,
  FaLightbulb,
  FaTimesCircle,
  FaUpload,
  FaTrash,
  FaEye,
  FaTimes,
  FaExclamationTriangle,
  FaInfoCircle
} from "react-icons/fa";
import "../style/PostDetail.css";

function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const isEdit = Boolean(id);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info',
    duration: 4000
  });

  const fileInputRef = useRef(null);
  const toastTimeoutRef = useRef(null);


  const imageConfig = {
    maxSizeMB: 10,
    allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxWidth: 3840,
    maxHeight: 2160,
    minWidth: 100,
    minHeight: 100
  };


  const showToast = (message, type = 'info', duration = 4000) => {
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
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Get user avatar URL
  const getAvatarUrl = (avatarPath, username) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    if (avatarPath.includes("/")) {
      return `http://127.0.0.1:8000${avatarPath}`;
    }
    return `http://127.0.0.1:8000/media/profiles/${avatarPath}`;
  };

  useEffect(() => {
    if (isEdit) {
      showToast("Loading post data...", "info", 2000);
      getPostDetail(id).then((post) => {
        setTitle(post.title);
        setContent(post.content);
        if (post.image) {
          const imageUrl = post.image.startsWith('http') 
            ? post.image 
            : `http://127.0.0.1:8000${post.image}`;
          setPreview(imageUrl);
          showToast("Post loaded successfully", "success", 2000);
        }
      }).catch((error) => {
        showToast(error.response?.data?.error || "Failed to load post", "error");
      });
    }
  }, [id, isEdit]);

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!title.trim()) {
      newErrors.title = "Title is required";
      showToast("Title is required", "warning");
    } else if (title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
      showToast("Title must be at least 3 characters", "warning");
    } else if (title.length > 200) {
      newErrors.title = "Title must be less than 200 characters";
      showToast("Title must be less than 200 characters", "warning");
    }
    
    if (!content.trim()) {
      newErrors.content = "Content is required";
      showToast("Content is required", "warning");
    } else if (content.length < 10) {
      newErrors.content = "Content must be at least 10 characters";
      showToast("Content must be at least 10 characters", "warning");
    } else if (content.length > 5000) {
      newErrors.content = "Content must be less than 5000 characters";
      showToast("Content must be less than 5000 characters", "warning");
    }
    
    return newErrors;
  };

  // Validate image file
  const validateImage = (file) => {
    const newErrors = {};
    
    if (!file) return newErrors;
    
    if (!imageConfig.allowedTypes.includes(file.type)) {
      newErrors.image = "Only JPEG, PNG, GIF and WebP images are allowed";
      showToast("Only JPEG, PNG, GIF and WebP images are allowed", "warning");
      return newErrors;
    }
    
    const maxSizeBytes = imageConfig.maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      newErrors.image = `Image size should be less than ${imageConfig.maxSizeMB}MB`;
      showToast(`Image size should be less than ${imageConfig.maxSizeMB}MB`, "warning");
      return newErrors;
    }
    
    return newErrors;
  };

  // Handle image selection
  const handleImageSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setErrors(prev => ({ ...prev, image: undefined }));
    
    const basicErrors = validateImage(file);
    if (Object.keys(basicErrors).length > 0) {
      setErrors(prev => ({ ...prev, ...basicErrors }));
      return;
    }
    
    try {
      const previewUrl = URL.createObjectURL(file);
      setPreview(previewUrl);
      setImage(file);
      showToast("Image selected successfully", "success", 2000);
    } catch (error) {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Failed to process image. Please try another.' 
      }));
      showToast("Failed to process image", "error");
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragging');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragging');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const fakeEvent = { target: { files: [file] } };
      handleImageSelect(fakeEvent);
    } else {
      setErrors(prev => ({ 
        ...prev, 
        image: 'Please drop an image file' 
      }));
      showToast("Please drop an image file", "warning");
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    if (preview && preview.startsWith('blob:')) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setErrors(prev => ({ ...prev, image: undefined }));
    showToast("Image removed", "info", 2000);
  };

  // Trigger file input
  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  // Handle form submission
  const handleSubmit = async () => {
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      
      if (image) {
        formData.append("image", image);
      }
      
      if (isEdit && !image && preview === null) {
        formData.append("image", "");
      }
      
      if (isEdit) {
        await updatePost(id, formData);
        showToast("Post updated successfully!", "success", 3000);
        setTimeout(() => navigate("/"), 2000);
      } else {
        await addPost(formData);
        showToast("Post created successfully!", "success", 3000);
        setTimeout(() => navigate("/"), 2000);
      }
      
    } catch (err) {
      if (err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};
        
        if (serverErrors.title) {
          const msg = Array.isArray(serverErrors.title) 
            ? serverErrors.title[0] 
            : serverErrors.title;
          formattedErrors.title = msg;
          showToast(msg, "error");
        }
        
        if (serverErrors.content) {
          const msg = Array.isArray(serverErrors.content) 
            ? serverErrors.content[0] 
            : serverErrors.content;
          formattedErrors.content = msg;
          showToast(msg, "error");
        }
        
        if (serverErrors.image) {
          const msg = Array.isArray(serverErrors.image) 
            ? serverErrors.image[0] 
            : serverErrors.image;
          formattedErrors.image = msg;
          showToast(msg, "error");
        }
        
        if (serverErrors.detail) {
          showToast(serverErrors.detail, "error");
        }
        
        if (Object.keys(formattedErrors).length > 0) {
          setErrors(formattedErrors);
        }
      } else {
        showToast(err.message || "Failed to save post", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel with confirmation
  const handleCancel = () => {
    if (title || content || image) {
      showToast("Changes discarded", "info", 2000);
    }
    navigate("/");
  };

  // Character counters
  const titleLength = title.length;
  const contentLength = content.length;

  // Format current time
  const currentTime = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className="post-detail-creative-container">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`toast-notification-postdetail toast-${toast.type}`} 
          onClick={hideToast}
        >
          <div className="toast-icon">
            {toast.type === 'success' && <FaCheckCircle />}
            {toast.type === 'error' && <FaExclamationTriangle />}
            {toast.type === 'warning' && <FaExclamationTriangle />}
            {toast.type === 'info' && <FaInfoCircle />}
          </div>
          <div className="toast-message">{toast.message}</div>
          <button className="toast-close" onClick={hideToast}>
            <FaTimes />
          </button>
          <div className="toast-progress" style={{ animationDuration: `${toast.duration}ms` }} />
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="floating-elements">
        <div className="floating-icon floating-icon-1"><FaImage /></div>
        <div className="floating-icon floating-icon-2"><FaHeart /></div>
        <div className="floating-icon floating-icon-3"><FaComment /></div>
        <div className="floating-icon floating-icon-4"><FaShare /></div>
      </div>

      {/* Two Column Layout */}
      <div className="post-detail-two-column">
        
        {/* LEFT COLUMN - Post Creation Form */}
        <div className="post-form-column">
          <div className="post-header">
            <h2>
              {isEdit ? <FaEdit /> : <FaRocket />}
              {isEdit ? "Edit Post" : "Create Post"}
            </h2>
            {isEdit && (
              <span className="edit-badge">
                <FaEdit /> Editing
              </span>
            )}
          </div>
          
          <div className="post-form">
            {/* Title Field */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                <span>
                  <FaRocket /> Title *
                </span>
                <span className={`char-counter ${titleLength > 200 ? 'error' : ''}`}>
                  {titleLength}/200
                </span>
              </label>
              <input
                id="title"
                type="text"
                placeholder="Give your post a catchy title..."
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (errors.title) setErrors(prev => ({ ...prev, title: undefined }));
                }}
                className={`form-input ${errors.title ? 'error' : ''}`}
                maxLength={200}
              />
              {errors.title && (
                <div className="error-message">{errors.title}</div>
              )}
            </div>
            
            {/* Content Field */}
            <div className="form-group">
              <label htmlFor="content" className="form-label">
                <span>
                  <FaEdit /> Content *
                </span>
                <span className={`char-counter ${contentLength > 5000 ? 'error' : ''}`}>
                  {contentLength}/5000
                </span>
              </label>
              <textarea
                id="content"
                placeholder="What would you like to share today?"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (errors.content) setErrors(prev => ({ ...prev, content: undefined }));
                }}
                className={`form-textarea ${errors.content ? 'error' : ''}`}
                rows={6}
                maxLength={5000}
              />
              {errors.content && (
                <div className="error-message">{errors.content}</div>
              )}
            </div>
            
            {/* Image Upload Section */}
            <div className="form-group">
              <label className="form-label">
                <span>
                  <FaImage /> Add Image
                </span>
                <span className="optional-label">Optional</span>
              </label>
              
              <div 
                className={`image-upload-area ${preview ? 'has-preview' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={!preview ? triggerFileInput : undefined}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleImageSelect}
                  accept="image/*"
                  className="file-input"
                />
                
                {!preview ? (
                  <div className="upload-placeholder">
                    <FaUpload className="upload-icon" />
                    <p className="upload-text">
                      Click or drag image to upload
                    </p>
                    <p className="upload-hint">
                      Supports: JPEG, PNG, GIF, WebP (Max {imageConfig.maxSizeMB}MB)
                    </p>
                  </div>
                ) : (
                  <div className="image-preview-container">
                    <img 
                      src={preview} 
                      alt="Preview" 
                      className="image-preview"
                    />
                    <div className="preview-overlay">
                      <button
                        type="button"
                        className="overlay-btn change-btn"
                        onClick={triggerFileInput}
                      >
                        <FaUpload /> Change
                      </button>
                      <button
                        type="button"
                        className="overlay-btn remove-btn"
                        onClick={handleRemoveImage}
                      >
                        <FaTrash /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {errors.image && (
                <div className="error-message">{errors.image}</div>
              )}
              
              {preview && image && (
                <div className="image-info">
                  <FaImage />
                  <span>{image.name}</span>
                  <span>•</span>
                  <span>{(image.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
              <button
                onClick={handleCancel}
                type="button"
                className="btn btn-secondary"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner"></span>
                    {isEdit ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    {isEdit ? "Update Post" : "Publish Post"}
                    <FaRocket />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* RIGHT COLUMN - Live Post Preview */}
        <div className="post-preview-column">
          <div className="preview-card">
            <div className="preview-header">
              <h3>
                <FaEye /> Live Preview
              </h3>
              <span className="preview-badge">
                {title ? 'Ready to post' : 'Draft'}
              </span>
            </div>
            
            {title || content || preview ? (
              <div className="post-preview-card">
                <div className="preview-user">
                  <div className="preview-avatar">
                    {user?.avatar ? (
                      <img 
                        src={getAvatarUrl(user.avatar, user.username)} 
                        alt={user.username} 
                        onError={() => showToast("Failed to load avatar", "error")}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {user?.username ? user.username[0].toUpperCase() : 'U'}
                      </div>
                    )}
                  </div>
                  <div className="preview-user-info">
                    <div className="preview-username">
                      {user?.username || 'Your Name'}
                      <FaCheckCircle className="verified-badge" />
                    </div>
                    <div className="preview-handle">
                      @{user?.username?.toLowerCase() || 'username'}
                      <span className="preview-time">
                        {currentTime}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="preview-post-content">
                  {title && (
                    <h4 className="preview-post-title">{title}</h4>
                  )}
                  {content ? (
                    <p>{content}</p>
                  ) : (
                    <p style={{ color: 'var(--text-gray)', fontStyle: 'italic' }}>
                      Your post content will appear here...
                    </p>
                  )}
                </div>
                
                {preview && (
                  <div className="preview-post-image">
                    <img 
                      src={preview} 
                      alt="Post preview" 
                      onError={() => showToast("Failed to load preview image", "error")}
                    />
                  </div>
                )}
                
                <div className="preview-stats">
                  <div className="stat-item">
                    <FaHeart />
                    <span><span className="stat-number">0</span> likes</span>
                  </div>
                  <div className="stat-item">
                    <FaComment />
                    <span><span className="stat-number">0</span> comments</span>
                  </div>
                  <div className="stat-item">
                    <FaShare />
                    <span><span className="stat-number">0</span> shares</span>
                  </div>
                </div>
                
                <div className="preview-actions">
                  <div className="preview-action">
                    <FaHeart /> Like
                  </div>
                  <div className="preview-action">
                    <FaComment /> Comment
                  </div>
                  <div className="preview-action">
                    <FaShare /> Share
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-preview">
                <div className="empty-preview-icon">
                  <FaRocket />
                </div>
                <h4>Your post preview</h4>
                <p>Start writing to see how your post will look!</p>
              </div>
            )}
          </div>
          
          {/* Tips Card */}
          <div className="tips-card">
            <div className="tips-header">
              <FaLightbulb />
              <h4>Tips for great posts</h4>
            </div>
            <ul className="tips-list">
              <li><FaCheckCircle /> Use a catchy title to grab attention</li>
              <li><FaCheckCircle /> Add images to increase engagement</li>
              <li><FaCheckCircle /> Keep your content clear and concise</li>
              <li><FaCheckCircle /> Ask questions to encourage comments</li>
              <li><FaCheckCircle /> Proofread before publishing</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Background Particles */}
      <div className="particles-container">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              width: `${Math.random() * 4 + 2}px`,
              height: `${Math.random() * 4 + 2}px`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default PostDetail;
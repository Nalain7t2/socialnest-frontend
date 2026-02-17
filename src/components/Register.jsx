import React, { useContext, useState, useEffect, useRef } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import ImageUploader from "../components/ImageUploader";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaCamera,
  FaHeart,
  FaComment,
  FaShare,
  FaCheckCircle,
  FaShieldAlt,
  FaRocket,
  FaUsers,
  FaImage,
  FaTimes,
  FaInfoCircle,
  FaExclamationTriangle,
} from "react-icons/fa";
import logo_by_name from "../images/logo_by_name.png";
import "../style/Register.css";

function Register() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [bio, setBio] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info', 
    duration: 4000
  });

  const { register } = useContext(AuthContext);
  const navigate = useNavigate();
  const toastTimeoutRef = useRef(null);

  // Calculate password strength
  useEffect(() => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    setPasswordStrength(Math.min(strength, 100));
  }, [password]);

  // Cleanup toast timeout
  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

  // Toast notification handler
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

  // Validate form
  const validateForm = () => {
    const errors = {};

    if (!username.trim()) {
      errors.username = "Username is required";
      showToast("Username is required", "warning");
    } else if (username.length < 3) {
      errors.username = "Username must be at least 3 characters";
      showToast("Username must be at least 3 characters", "warning");
    } else if (username.length > 30) {
      errors.username = "Username must be less than 30 characters";
      showToast("Username must be less than 30 characters", "warning");
    } else if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      errors.username = "Username can only contain letters, numbers and underscores";
      showToast("Username can only contain letters, numbers and underscores", "warning");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errors.email = "Email is required";
      showToast("Email is required", "warning");
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
      showToast("Please enter a valid email address", "warning");
    }

    if (!password) {
      errors.password = "Password is required";
      showToast("Password is required", "warning");
    } else if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      showToast("Password must be at least 8 characters", "warning");
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = "Password must contain uppercase, lowercase and numbers";
      showToast("Password must contain uppercase, lowercase and numbers", "warning");
    }

    if (!confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      showToast("Passwords do not match", "warning");
    }

    return errors;
  };

  const handleImageSelect = (file, previewUrl) => {
    setProfileImage(file);
    setImagePreview(previewUrl);
    if (formErrors.image) {
      setFormErrors((prev) => ({ ...prev, image: undefined }));
    }
    showToast("Image selected successfully", "success", 2000);
  };

  const handleSubmit = async () => {
    const errors = validateForm();

    if (profileImage) {
      if (profileImage.size > 5 * 1024 * 1024) {
        errors.image = "Image size must be less than 5MB";
        showToast("Image size must be less than 5MB", "warning");
      }
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(profileImage.type)) {
        errors.image = "Only JPEG, PNG, GIF and WebP images are allowed";
        showToast("Only JPEG, PNG, GIF and WebP images are allowed", "warning");
      }
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("username", username.trim());
      formData.append("email", email.trim());
      formData.append("password", password);
      formData.append("confirm_password", confirmPassword);
      formData.append("bio", bio.trim());

      if (profileImage) {
        formData.append("profile_image", profileImage);
      }

      await register(formData);
      
      // Show success toast
      showToast("Account created successfully! Redirecting...", "success", 3000);
      
      // Redirect after toast
      setTimeout(() => {
        navigate("/");
      }, 2000);
      
    } catch (err) {
      if (err.response?.data) {
        const serverErrors = err.response.data;
        const formattedErrors = {};

        // Show error toasts for each server error
        if (serverErrors.username) {
          const msg = Array.isArray(serverErrors.username)
            ? serverErrors.username[0]
            : serverErrors.username;
          formattedErrors.username = msg;
          showToast(msg, "error");
        }
        if (serverErrors.email) {
          const msg = Array.isArray(serverErrors.email)
            ? serverErrors.email[0]
            : serverErrors.email;
          formattedErrors.email = msg;
          showToast(msg, "error");
        }
        if (serverErrors.password) {
          const msg = Array.isArray(serverErrors.password)
            ? serverErrors.password[0]
            : serverErrors.password;
          formattedErrors.password = msg;
          showToast(msg, "error");
        }
        if (serverErrors.confirm_password) {
          const msg = Array.isArray(serverErrors.confirm_password)
            ? serverErrors.confirm_password[0]
            : serverErrors.confirm_password;
          formattedErrors.confirmPassword = msg;
          showToast(msg, "error");
        }
        if (serverErrors.profile_image) {
          const msg = Array.isArray(serverErrors.profile_image)
            ? serverErrors.profile_image[0]
            : serverErrors.profile_image;
          formattedErrors.image = msg;
          showToast(msg, "error");
        }
        if (serverErrors.error) {
          formattedErrors.general = serverErrors.error;
          showToast(serverErrors.error, "error");
        }
        if (serverErrors.detail) {
          showToast(serverErrors.detail, "error");
        }

        if (Object.keys(formattedErrors).length > 0) {
          setFormErrors(formattedErrors);
        }
      } else {
        showToast("Network error. Please check your connection.", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-creative-container">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`toast-notification-register toast-${toast.type}`} 
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

      {/* Two Column Layout */}
      <div className="register-two-column">
        {/* LEFT COLUMN - Registration Form */}
        <div className="register-form-column">
          <div className="register-header">
            <div className="logo-container">
              <img
                src={logo_by_name}
                alt="SocialNest"
                className="logo-image-only"
              />
            </div>
            <h2>Create Account</h2>
            <p className="welcome-text">Join our community today</p>
          </div>

          {formErrors.general && (
            <div className="alert alert-danger">{formErrors.general}</div>
          )}

          <div className="register-form">
            <div className="form-group">
              <label>
                <FaUser /> Username *
              </label>
              <input
                type="text"
                value={username}
                placeholder="Choose a username"
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (formErrors.username) {
                    setFormErrors((prev) => ({ ...prev, username: undefined }));
                  }
                }}
                className={formErrors.username ? "error" : ""}
              />
              {formErrors.username && (
                <div className="error-message">{formErrors.username}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaEnvelope /> Email *
              </label>
              <input
                type="email"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (formErrors.email) {
                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }}
                className={formErrors.email ? "error" : ""}
              />
              {formErrors.email && (
                <div className="error-message">{formErrors.email}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaUser /> Bio (Optional)
              </label>
              <textarea
                placeholder="Tell us about yourself..."
                value={bio}
                maxLength={500}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
              />
              <div className="bio-hint">{bio.length}/500 characters</div>
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Password *
              </label>
              <input
                type="password"
                value={password}
                placeholder="Create a password"
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (formErrors.password) {
                    setFormErrors((prev) => ({ ...prev, password: undefined }));
                  }
                  if (
                    formErrors.confirmPassword &&
                    e.target.value === confirmPassword
                  ) {
                    setFormErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                className={formErrors.password ? "error" : ""}
              />
              {password && (
                <div className="password-strength">
                  <div className="strength-bar">
                    <div
                      className="strength-fill"
                      style={{
                        width: `${passwordStrength}%`,
                        background:
                          passwordStrength < 50
                            ? "#ef4444"
                            : passwordStrength < 75
                              ? "#f59e0b"
                              : "#10b981",
                      }}
                    ></div>
                  </div>
                  <span className="strength-text">
                    {passwordStrength < 50
                      ? "Weak"
                      : passwordStrength < 75
                        ? "Medium"
                        : "Strong"}{" "}
                    password
                  </span>
                </div>
              )}
              {formErrors.password && (
                <div className="error-message">{formErrors.password}</div>
              )}
              <div className="password-hint">
                Min. 8 characters with uppercase, lowercase & numbers
              </div>
            </div>

            <div className="form-group">
              <label>
                <FaLock /> Confirm Password *
              </label>
              <input
                type="password"
                value={confirmPassword}
                placeholder="Confirm your password"
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (formErrors.confirmPassword) {
                    setFormErrors((prev) => ({
                      ...prev,
                      confirmPassword: undefined,
                    }));
                  }
                }}
                className={formErrors.confirmPassword ? "error" : ""}
              />
              {formErrors.confirmPassword && (
                <div className="error-message">{formErrors.confirmPassword}</div>
              )}
            </div>

            <div className="form-group">
              <label>
                <FaImage /> Profile Picture (Optional)
              </label>
              <div className="image-uploader-wrapper">
                <ImageUploader
                  onImageSelect={handleImageSelect}
                  initialImage={imagePreview}
                  maxSizeMB={5}
                  circular={true}
                  aspectRatio={{ width: 1, height: 1 }}
                  minWidth={100}
                  minHeight={100}
                />
              </div>
              {formErrors.image && (
                <div className="error-message">{formErrors.image}</div>
              )}
              <div className="image-hint">
                Square image recommended (400x400px). JPG, PNG or WebP
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="submit-btn"
            >
              {isSubmitting ? (
                <>
                  <span className="loading-spinner"></span>
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </button>

            <div className="login-link">
              Already have an account?
              <button onClick={() => navigate("/login")} className="link-btn">
                Sign In
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN - Live Preview */}
        <div className="preview-column">
          <div className="preview-card">
            <div className="preview-header">
              <h3>
                <FaRocket /> Live Preview
              </h3>
              <span className="preview-badge">
                {username ? "@" + username : "Not signed in"}
              </span>
            </div>

            {username || email || imagePreview ? (
              <div className="post-preview-card">
                <div className="preview-user">
                  <div className="preview-avatar">
                    {imagePreview ? (
                      <img src={imagePreview} alt={username} />
                    ) : (
                      <div className="avatar-placeholder">
                        {username ? username[0].toUpperCase() : "U"}
                      </div>
                    )}
                  </div>
                  <div className="preview-user-info">
                    <div className="preview-username">
                      {username || "Your Username"}
                      {username && <FaCheckCircle className="verified-badge" />}
                    </div>
                    <div className="preview-handle">
                      @{username ? username.toLowerCase() : "username"}
                      <span className="preview-time">Just now</span>
                    </div>
                  </div>
                </div>

                <div className="preview-content">
                  <div className="preview-bio">
                    {email ? (
                      <>
                        👋 Hey everyone! I just joined SocialNest as{" "}
                        <strong>@{username || "newuser"}</strong>. Excited to
                        connect with you all! ✨
                      </>
                    ) : (
                      "Your profile preview will appear here. Fill in the form to see your live preview!"
                    )}
                  </div>

                  <div className="preview-stats">
                    <div className="stat-item">
                      <FaUsers />
                      <span>
                        <span className="stat-number">0</span> followers
                      </span>
                    </div>
                    <div className="stat-item">
                      <FaHeart />
                      <span>
                        <span className="stat-number">0</span> likes
                      </span>
                    </div>
                    <div className="stat-item">
                      <FaShieldAlt />
                      <span>New account</span>
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
              </div>
            ) : (
              <div className="empty-preview">
                <div className="empty-preview-icon">
                  <FaRocket />
                </div>
                <h4>Your profile preview</h4>
                <p>Start filling the form to see how your profile will look!</p>
              </div>
            )}
          </div>

          {/* Tips Card */}
          <div className="tips-card">
            <div className="tips-header">
              <FaShieldAlt />
              <h4>Why join SocialNest?</h4>
            </div>
            <ul className="tips-list">
              <li>
                <FaCheckCircle /> Connect with like-minded people
              </li>
              <li>
                <FaCheckCircle /> Share your thoughts and creativity
              </li>
              <li>
                <FaCheckCircle /> Discover trending content
              </li>
              <li>
                <FaCheckCircle /> Join communities that matter to you
              </li>
              <li>
                <FaCheckCircle /> Privacy-first social experience
              </li>
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
              height: `${Math.random() * 4 + 2}px`,
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default Register;
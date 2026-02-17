import React, { useState, useContext, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { 
  FaTrash, 
  FaExclamationTriangle, 
  FaLock, 
  FaArrowLeft,
  FaShieldAlt,
  FaTimes,
  FaHeart,
  FaUser,
  FaCheckCircle,
  FaInfoCircle
} from "react-icons/fa";
import "../style/DeleteAccount.css";

function DeleteAccount() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info', 
    duration: 4000
  });

  const navigate = useNavigate();
  const { delete_account } = useContext(AuthContext);
  const toastTimeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) {
        clearTimeout(toastTimeoutRef.current);
      }
    };
  }, []);

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

  const validatePassword = () => {
    if (!password) {
      setPasswordError("Password is required");
      showToast("Password is required", "warning");
      return false;
    }
    if (password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      showToast("Password must be at least 6 characters", "warning");
      return false;
    }
    setPasswordError("");
    return true;
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (passwordError) setPasswordError("");
  };

  const handleDeleteClick = () => {
    if (!validatePassword()) return;
    setShowConfirmModal(true);
    showToast("Please confirm account deletion", "warning", 3000);
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await delete_account(password);
      showToast("Account deleted successfully", "success", 3000);
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Account deletion failed";
      showToast(errorMsg, "error");
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate("/my-posts");
    showToast("Account deletion cancelled", "info", 2000);
  };

  return (
    <div className="delete-account-creative-container">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`toast-notification-delete toast-${toast.type}`} 
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
        <div className="floating-icon floating-icon-1"><FaShieldAlt /></div>
        <div className="floating-icon floating-icon-2"><FaExclamationTriangle /></div>
        <div className="floating-icon floating-icon-3"><FaLock /></div>
        <div className="floating-icon floating-icon-4"><FaTrash /></div>
      </div>

      {/* Delete Account Card */}
      <div className="delete-account-card">
        {/* Warning Icon */}
        <div className="warning-icon-container">
          <div className="warning-icon-wrapper">
            <FaExclamationTriangle className="warning-icon" />
          </div>
        </div>

        {/* Header */}
        <div className="delete-account-header">
          <h2>Delete Account</h2>
          <p className="delete-account-subtitle">
            This action is <span className="highlight-danger">permanent</span> and cannot be undone.
          </p>
        </div>

        {/* Warning List */}
        <div className="warning-list">
          <div className="warning-item">
            <FaTrash className="warning-item-icon" />
            <span className="warning-item-text">
              <strong>All your posts</strong> will be permanently deleted
            </span>
          </div>
          <div className="warning-item">
            <FaHeart className="warning-item-icon" />
            <span className="warning-item-text">
              <strong>Your likes and comments</strong> will be removed
            </span>
          </div>
          <div className="warning-item">
            <FaUser className="warning-item-icon" />
            <span className="warning-item-text">
              <strong>Your profile</strong> will be inaccessible
            </span>
          </div>
          <div className="warning-item">
            <FaLock className="warning-item-icon" />
            <span className="warning-item-text">
              <strong>Username will become available</strong> for others
            </span>
          </div>
        </div>

        {/* Password Input */}
        <div className="form-group">
          <label className="form-label">
            <FaLock /> Confirm Your Password
          </label>
          <div className="password-input-container">
            <FaLock className="password-icon" />
            <input
              type="password"
              className={`password-input ${passwordError ? 'error' : ''}`}
              placeholder="Enter your password to confirm"
              value={password}
              onChange={handlePasswordChange}
              onBlur={validatePassword}
              autoFocus
            />
          </div>
          {passwordError && (
            <div className="error-message">
              <FaExclamationTriangle /> {passwordError}
            </div>
          )}
          <div className="password-strength-indicator">
            <span className="strength-dot"></span>
            <span>This is a sensitive action. Please verify your identity.</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button
            className="btn btn-delete"
            onClick={handleDeleteClick}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash /> Delete Account
              </>
            )}
          </button>
          
          <button
            className="btn btn-cancel"
            onClick={handleCancel}
            disabled={loading}
          >
            <FaTimes /> Cancel
          </button>
        </div>

        {/* Security Note */}
        <div className="security-note">
          <FaShieldAlt />
          <span>
            For security reasons, you'll be logged out after account deletion.
            <a href="/privacy"> Learn more</a>
          </span>
        </div>

        {/* Back Link */}
        <div className="back-link" onClick={handleCancel}>
          <FaArrowLeft /> Back to Profile
        </div>
      </div>

      {/* Custom Confirm Modal */}
      {showConfirmModal && (
        <div className="delete-modal-overlay">
          <div className="delete-modal">
            <div className="modal-icon">
              <FaExclamationTriangle />
            </div>
            <h3 className="modal-title">Delete Account?</h3>
            <p className="modal-message">
              This will permanently delete your account and all associated data. 
              You will not be able to recover this account or its content.
            </p>
            <div className="modal-actions">
              <button
                className="btn btn-delete"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Deleting...
                  </>
                ) : (
                  <>Yes, Delete Account</>
                )}
              </button>
              <button
                className="btn btn-cancel"
                onClick={() => {
                  setShowConfirmModal(false);
                  showToast("Account deletion cancelled", "info", 2000);
                }}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
              height: `${Math.random() * 4 + 2}px`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
}

export default DeleteAccount;
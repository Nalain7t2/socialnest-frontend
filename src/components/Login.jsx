// Login.jsx - With Toast Notifications
import React, { useState, useContext, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";
import { forgetPassword } from "../services/api";
import {
  FaUser,
  FaLock,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaCamera,
  FaHeart,
  FaShareAlt,
  FaStar,
  FaTimes,
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
} from "react-icons/fa";
import { TbSwitchVertical } from "react-icons/tb";
import logo_by_name from "../images/logo_by_name.png";
import "../style/Login.css";

function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [activeInput, setActiveInput] = useState("");


  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'info', 
    duration: 4000
  });

  const navigate = useNavigate();
  const { login, googleLogin } = useContext(AuthContext);
  const toastTimeoutRef = useRef(null);

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

  const handleLogin = async (e) => {
    e?.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!identifier.trim() || !password.trim()) {
      showToast("Please fill all fields!", "warning");
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters!", "warning");
      setLoading(false);
      return;
    }

    try {
      await login(identifier, password);
      showToast("Login successful! Welcome back!", "success", 2000);
      setTimeout(() => navigate("/"), 1500);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid credentials. Please try again.";
      showToast(errorMsg, "error");
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleForget = async (e) => {
    e?.preventDefault();
    setError("");
    setMessage("");

    if (!identifier.trim()) {
      showToast("Please enter your username or email", "warning");
      return;
    }

    try {
      const res = await forgetPassword(identifier);
      const successMsg = res.message || "Reset link has been sent to your email!";
      showToast(successMsg, "success");
      setMessage(successMsg);
      setTimeout(() => setIsFlipped(false), 3000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to send reset link. Try again.";
      showToast(errorMsg, "error");
      setError(errorMsg);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError("");
    try {
      await googleLogin(credentialResponse.credential);
      showToast("Google login successful! Welcome!", "success", 2000);
      setTimeout(() => navigate("/"), 1500);
    } catch {
      showToast("Google login failed. Please try again.", "error");
      setError("Google login failed. Please try again.");
    }
  };

  const handleGoogleError = () => {
    showToast("Google login failed", "error");
    setError("Google login failed");
  };

  return (
    <div className="login-creative-container">
      {/* Toast Notification */}
      {toast.show && (
        <div 
          className={`toast-notification-login toast-${toast.type}`} 
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
          <FaShareAlt />
        </div>
        <div className="floating-icon floating-icon-4">
          <FaStar />
        </div>
      </div>

      {/* Main Login Card */}
      <div className={`login-3d-card ${isFlipped ? "flipped" : ""}`}>
        {/* Front Side - Login */}
        <div className="card-front">
          <div className="card-header">
            <div className="logo-glow">
              <img
                src={logo_by_name}
                alt="SocialNest"
                className="logo-image-only"
              />
            </div>
            <p className="welcome-text">Welcome back to your social space</p>
          </div>

          <form onSubmit={handleLogin} className="creative-form">
            <div
              className={`input-field floating ${activeInput === "identifier" ? "active" : ""}`}
            >
              <FaUser className="field-icon" />
              <input
                type="text"
                placeholder=" "
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                onFocus={() => setActiveInput("identifier")}
                onBlur={() => setActiveInput("")}
                required
              />
              <label>Username / Email</label>
              <div className="field-underline"></div>
            </div>

            <div
              className={`input-field floating ${activeInput === "password" ? "active" : ""}`}
            >
              <FaLock className="field-icon" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder=" "
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setActiveInput("password")}
                onBlur={() => setActiveInput("")}
                required
              />
              <label>Password</label>
              <div className="field-underline"></div>
              <button
                type="button"
                className="password-reveal"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="form-options">
              <div>{"     "}</div>
              <button
                type="button"
                className="forgot-btn"
                onClick={() => setIsFlipped(true)}
              >
                Forgot Password?
              </button>
            </div>

            <button type="submit" className="login-btn-glow" disabled={loading}>
              <span className="btn-text">
                {loading ? (
                  <>
                    <span className="loading-spinner"></span>
                    Logging in...
                  </>
                ) : (
                  "Sign In"
                )}
              </span>
              <span className="btn-glow"></span>
            </button>

            <div className="divider-section">
              <div className="divider-line"></div>
              <span className="divider-text">or continue with</span>
              <div className="divider-line"></div>
            </div>

            <div className="social-buttons">
              <div className="google-btn-wrapper">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap
                  shape="pill"
                  size="large"
                  text="signin_with"
                  theme="filled_blue"
                  width="100%"
                />
              </div>
            </div>

            <div className="signup-section">
              <p className="signup-text">
                New to SocialNest?{" "}
                <button
                  type="button"
                  className="signup-link"
                  onClick={() => navigate("/register")}
                >
                  Create Account
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Back Side - Forgot Password */}
        <div className="card-back">
          <div className="back-header">
            <button
              className="flip-back-btn"
              onClick={() => setIsFlipped(false)}
            >
              <TbSwitchVertical />
            </button>
            <div className="back-title">
              <FaEnvelope className="title-icon" />
              <h2>Reset Password</h2>
            </div>
          </div>

          <div className="back-instruction">
            <p>
              Enter your email and we'll send you a link to reset your password.
            </p>
          </div>

          <form onSubmit={handleForget} className="forgot-form">
            <div className="input-field floating">
              <FaEnvelope className="field-icon" />
              <input
                type="email"
                placeholder=" "
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
              <label>Your Email Address</label>
              <div className="field-underline"></div>
            </div>

            <div className="reset-actions">
              <button type="submit" className="reset-btn">
                Send Reset Link
                <span className="btn-arrow">→</span>
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsFlipped(false)}
              >
                Cancel
              </button>
            </div>
          </form>

          <div className="back-help">
            <p>Didn't receive the email?</p>
            <ul className="help-list">
              <li>Check your spam folder</li>
              <li>Make sure you entered the correct email</li>
              <li>Wait a few minutes and try again</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Live Preview - Only visible on desktop */}
      <div className="live-preview">
        <div className="preview-header">
          <h3>Join the conversation</h3>
        </div>
        <div className="preview-slide">
          <div className="preview-post">
            <div className="preview-user">
              <div className="preview-avatar"></div>
              <div className="preview-user-info">
                <div className="preview-username"></div>
                <div className="preview-time"></div>
              </div>
            </div>
            <div className="preview-content">
              <div className="preview-text-line"></div>
              <div className="preview-text-line short"></div>
              <div className="preview-image"></div>
            </div>
            <div className="preview-actions">
              <span className="preview-like"></span>
              <span className="preview-comment"></span>
              <span className="preview-share"></span>
            </div>
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

export default Login;
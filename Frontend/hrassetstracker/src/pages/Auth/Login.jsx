import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { toast } from "react-hot-toast";

// Updated ForgotPasswordPopup

const ForgotPasswordPopup = ({ onClose }) => {
  const [emailOrMobile, setEmailOrMobile] = useState("");
  const [employeeId, setEmployeeId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const baseUrl = import.meta.env.VITE_BASE_URL; // your API base URL

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);

  const canSend =
    (validateEmail(emailOrMobile) || validateMobile(emailOrMobile)) &&
    employeeId.trim() !== "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSend) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`${baseUrl}/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email_or_mobile: emailOrMobile,
          employee_id: employeeId,
        }),
      });
     
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.detail || "Failed to send password");
      }

      toast.success("Temporary password sent to your email");
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to send reset instructions");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmployeeIdChange = (e) => {
    const value = e.target.value;
    if (value.startsWith(" ")) return;
    setEmployeeId(value);
  };

  return (
    <div
      className="modal show d-block"
      tabIndex="-1"
      role="dialog"
      onClick={onClose}
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div
        className="modal-dialog modal-dialog-centered"
        role="document"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content p-4">
          <h5 className="mb-3">Forgot Password ?</h5>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter your email or mobile number"
              className="form-control mb-3"
              value={emailOrMobile}
              onChange={(e) => setEmailOrMobile(e.target.value)}
              disabled={isSubmitting}
              required
            />
            <input
              type="text"
              placeholder="Enter your Employee ID"
              className="form-control mb-3"
              value={employeeId}
              onChange={handleEmployeeIdChange}
              disabled={isSubmitting}
              required
            />
            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-outline-dark"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-dark d-flex align-items-center justify-content-center"
                disabled={isSubmitting || !canSend}
              >
                {isSubmitting && (
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                )}
                {isSubmitting ? "Sending..." : "Send"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};



// Main Login Component
const Login = () => {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const navigate = useNavigate();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const userData = sessionStorage.getItem("userData");
    if (userData) {
      navigate("/dashboard");
    }
  }, [navigate]);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateMobile = (mobile) => /^\d{10}$/.test(mobile);

  const login = async ({ username, password }) => {
    const response = await fetch(`${baseUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || "Login failed");
    }
    const data = await response.json();
    sessionStorage.setItem("userData", JSON.stringify(data));
    return data;
  };

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const canSubmit =
    formData.username &&
    formData.password &&
    (validateEmail(formData.username) || validateMobile(formData.username));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit) {
      toast.error(
        "Please enter valid email or 10-digit mobile number and password"
      );
      return;
    }
    setIsLoading(true);
    try {
      await login(formData);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err) {
      toast.error(err.message || "Login failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showForgotPassword && (
        <ForgotPasswordPopup onClose={() => setShowForgotPassword(false)} />
      )}

      <div
        className="d-flex vh-100 align-items-center justify-content-center"
        style={{
          background: "linear-gradient(135deg, #0029ddff, #67b5ffff)",
        }}
      >
        <div
          className="card p-4"
          style={{ maxWidth: "450px", width: "100%", borderRadius: "50px" }}
        >
          <div className="text-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
              style={{ width: "64px", height: "64px" }}
            >
              <User className="text-dark" size={40} />
            </div>
            <h2 className="h4 mb-2">HR Asset Tracker</h2>
            <p className="text-muted mb-0">Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-3 position-relative">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <User
                className="position-absolute"
                style={{
                  left: "10px",
                  top: "70%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                }}
                size={18}
              />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="form-control ps-5"
                placeholder="Enter your email or mobile no"
                required
              />
            </div>

            <div className="mb-3 position-relative">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <Lock
                className="position-absolute"
                style={{
                  left: "10px",
                  top: "70%",
                  transform: "translateY(-50%)",
                  color: "#6c757d",
                }}
                size={18}
              />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control ps-5 pe-5"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="btn position-absolute"
                style={{
                  right: "10px",
                  top: "70%",
                  transform: "translateY(-50%)",
                  padding: "0.25rem 0.5rem",
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <button
              type="submit"
              className="btn btn-dark w-100 mt-3 mb-3"
              disabled={!canSubmit || isLoading}
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="text-center">
            <button
              className="btn btn-link"
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
export default Login;

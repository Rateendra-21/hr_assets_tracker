import { useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { LockIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChangePasswordModal = ({ show, onClose }) => {
  const { register, handleSubmit, watch, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!show) return null;

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("New password and confirm password do not match!");
      return;
    }

    if (data.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }

    const userData = JSON.parse(sessionStorage.getItem("userData") || "{}");
    const payload = {
      userid: userData.user?.id,
      old_password: data.oldPassword,
      new_password: data.newPassword,
    };

    setLoading(true);
    const token = userData?.access_token;

     if (!token) {
      toast.error("You are not logged in.");
      sessionStorage.removeItem("userData");
      localStorage.clear();
      window.location.href = "/login";
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`,  },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.status == 401) {
        sessionStorage.removeItem("userData");
        localStorage.clear();
        window.location.href = "/login";
        return;
      }

      if (response.ok) {
        toast.success(result.message || "Password changed successfully!");
        sessionStorage.removeItem("userData");
        localStorage.clear();
        reset();
        onClose();

        setTimeout(() => {
          navigate("/login");
        }, 800);
      } else {
        toast.error(result.detail || "Failed to change password.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  const handleModalClick = (e) => e.stopPropagation();

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1050,
      }}
    >
      <div
        onClick={handleModalClick}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "24px",
          width: "100%",
          maxWidth: "450px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        }}
      >
        <div
          style={{
            borderBottom: "1px solid #e5e5e5",
            paddingBottom: "12px",
            marginBottom: "16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <h5 style={{ fontWeight: "500", color: "black", margin: 0 }}>
          Change Password
          </h5>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.3rem",
              color: "#555",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-3">
            <label className="form-label">Old Password</label>
            <input
              type="password"
              {...register("oldPassword", { required: "Old password is required" })}
              className={`form-control ${errors.oldPassword ? "is-invalid" : ""}`}
              placeholder="Enter old password"
            />
            {errors.oldPassword && (
              <div className="invalid-feedback">{errors.oldPassword.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">New Password</label>
            <input
              type="password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: { value: 6, message: "At least 6 characters" },
              })}
              className={`form-control ${errors.newPassword ? "is-invalid" : ""}`}
              placeholder="Enter new password"
            />
            {errors.newPassword && (
              <div className="invalid-feedback">{errors.newPassword.message}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label">Confirm Password</label>
            <input
              type="password"
              {...register("confirmPassword", {
                required: "Please confirm your password",
                validate: (v) => v === watch("newPassword") || "Passwords do not match",
              })}
              className={`form-control ${errors.confirmPassword ? "is-invalid" : ""}`}
              placeholder="Confirm new password"
            />
            {errors.confirmPassword && (
              <div className="invalid-feedback">{errors.confirmPassword.message}</div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2 mt-3">
            <button
              type="button"
              className="btn btn-outline-dark"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn btn-dark">
              {loading ? "Updating..." : "Change Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePasswordModal;

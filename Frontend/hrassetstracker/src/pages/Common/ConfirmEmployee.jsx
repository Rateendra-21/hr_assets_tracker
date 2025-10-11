import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-hot-toast";

const ConfirmEmployee = () => {
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const handleConfirm = async () => {
    if (!token) {
      setError("Invalid confirmation link");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch(
        `${import.meta.env.VITE_BASE_URL}/employees/confirm-employee?token=${token}`
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Confirmation failed");

      toast.success(data.message);
      setConfirmed(true);

      // Close tab after 3 seconds
      setTimeout(() => {
        window.close();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
      <div className="card p-4 shadow" style={{ minWidth: "300px" }}>
        <h3 className="mb-3 text-center">Employee Email Confirmation</h3>
        {error && <p className="text-danger text-center">{error}</p>}
        {confirmed ? (
          <p className="text-success text-center">
            Email confirmed successfully! This tab will close shortly.
          </p>
        ) : (
          <>
            <p className="text-center mb-3">
              Click the button below to confirm your email.
            </p>
            <button
              className="btn btn-primary w-100"
              onClick={handleConfirm}
              disabled={loading}
            >
              {loading ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Confirming...
                </>
              ) : (
                "Confirm Email"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ConfirmEmployee;

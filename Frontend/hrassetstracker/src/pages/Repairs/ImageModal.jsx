// ImageModal.js
import React, { useState } from "react";

const ImageModal = ({ images, show, onClose }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!show || !images || images.length === 0) return null;

  const nextImage = () => setCurrentIndex((prev) => (prev + 1) % images.length);
  const prevImage = () =>
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: "#fff",
          borderRadius: "8px",
          padding: "20px",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "80%",
          overflowY: "auto",
          position: "relative",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          textAlign: "center",
        }}
      >
        {/* Header top-left */}
        <h5 className="mb-3 fw-medium text-start">Attached Images</h5>

        {/* Image */}
        <img
          src={`data:image/jpeg;base64,${images[currentIndex].image_base64}`}
          alt={images[currentIndex].filename}
          className="d-block mx-auto mb-3"
          style={{
            maxWidth: "100%",
            maxHeight: "60vh",
            borderRadius: "8px",
          }}
        />

        {/* Buttons: Close on left, Prev/Next on right */}
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <button onClick={onClose} className="btn btn-danger btn-sm">
              Close
            </button>
          </div>

          <div className="d-flex gap-2">
            {images.length > 1 && (
              <>
                <button onClick={prevImage} className="btn btn-dark btn-sm">
                  {"<"}
                </button>
                <button onClick={nextImage} className="btn btn-dark btn-sm">
                  {">"}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal;


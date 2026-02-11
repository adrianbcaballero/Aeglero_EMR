import React from "react";
import happyImg from "../images/happy.png";
import sadImg from "../images/sad.png";
import angryImg from "../images/angry.png";
import relaxedImg from "../images/relaxed.png";
import nervousImg from "../images/nervous.png";
import excitedImg from "../images/excited.png";
import '../styles/Student.css'

const images = [
  { src: happyImg, alt: "happy.png" },
  { src: sadImg, alt: "sad.png" },
  { src: angryImg, alt: "angry.png" },
  { src: relaxedImg, alt: "relaxed.png" },
  { src: nervousImg, alt: "nervous.png" },
  { src: excitedImg, alt: "excited.png" },
  ];

const ImageSelector = ({ selectedImage, onSelect }) => {
    return (
      <div className="snt-card-center">
      <h2 className="snt-desc-text-small">Choose an image that reflects your mood:</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "10px",
          justifyItems: "center",
        }}
      >
        {images.map(({ src, alt }) => (
          <img
            key={alt}
            src={src}
            alt={alt}
            onClick={() => onSelect(alt)}
            style={{
              border: selectedImage === alt ? "3px solid #bbbbbb" : "2px solid gray",
              width: "150px",
              height: "150px",
              borderRadius: '15%',
              cursor: "pointer",
              objectFit: "cover",
            }}
          />
        ))}
      </div>
    </div>

    );
};

export default ImageSelector;
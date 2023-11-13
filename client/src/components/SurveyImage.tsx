// SurveyImage.tsx

import React, { useState, useEffect } from "react";

import Backend from "../apis/backend";

interface SurveyImageProps {
  imageName: string;
}

const SurveyImage: React.FC<SurveyImageProps> = (props) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    Backend.get(`/images/${props.imageName}`, { responseType: "blob" })
      .then((response) => {
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      })
      .catch((error) => console.error("Error fetching image:", error));

    // Backend.get(`/images/${props.imageName}`, {
    //   withCredentials: true,
    // })
    //   .then((response) => response.data)
    //   .then((url) => setImageUrl(url))
    //   .catch((error) => console.error("Error fetching image URL:", error));
  }, [props.imageName]);

  return (
    <div>
      {imageUrl && <img src={imageUrl} className="mx-auto" alt="Image" />}
    </div>
  );
};

export default SurveyImage;

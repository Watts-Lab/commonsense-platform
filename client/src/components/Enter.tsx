import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

// interface EnterProps {
//   signIn: (email: string, link: string) => void;
// }

const Enter = ({ signIn }) => {
  let params = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    if (params.email && params.link) {
      signIn(params.email, params.link);
      navigate("/");
    } else {
      // Handle the case where either params.email or params.link is undefined
      console.error("Email or link is missing");
    }
  }, [params.email, params.link, navigate, signIn]);

  return (
    <div>
      <p>Verifying your magic link</p>
    </div>
  );
};

export default Enter;

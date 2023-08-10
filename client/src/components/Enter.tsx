import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function Enter(props) {
  let params = useParams();
  let navigate = useNavigate();

  useEffect(() => {
    // debugger;
    props.signIn(params.email, params.link);
    navigate("/");
  }, []);

  return (
    <div>
      <p>Verifying your magic link</p>
    </div>
  );
}

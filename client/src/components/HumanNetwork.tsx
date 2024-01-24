import React, { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../redux/hooks";

import { setShareParams } from "../redux/slices/shareSlice";

const HumanNetwork = ({}) => {
  let params = useParams();
  let navigate = useNavigate();
  const dispatch = useAppDispatch();

  const shareLink = useAppSelector((state) => state.shareslice.shareLink);

  useEffect(() => {
    if (params.sharelink) {
      dispatch(
        setShareParams({
          shareLink: params.sharelink,
        })
      );
      navigate("/");
    } else {
      console.error("Email or link is missing");
    }
  }, [params.sharelink, navigate]);

  return <div></div>;
};

export default HumanNetwork;

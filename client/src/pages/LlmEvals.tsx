import { useEffect } from "react";

const LlmEvals = () => {
  useEffect(() => {
    window.location.replace("/report/llm_evaluations");
  }, []);

  return null;
};

export default LlmEvals;

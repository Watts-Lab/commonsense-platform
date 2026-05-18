import { useEffect } from "react";

const LlmEvals = () => {
  useEffect(() => {
    window.location.replace("/llm-evals.html");
  }, []);

  return null;
};

export default LlmEvals;

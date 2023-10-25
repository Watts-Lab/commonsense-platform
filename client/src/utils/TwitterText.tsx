import React, { Fragment, useState } from "react";
import adler32 from "./adler32";

function TwitterText(props) {
  const [isShared, setIsShared] = useState(false);

  function handleShare() {
    setIsShared(true);
    handleCopy();
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textareaValue);
      console.log("Text copied to clipboard");
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }

  const score = 97; // Your score out of 100
  const breakPoint = Math.min(Math.floor(score / 10));
  const blocks = [];

  for (let i = 0; i < 10; i++) {
    if (i < breakPoint) {
      if (i < 3) {
        blocks.push("🟥"); // Red
      } else if (i > 3 && i <= 6) {
        blocks.push("🟨"); // Yellow
      } else if (i >= 7 && i < 9) {
        blocks.push("🟩"); // Green
      }
    } else if (i === breakPoint) {
      blocks.push("😀");
    } else {
      blocks.push("⬜"); // Gray block until 10
    }
  }

  const percentage = `My common sense is ${props.percentage}%`;
  const textareaValue = `${percentage}\n${blocks.join(
    ""
  )}\nCheck yours: commonsensicality.org/` + adler32('Y1hNz2tgJPuK3ep3NCgapIG1nesd-EoT');

  return (
    <div className="flex flex-col items-center pt-3">
      <button
        onClick={handleShare}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
      >
        Copy & Share!
      </button>

      {isShared && (
        <div className="mt-4 p-4 bg-gray-100 rounded-md w-96">
          <textarea
            id="tweetText"
            className="mt-2 p-2 text-gray-800 bg-white border border-gray-300 rounded-md resize-none w-full"
            value={textareaValue}
            rows={5}
            readOnly
          />
        </div>
      )}
    </div>
  );
}

export default TwitterText;

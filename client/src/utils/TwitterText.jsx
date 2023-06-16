import React, { Fragment, useState } from "react";

function TwitterText(props) {
  const [isShared, setIsShared] = useState(false);

  function handleShare() {
    setIsShared(true);
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(textareaValue);
      console.log("Text copied to clipboard");
    } catch (error) {
      console.error("Failed to copy text:", error);
    }
  }

  const totalBlocks = 100;
  const filledBlocks = Math.floor(((props.percentage) / 100) * totalBlocks);
  const emptyBlocks = totalBlocks - filledBlocks;

  const blocks = Array.from({ length: filledBlocks-1 }, (_, index) => "⬛");

  if (filledBlocks < totalBlocks) {
    blocks.push('😀');
  }

  for (let i = 0; i < emptyBlocks; i++) {
    blocks.push("🔲");
  }

  const blocksWithLineBreaks = [];
  for (let i = 0; i < blocks.length; i += 10) {
    const lineBlocks = blocks.slice(i, i + 10);
    blocksWithLineBreaks.push(lineBlocks.join(""));
  }

  const textareaValue = `I have more common sense than ${props.percentage}% of people!\n${blocksWithLineBreaks.join(
    "\n"
  )}\n...but not as much as ChatGPT`;

  return (
    <div className="flex flex-col items-center">
      <button
        onClick={handleShare}
        className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
      >
        Share
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
          <button
            onClick={handleCopy}
            className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          >
            Copy
          </button>
        </div>
      )}
    </div>
  );
}

export default TwitterText;

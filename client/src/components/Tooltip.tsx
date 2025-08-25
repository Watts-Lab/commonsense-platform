import { useState } from "react";

type TooltipProps = {
  className?: string;
  text: string;
  placement?: 'top' | 'bottom';
};

const Tooltip = ({ className, text, placement = 'top' }: TooltipProps) => {
  const [hover, setHover] = useState(false);

  // Placement logic
  const tooltipPosition = placement === 'bottom'
    ? 'top-full mt-2'
    : 'bottom-0 mb-10';
  const arrowPosition = placement === 'bottom'
    ? 'top-0 right-0 w-5 h-5 -mt-2 transform rotate-45 bg-gray-600'
    : 'bottom-0 right-0 w-5 h-5 -mb-1 transform rotate-45 bg-gray-600';

  return (
    <div className={className}>
      <div
        className={`relative flex items-center text-gray-500 cursor-pointer ${
          hover && "hover:text-gray-600"
        }`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <svg
          className="inline-block w-6 h-6 ml-1 text-gray-500 dark:text-gray-300"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
          ></path>
        </svg>
        {hover && (
          <div className={`absolute inline-block w-80 px-4 py-3 -ml-72 text-white bg-gray-600 rounded-lg z-10 ${tooltipPosition}`}>
            <span className="inline-block text-sm leading-tight">{text}</span>
            <span
              className={`absolute ${arrowPosition}`}
              style={{ left: "92%" }}
            ></span>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tooltip;

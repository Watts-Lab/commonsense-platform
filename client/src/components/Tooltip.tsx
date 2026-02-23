import { useState } from "react";

type TooltipProps = {
  className?: string;
  text: string;
  placement?: "top" | "bottom";
};

const Tooltip = ({ className, text, placement = "top" }: TooltipProps) => {
  const [visible, setVisible] = useState(false);

  return (
    <div
      className={`relative inline-flex items-center shrink-0 ${className ?? ""}`}
    >
      {/* Trigger icon */}
      <button
        type="button"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        aria-label="More information"
        className="flex items-center opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none transition-opacity duration-150"
      >
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM8.94 6.94a.75.75 0 11-1.061-1.061 3 3 0 112.871 5.026v.345a.75.75 0 01-1.5 0v-.5c0-.72.57-1.172 1.081-1.287A1.5 1.5 0 108.94 6.94zM10 15a1 1 0 100-2 1 1 0 000 2z"
          />
        </svg>
      </button>

      {/* Bubble */}
      <div
        role="tooltip"
        className={[
          "pointer-events-none absolute right-0 z-30 w-72",
          "rounded-xl bg-gray-900 px-4 py-3 text-sm leading-relaxed text-white",
          "shadow-xl shadow-black/20",
          "transition-all duration-150 ease-out",
          placement === "bottom" ? "top-full mt-3" : "bottom-full mb-3",
          visible
            ? "opacity-100 translate-y-0"
            : placement === "bottom"
              ? "opacity-0 -translate-y-1"
              : "opacity-0 translate-y-1",
        ].join(" ")}
      >
        {text}

        {/* Arrow — rotated square clipped by overflow */}
        <span
          className={[
            "absolute right-3 h-3 w-3 rotate-45 bg-gray-900",
            placement === "bottom" ? "-top-1.5" : "-bottom-1.5",
          ].join(" ")}
        />
      </div>
    </div>
  );
};

export default Tooltip;

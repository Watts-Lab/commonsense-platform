import React, { useEffect, useState } from "react";
import { Popover } from "@headlessui/react";
import ChatIcon from "./ChatIcon";

import WidgetForm from "./WidgetForm";

function Feedback() {
  return (
    <>
      <Popover className="fixed bottom-4 right-4 md:bottom-8 md:right-8 flex flex-col items-end">
        <Popover.Panel>
          <WidgetForm />
        </Popover.Panel>
        <Popover.Button className="bg-brand-500 rounded-full px-3 h-12 text-slate-600 flex items-center group">
          {/* create a group */}
          <ChatIcon />
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-linear">
            {/* on hover increase width */}
            {/* any element that overflows the max-width will be hidden */}
            <span className="pl-2"></span>
            Feedback
          </span>
        </Popover.Button>
      </Popover>
    </>
  );
}

export default Feedback;

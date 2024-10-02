import React from "react";
import { Popover } from "@headlessui/react";
import ChatIcon from "./ChatIcon";
import WidgetForm from "./WidgetForm";

function Feedback() {
  return (
    <>
      <Popover className="lg:fixed bottom-0 left-0 w-full flex justify-center items-center md:bottom-8 md:right-2 md:w-auto md:left-auto md:justify-end">
        <Popover.Panel>
          <WidgetForm />
        </Popover.Panel>
        <Popover.Button className="bg-brand-500 rounded-full px-3 h-12 text-slate-600 flex items-center group mb-4 md:mb-0">
          <ChatIcon />
          <span className="max-w-0 md:overflow-hidden md:group-hover:max-w-xs md:transition-all duration-500 ease-linear dark:text-white">
            <span className="pl-2"></span>
            Feedback
          </span>
        </Popover.Button>
      </Popover>
    </>
  );
}

export default Feedback;

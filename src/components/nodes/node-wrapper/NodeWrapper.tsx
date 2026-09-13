import { HiOutlineX } from "react-icons/hi";
import { HiAdjustments } from "react-icons/hi";
import "./NodeWrapper.css";
import { Button } from "@/components/ui/button";
import { HiOutlineVolumeOff } from "react-icons/hi";
import { TbGripVertical } from "react-icons/tb";
import type { ReactNode } from "react";

interface NodeWrapperProps {
  children: ReactNode;
}

export function NodeWrapper({ children }: NodeWrapperProps) {
  return (
    <div className="node-wrapper inline-flex flex-col">
      <div className="title-container h-12 w-full flex items-center gap-[2px]">
        <div className="flex items-center justify-center">
          <Button variant="outline" size="icon" className="cursor-grab active:cursor-grabbing">
            <TbGripVertical />
          </Button>
        </div>
        <div className="grow" />
        <span className="flex gap-[2px]">
          <div className="flex items-center justify-center">
            <Button variant="outline" size="icon">
              <HiOutlineVolumeOff />
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <Button variant="outline" size="icon">
              <HiAdjustments />
            </Button>
          </div>
          <div className="flex items-center justify-center">
            <Button variant="outline" size="icon">
              <HiOutlineX />
            </Button>
          </div>
        </span>
      </div>
      <div className="node-container">{children}</div>
    </div>
  );
}

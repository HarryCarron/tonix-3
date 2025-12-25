import { HiOutlineX } from "react-icons/hi";
import { HiAdjustments } from "react-icons/hi";
import "./NodeWrapper.css";
import { Button } from "@/components/ui/button";
import { HiOutlineVolumeOff } from "react-icons/hi";
import { Input } from "@/components/ui/input";
import type { ReactNode } from "react";

interface NodeWrapperProps {
  children: ReactNode;
}

export function NodeWrapper({ children }: NodeWrapperProps) {
  return (
    <div className="node-wrapper inline-flex flex-col">
      <div className="title-container h-12 w-full flex">
        <div className="grow flex items-center">
          <Input value="Keyboard 1" />
        </div>
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

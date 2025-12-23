import { useEffect, useRef, useState } from "react";
import "./Keyboard.css";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HiMiniXMark } from "react-icons/hi2";

export default function Keyboard() {
  const keyPad = 1;

  const keyboardContainer = useRef<HTMLDivElement | null>(null);

  const [containerDims, setContainerDim] = useState({
    height: 0,
    width: 0,
  });

  const keysNum = 7 * 4;
  const naturalKeyWidth = containerDims.width / keysNum;

  let currentOctave = 0;
  let currentKey = -1;

  useEffect(() => {
    setContainerDim({
      height: keyboardContainer.current!.clientHeight,
      width: keyboardContainer.current!.clientWidth,
    });
  }, []);

  return (
    <Card className="py-3 px-0">
      <CardContent className="px-3">
        <div className="keyboard flex flex-col">
          <div id="keyboard-top" className="h-10 mb-3">
            <KeyboardToolbar />
          </div>

          <div id="keyboard-body" className="p-1 h-25">
            <div className="h-full w-full" ref={keyboardContainer}>
              <svg
                className="overflow-visible"
                width={containerDims.width}
                height={containerDims.height}
              >
                {Array.from({ length: keysNum }).map((key, keyId) => {
                  return (
                    <rect
                      className="natural-key cursor-pointer"
                      width={naturalKeyWidth}
                      x={naturalKeyWidth * keyId}
                      y={keyPad}
                      height={containerDims.height - 3}
                      rx="3"
                    ></rect>
                  );
                })}
                {Array.from({ length: keysNum }).map((key, keyId) => {
                  currentKey++;
                  if (currentKey === 7) {
                    currentKey = 0;
                    currentOctave++;
                  }
                  return (
                    <>
                      {[0, 1, 3, 4, 5].includes(currentKey) && (
                        <rect
                          className="minor-key fill-stone-700 cursor-pointer"
                          width={naturalKeyWidth / 2}
                          x={naturalKeyWidth / 1.35 + naturalKeyWidth * keyId}
                          y={keyPad}
                          height={containerDims.height / 1.8}
                          rx="1"
                        ></rect>
                      )}
                    </>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function KeyboardToolbar() {
  return (
    <div className="flex gap-[2px]">
      <Select>
        <SelectTrigger className="w-50">
          <SelectValue placeholder="Select a pattern" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Pattern</SelectLabel>
            <SelectItem value="apple">Pattern 1</SelectItem>
            <SelectItem value="banana">Pattern 2</SelectItem>
            <SelectItem value="blueberry">Pattern 3</SelectItem>
            <SelectItem value="grapes">Pattern 4</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Button variant="ghost" size="icon">
        <HiMiniXMark />
      </Button>
    </div>
  );
}

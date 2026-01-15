import { useEffect, useRef } from "react";
import "./Navigator.css";
import { ENV } from "@/env";

interface NavigatorProps {
  host: HTMLDivElement;
}

export default function Navigator({ host }: NavigatorProps) {
  const scaleVal = 0.032;

  const cameraRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const camera = cameraRef.current!;
    new ResizeObserver((entry: ResizeObserverEntry[]) => {
      const { width, height } = entry[0].contentRect;

      camera.style.width = `${width * scaleVal}px`;
      camera.style.height = `${height * scaleVal}px`;
    }).observe(host);
  }, []);

  return (
    <div
      style={{
        height: ENV.worldDims * scaleVal,
        width: ENV.worldDims * scaleVal,
      }}
      id="navigator:world"
      className="navigator flex shadow-xl absolute bg-stone-100 p-1 rounded-lg border-2 border-stone-300"
    >
      <div
        id="navigator:camera"
        className="camera relative outline-2 outline-stone-400 bg-stone-400/20 outline"
        ref={cameraRef}
      ></div>
    </div>
  );
}

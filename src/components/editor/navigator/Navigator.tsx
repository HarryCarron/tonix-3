import { useEffect, useRef } from "react";
import "./Navigator.css";
import { NavigatorController } from "@/utils/workspace/navigator";

interface NavigatorProps {
  host: HTMLDivElement;
}

export default function Navigator({ host }: NavigatorProps) {
  const scaleVal = 0.032;

  const worldRef = useRef<HTMLDivElement | null>(null);
  const cameraRef = useRef<HTMLDivElement | null>(null);
  const navigatorRef = useRef<NavigatorController>(new NavigatorController());

  useEffect(() => {
    const navigator = navigatorRef.current;
    const world = worldRef.current;
    const camera = cameraRef.current;

    if (!world || !camera || !host) {
      return;
    }

    navigator
      ?.setScaleVal(scaleVal)
      .setHostElement(host)
      .setWorldElement(world!)
      .setCameraElement(camera!)
      .init();
  }, [worldRef, cameraRef, host]);

  return (
    <div
      ref={worldRef}
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

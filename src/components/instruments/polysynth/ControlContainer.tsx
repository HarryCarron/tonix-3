import type { ReactNode } from "react";

interface ControlContainerProps {
  label: string;
  children: ReactNode;
}

export function ControlContainer({ label, children }: ControlContainerProps) {
  return (
    <span className="p-2 border border-stone-200 rounded-md flex flex-col h-full">
      <div className="flex justify-center font-500 mb-2 color-stone-500">
        {label}
      </div>
      <div>{children}</div>
    </span>
  );
}

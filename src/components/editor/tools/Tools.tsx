import { EditorTool } from "@/types/editor/EditorTools";
import { HandRaisedIcon } from "@heroicons/react/16/solid";
import { MagnifyingGlassIcon } from "@heroicons/react/16/solid";
import { PlusIcon } from "@heroicons/react/16/solid";
import type { Dispatch, SetStateAction } from "react";

interface ToolsProps {
  editorTool: EditorTool;
  setEditorTool: Dispatch<SetStateAction<EditorTool | undefined>>;
}

export default function Tools({ editorTool, setEditorTool }: ToolsProps) {
  const baseClass = "p-4 rounded-lg active:bg-stone-200 cursor-pointer ";

  const classes = {
    pan: editorTool === EditorTool.pan ? "bg-stone-300" : "hover:bg-stone-100",
    mag: editorTool === EditorTool.mag ? "bg-stone-300" : "hover:bg-stone-100",
  };

  return (
    <div className="bg-stone-50 p-1 rounded-lg shadow-xl">
      <button
        onClick={() => setEditorTool(EditorTool.add)}
        className={baseClass}
      >
        <PlusIcon className="size-6" />
      </button>
      <button
        onClick={() => setEditorTool(EditorTool.pan)}
        className={baseClass + classes.pan}
      >
        <HandRaisedIcon className="size-6" />
      </button>
      <button
        onClick={() => setEditorTool(EditorTool.mag)}
        className={baseClass + classes.mag}
      >
        <MagnifyingGlassIcon className="size-6" />
      </button>
    </div>
  );
}

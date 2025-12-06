import { HandRaisedIcon } from "@heroicons/react/16/solid";

export default function Tools() {
    return <div className="shadow-xl bg-neutral-50 p-1 rounded-lg">
        <button className="p-4 rounded-lg hover:bg-neutral-100 active:bg-neutral-200 cursor-pointer">
            <HandRaisedIcon className="size-6" />
        </button>

    </div>
}
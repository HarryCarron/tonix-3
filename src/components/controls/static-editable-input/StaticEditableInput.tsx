import { useState } from "react";
import "./StaticEtidableInput.css";

export interface StaticEditableInputProps {
    value: string;
    onChange: (newValue: string) => void;
}

export function StaticEditableInput({value, onChange}: StaticEditableInputProps) {

    const [isEditing, setIsEditing] = useState(false);

    let elem;

    if (isEditing) {
        elem = <input
            type="text"
            className="static-editable-input"
            onBlur={() => {
                setIsEditing(false);
                onChange(value);
            }}
            autoFocus
            value={value}
        />
    } else {
        elem = <div
            onClick={() => setIsEditing(true)}
        >
            {value}
        </div>
    }

    return (

        <div className="h-full flex items-center">
            { elem }
        </div>
        
    );
}
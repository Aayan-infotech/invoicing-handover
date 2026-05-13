import React, { useState, useRef, useMemo } from "react";
import JoditEditor from "jodit-react";

const TextEditor = ({ placeholder, value, onChange, name }) => {
  const editor = useRef(null);

  const config = useMemo(
    () => ({
      readonly: false,
      placeholder: placeholder || "Start typing...",
    }),
    [placeholder]
  );

  const handleContentChange = (newContent) => {
    if (onChange) {
      onChange({
        target: {
          name: name,
          value: newContent,
        },
      });
    }
  };

  return (
    <JoditEditor
      ref={editor}
      value={value || ""}
      config={config}
      tabIndex={1}
      onBlur={handleContentChange}
      onChange={handleContentChange}
    />
  );
};

export default TextEditor;

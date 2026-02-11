// components/FontRenderer.jsx
import React, { useEffect, useRef, forwardRef } from "react";
import {
  KrutiDevComponent,
  DevLysComponent,
  MangalComponent,
  TimesNewRomanComponent,
  CalibriComponent,
  ArialComponent,
} from "./FontComponents";

export const FontRenderer = forwardRef(
  (
    {
      fontType,
      text, // Reference text (for display mode only)
      isInput = false,
      value = "", // User input value (for input mode only)
      onChange = () => {},
      placeholder = "",
      disabled = false,
    },
    ref
  ) => {
    const prevTextRef = useRef("");
    console.log("🔄 FontRenderer RENDERED");
    console.log("📥 fontType:", fontType);
    console.log("📥 isInput:", isInput);
    console.log(
      "📥 text (for display):",
      isInput ? "N/A" : text?.substring(0, 50)
    );
    console.log(
      "📥 value (for input):",
      isInput ? value?.substring(0, 50) : "N/A"
    );
    useEffect(() => {
      if (!isInput && text !== prevTextRef.current) {
        console.log("📝 Text actually changed in FontRenderer");
        prevTextRef.current = text;
      }
    }, [text, isInput]);

    const components = {
      "font-kruti-dev": KrutiDevComponent,
      "font-devlys": DevLysComponent,
      "font-mangal": MangalComponent,
      "font-times": TimesNewRomanComponent,
      "font-calibri": CalibriComponent,
      "font-arial": ArialComponent,
    };

    const SelectedComponent = components[fontType] || KrutiDevComponent;

    console.log(
      "🎯 Selected component:",
      SelectedComponent === DevLysComponent
        ? "DevLysComponent"
        : SelectedComponent === KrutiDevComponent
        ? "KrutiDevComponent"
        : "Other"
    );

    // For input mode, don't pass text prop
    if (isInput) {
      return (
        <SelectedComponent
          ref={ref}
          isInput={true}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          // Don't pass text prop for input mode
        />
      );
    }

    // For display mode
    return (
      <SelectedComponent
        text={text || ""}
        isInput={false}
        // Don't pass value/onChange for display mode
      />
    );
  }
);

// components/FontComponents.jsx
import React, { forwardRef } from "react";

// Base style for all components
const getBaseStyle = (isInput, fontFamily) => ({
  fontFamily: fontFamily,
  fontSize: isInput ? "18px" : "20px",
  lineHeight: "1.6",
  width: "100%",
  minHeight: isInput ? "300px" : "auto",
  padding: "15px",
  border: isInput ? "2px solid #e0e0e0" : "none",
  borderRadius: "8px",
  backgroundColor: isInput ? "#ffffff" : "transparent",
  resize: isInput ? "vertical" : "none",
  outline: "none",
  display: "block",
  margin: "0",
  whiteSpace: "pre-wrap",
  wordWrap: "break-word",
});

// Kruti Dev Component
export const KrutiDevComponent = forwardRef(
  (
    {
      text,
      isInput = false,
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const style = getBaseStyle(isInput, "'KrutiDev010', sans-serif");

    if (isInput) {
      return (
        <textarea
          ref={ref}
          style={style}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={10}
          className={`${className} krutidev-input`}
        />
      );
    }

    return (
      <div style={style} className={`${className} krutidev-display`}>
        {text || ""}
      </div>
    );
  }
);

KrutiDevComponent.displayName = "KrutiDevComponent";

// DevLys Component
export const DevLysComponent = forwardRef(
  (
    {
      text,
      isInput = false,
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const style = getBaseStyle(isInput, "'DevLys010', sans-serif");

    if (isInput) {
      return (
        <textarea
          ref={ref}
          style={style}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={10}
          className={`${className} devlys-input`}
        />
      );
    }

    return (
      <div style={style} className={`${className} devlys-display`}>
        {text || ""}
      </div>
    );
  }
);

DevLysComponent.displayName = "DevLysComponent";

// Mangal Component
export const MangalComponent = forwardRef(
  (
    {
      text,
      isInput = false,
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const style = getBaseStyle(isInput, "'Mangal', 'Nirmala UI', sans-serif");

    if (isInput) {
      return (
        <textarea
          ref={ref}
          style={style}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={10}
          className={`${className} mangal-input`}
        />
      );
    }

    return (
      <div style={style} className={`${className} mangal-display`}>
        {text || ""}
      </div>
    );
  }
);

MangalComponent.displayName = "MangalComponent";

// Times New Roman Component
export const TimesNewRomanComponent = forwardRef(
  (
    {
      text,
      isInput = false,
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const style = getBaseStyle(isInput, "'Times New Roman', Times, serif");

    if (isInput) {
      return (
        <textarea
          ref={ref}
          style={style}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={10}
          className={`${className} times-input`}
        />
      );
    }

    return (
      <div style={style} className={`${className} times-display`}>
        {text || ""}
      </div>
    );
  }
);

TimesNewRomanComponent.displayName = "TimesNewRomanComponent";

// Calibri Component
export const CalibriComponent = forwardRef(
  (
    {
      text,
      isInput = false,
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const style = getBaseStyle(isInput, "Calibri, 'Segoe UI', sans-serif");

    if (isInput) {
      return (
        <textarea
          ref={ref}
          style={style}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={10}
          className={`${className} calibri-input`}
        />
      );
    }

    return (
      <div style={style} className={`${className} calibri-display`}>
        {text || ""}
      </div>
    );
  }
);

CalibriComponent.displayName = "CalibriComponent";

// Arial Component
export const ArialComponent = forwardRef(
  (
    {
      text,
      isInput = false,
      value = "",
      onChange = () => {},
      placeholder = "",
      disabled = false,
      className = "",
    },
    ref
  ) => {
    const style = getBaseStyle(isInput, "Arial, sans-serif");

    if (isInput) {
      return (
        <textarea
          ref={ref}
          style={style}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          rows={10}
          className={`${className} arial-input`}
        />
      );
    }

    return (
      <div style={style} className={`${className} arial-display`}>
        {text || ""}
      </div>
    );
  }
);

ArialComponent.displayName = "ArialComponent";

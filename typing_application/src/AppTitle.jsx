import React from "react";
import "./App.css";

const AppTitle = ({
  title = "Typing Application",
  subtitle = "Master your typing skills for competitive exams",
}) => {
  return (
    <div className="app-title">
      <div className="title-content">
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
    </div>
  );
};
export default AppTitle;

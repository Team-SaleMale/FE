import React from "react"; // React 17+ JSX 자동 변환이면 생략 가능
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./styles/font.css"; // 폰트 로드는 여기서 한 번만

import App from "./App";

const root = createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);

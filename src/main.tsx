import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import NiceModal from "@ebay/nice-modal-react";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NiceModal.Provider>
      <App />
    </NiceModal.Provider>
  </StrictMode>,
);

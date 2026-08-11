import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { EntryDialogProvider } from "./components/form/EntryDialog.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <EntryDialogProvider>
      <App />
    </EntryDialogProvider>
  </StrictMode>,
);

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { CalItemDialogProvider } from "./components/form/CalItemDialog.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CalItemDialogProvider>
      <App />
    </CalItemDialogProvider>
  </StrictMode>,
);

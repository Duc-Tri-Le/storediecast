import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./theme.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: true, // Khi chuyển tab quay lại, tự động nạp dữ liệu mới
      refetchOnReconnect: true,   // Khi mạng kết nối lại, tự động nạp dữ liệu mới
      refetchInterval: false,     // Tắt hoàn toàn timer polling ngầm
      staleTime: 0,               // Dữ liệu luôn tươi mới khi tải
      retry: 1,
    },
  },
});

const rootEl =
  document.getElementById("root") ||
  document.querySelector<HTMLElement>("[data-generated-space-root]") ||
  document.body;

createRoot(rootEl).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);

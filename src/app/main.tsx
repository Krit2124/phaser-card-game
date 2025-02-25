import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import MainLayout from "./layouts/MainLayout/MainLayout.tsx";
import ErrorPage from "@/pages/ErrorPage/ErrorPage.tsx";
import GameSelectionPage from "@/pages/GameSelectionPage/GameSelectionPage.tsx";

import './globalStyles/global.css'
import './globalStyles/colors.css'

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    errorElement: <ErrorPage />,
    children: [{ path: "", element: <GameSelectionPage /> }],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

import React from "react";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import { HeroUIProvider } from "@heroui/react";

import TestPage from "./pages/Test.jsx";
import LoginPage from "./pages/Login.jsx";
import StudentMainForm from "./pages/StudentMainForm.jsx";
import FormPage from "./pages/FormPage";
import { UserProvider } from "./Context.jsx";
import AdvisorPage from "./pages/Advisors.jsx";
import StudentTransition from "./pages/StudentTransition.jsx";
import StudentPage from "./pages/StudentPage.jsx";
import ScorePage from "./pages/ScorePage.jsx";
import ScoreByValuePage from "./pages/ScoreByValuepage.jsx";
import AISummary from "./pages/AISummary.jsx";

const Layout = () => {
  return (
    <div>
    <Outlet />
  </div>
  );
};
const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <LoginPage />
      },
      {
        path: "/student",
        element: <StudentMainForm />
      },
      { path: "/journal",
         element: <FormPage /> 
      },
      {
        path: "/advisor",
        element: <AdvisorPage />
      },
      {
        path: "/transition",
        element: <StudentTransition/>
      },
      {
        path: "/student/:id",
        element: <StudentPage />
      },
      {
        path: "/score/:date",
        element: <ScorePage />
      },
      {
        path: "/score-by-value/:value",
        element: <ScoreByValuePage />
      },
      {
        path: "/ai-summary",
        element: <AISummary />
      }
    ]
  }

])

ReactDOM.createRoot(document.getElementById('root')).render(
  <StrictMode>
    <UserProvider>
    <HeroUIProvider>
    <RouterProvider router={router} />
    </HeroUIProvider>
    </UserProvider>
  </StrictMode>,
)

import { createBrowserRouter } from "react-router-dom";

import Layout from "@/pages/Layout";
import AuthPageLayout from "@/pages/AuthPageLayout";

import SignUp from "@/pages/SignUp";
import SignIn from "@/pages/SignIn";
import RegisterSuccess from "@/pages/RegisterSuccess/RegisterSuccess";
import PassWordResearch from "@/pages/PassWordResearch";
import Main from "@/pages/Main";
/* import MyProfile from "@/pages/MyProfile"; */
import AddBucket from "@/pages/AddBucket/AddBucket";
import Browse from "@/pages/Browse";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Main />,
      },
      {
        path: `/search/:keyword`,
        element: <Browse />,
        label: "search",
      },

      /*       {
        path: "/profile",
        element: <MyProfile />,
      }, */
    ],
  },
  {
    path: "/add",
    element: <AddBucket />,
  },
  {
    path: "/auth",
    element: <AuthPageLayout />,
    children: [
      {
        path: "/auth/signup",
        element: <SignUp />,
      },
      {
        path: "/auth/signin",
        element: <SignIn />,
      },
      {
        path: "/auth/passwordResearch",
        element: <PassWordResearch />,
      },
      {
        path: "/auth/registerSuccess/:message",
        element: <RegisterSuccess />,
      },
    ],
  },
]);

export default router;

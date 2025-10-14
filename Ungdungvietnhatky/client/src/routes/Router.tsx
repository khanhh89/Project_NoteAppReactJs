import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Home from "../pages/user/BlogPage/Home";
import Login from "../pages/auth/Login/Login";
import Register from "../pages/auth/Register/Register";
import AddArticle from "../components/AddArticle/AddArticle";
import ManagerPost from "../pages/admin/ManagerPost";
import ManagerUser from "../pages/admin/ManagerUser";
import AllMyPost from "../pages/user/AllPage/AllMyPost";
import Mangeradmin from "../pages/admin/Mangeradmin";
import ManagerArticle from "../pages/admin/ManagerArticle";
import PostDetails from "../components/PostDetails/PostDetails";
import Unauthorized from "../pages/auth/Unauthorized"
import { Navigate } from "react-router-dom";

import ProtectedRoute from "../../src/components/ProtectedRoute/ProtectedRoute";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/my-posts", element: <AllMyPost /> },
  { path: "/add-article", element: <AddArticle /> }, 
  { path: "/post/:id", element: <PostDetails /> },
  { path: "/unauthorized", element: <Unauthorized /> },

  // --- Khu vực ADMIN: phải đăng nhập & role=admin ---
{
  path: "/admin/",
  element: (
    <ProtectedRoute allowedRoles={["admin"]}>
      <Mangeradmin />
    </ProtectedRoute>
  ),
  children: [
    { index: true, element: <Navigate to="manager-user" replace /> },
    { path: "manager-user", element: <ManagerUser /> },
    { path: "manager-post", element: <ManagerPost /> },
    { path: "manager-article", element: <ManagerArticle /> }, 
  ],
},

  // (Tuỳ chọn) Khu vực chỉ cần đăng nhập (không bắt buộc admin)
  // {
  //   element: <ProtectedRoute allowedRoles={["admin","user"]} />,
  //   children: [
  //     { path: "/profile", element: <Profile /> },
  //   ],
  // },

  // 404
  { path: "*", element: <div style={{ padding: 20 }}>404 Not Found</div> },
]);

const Router = () => <RouterProvider router={router} />;
export default Router;

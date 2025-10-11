import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type CurrentUser = {
  id: number;
  email: string;
  role?: "admin" | "user";
};

function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? (JSON.parse(raw) as CurrentUser) : null;
  } catch {
    return null;
  }
}

type Props = {
  allowedRoles?: Array<"admin" | "user">;
  // Nếu bạn muốn bọc 1 layout cụ thể, truyền vào children
  children?: React.ReactNode;
};

/**
 * - Nếu CHƯA đăng nhập -> đẩy về /login và giữ state.from để đăng nhập xong quay lại.
 * - Nếu ĐÃ đăng nhập nhưng KHÔNG đủ quyền -> đẩy sang /unauthorized (403).
 * - Nếu hợp lệ -> render Outlet hoặc children.
 */
export default function ProtectedRoute({ allowedRoles, children }: Props) {
  const user = getCurrentUser();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role || "user")) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Hỗ trợ 2 kiểu: bọc layout (children) HOẶC làm parent route có Outlet
  return children ? <>{children}</> : <Outlet />;
}

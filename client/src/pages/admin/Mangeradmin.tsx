import React from "react";
import "./Mangeradmin.scss";
import { MdMarkEmailUnread } from "react-icons/md";
import { HiUserGroup } from "react-icons/hi2";
import { FiBook } from "react-icons/fi";
import { MdMenuBook } from "react-icons/md";
import { IoIosLogIn } from "react-icons/io";
import { FaBell } from "react-icons/fa6";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";

function Mangeradmin() {
  const navigate = useNavigate();

  // Danh sách menu sidebar
  const items = [
    { key: "users", label: "Manage Users", icon: <HiUserGroup />, to: "/admin/manager-user" },
    { key: "entries", label: "Manage Entries", icon: <FiBook />, to: "/admin/manager-post" },
    { key: "article", label: "Manage Article", icon: <MdMenuBook />, to: "/admin/manager-article" },
  ];

  // ✅ Hàm logout
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Đăng xuất?",
      text: "Bạn có chắc chắn muốn đăng xuất khỏi tài khoản quản trị?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Đăng xuất",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });

    if (result.isConfirmed) {
      localStorage.removeItem("currentUser"); // Xoá thông tin người dùng
      await Swal.fire({
        icon: "success",
        title: "Đã đăng xuất!",
        timer: 1000,
        showConfirmButton: false,
      });
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="admin-shell">
      {/* Thanh top */}
      <div className="top-bar">
        <div className="top-bar-icons">
          <MdMarkEmailUnread />
          <button className="icon-button notification">
            <FaBell />
          </button>
          <button className="icon-button profile">
            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt="Profile"
            />
          </button>
        </div>
      </div>

      <div className="manager-admin">
        {/* Sidebar */}
        <aside className="sidebar">
          <div className="sidebar-menu">
            {items.map((it) => (
              <NavLink
                key={it.key}
                to={it.to}
                className={({ isActive }) =>
                  `menu-item ${isActive ? "active" : ""}`
                }
              >
                <span className="menu-icon">{it.icon}</span>
                {it.label}
              </NavLink>
            ))}

            <button className="menu-item logout" onClick={handleLogout}>
              <span className="menu-icon">
                <IoIosLogIn />
              </span>
              Log out
            </button>
          </div>
        </aside>

        {/* Nội dung chính */}
        <main className="main-content">
          <div className="content-area">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

export default Mangeradmin;

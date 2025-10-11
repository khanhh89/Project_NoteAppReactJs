import React, { useEffect, useState } from "react";
import Logo from "../../assets/Header/Chiplogoo.png";
import { Button } from "antd";
import { Search } from "lucide-react";
import "./Header.scss";
import { Link, useNavigate } from "react-router-dom";

type CurrentUser = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "user";
  avatarUrl?: string; // nếu sau này bạn muốn lưu avatar
};

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const navigate = useNavigate();

  // đọc user từ localStorage
  const loadUser = () => {
    try {
      const raw = localStorage.getItem("currentUser");
      setUser(raw ? (JSON.parse(raw) as CurrentUser) : null);
    } catch {
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    // lắng nghe thay đổi từ tab khác
    const handler = (e: StorageEvent) => {
      if (e.key === "currentUser") loadUser();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("currentUser");
    setUser(null);
    setOpenMenu(false);
    navigate("/login");
  };

  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user?.email?.split("@")[0];

  return (
    <div className="header">
      <div className="header__left">
        <Link to="/">
          <img src={Logo} alt="Logo" />
        </Link>
        <span>RIKKEI_EDU_BLOG</span>
      </div>

      <div className="header__search">
        <div className="search-box">
          <input type="text" placeholder="Search for articles" />
          <Search size={18} />
        </div>
      </div>

      <div className="header__actions">
        {/* Nếu CHƯA đăng nhập → 2 nút */}
        {!user ? (
          <>
            <Link to="/register">
              <Button>Sign Up</Button>
            </Link>
            <Link to="/login">
              <Button type="">Sign In</Button>
            </Link>
          </>
        ) : (
          // ĐÃ đăng nhập → avatar + menu (tái dùng style của HeaderLogin)
          <div
            className="header__profile"
            onClick={() => setOpenMenu((s) => !s)}
          >
            <img
              src={
                user.avatarUrl ||
                "https://i.pravatar.cc/150?img=3"
              }
              alt="User Avatar"
              className="header__profile-avatar"
            />

            <div className={`header__profile-menu ${openMenu ? "active" : ""}`}>
              <div className="profile-info">
                <div className="profile-img">
                  <img
                    src={
                      user.avatarUrl ||
                      "https://i.pravatar.cc/150?img=3"
                    }
                    alt="Profile"
                  />
                </div>
                <div className="profile-text">
                  <strong>{displayName}</strong>
                  <small>{user.email}</small>
                </div>
              </div>

              <div className="menu-item" onClick={() => navigate("/profile")}>
                View profile
              </div>
              <div className="menu-item" onClick={() => navigate("/profile/photo")}>
                Update profile picture
              </div>
              <div className="menu-item" onClick={() => navigate("/profile/password")}>
                Change password
              </div>
              <div className="menu-item" onClick={handleLogout}>
                Log out
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import Logo from "../../assets/Header/Chiplogoo.png";
import { Button } from "antd";
import { Search } from "lucide-react";
import "./Header.scss";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Swal from "sweetalert2";

type CurrentUser = {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: "admin" | "user";
  avatarUrl?: string;
};

export default function Header() {
  const [openMenu, setOpenMenu] = useState(false);
  const [user, setUser] = useState<CurrentUser | null>(null);

  // 🔎 từ khóa
  const [keyword, setKeyword] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

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
    const handler = (e: StorageEvent) => {
      if (e.key === "currentUser") loadUser();
    };
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  // ✅ Đồng bộ keyword với query khi đổi route
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setKeyword(params.get("q") || "");
  }, [location.search]);


const handleLogout = async () => {
  await Swal.fire({
    icon: "success",
    title: "Đăng xuất thành công!",
    text: "Hẹn gặp lại bạn lần sau 😊",
    confirmButtonText: "OK",
    confirmButtonColor: "#1677ff",
    timer: 1500,
    timerProgressBar: true,
  });

  localStorage.removeItem("currentUser");
  setUser(null);
  setOpenMenu(false);
  navigate("/login");
};


  const displayName =
    user?.firstName || user?.lastName
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
      : user?.email?.split("@")[0];

  // ✅ Submit tìm kiếm
  const doSearch = () => {
    const q = keyword.trim();
    // điều hướng về Home kèm query ?q=
    navigate({
      pathname: "/",
      search: q ? `?q=${encodeURIComponent(q)}` : "",
    });
  };

  const onKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.key === "Enter") doSearch();
  };

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
          <input
            type="text"
            placeholder="Search for articles"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={onKeyDown}
          />
          <Search size={18} onClick={doSearch} style={{ cursor: "pointer" }} />
        </div>
      </div>

      <div className="header__actions">
        {!user ? (
          <>
            <Link to="/register">
              <Button>Sign Up</Button>
            </Link>
            <Link to="/login">
              <Button>Sign In</Button>
            </Link>
          </>
        ) : (
          <div
            className="header__profile"
            onClick={() => setOpenMenu((s) => !s)}
          >
            <img
              src={user.avatarUrl || "https://i.pravatar.cc/150?img=3"}
              alt="User Avatar"
              className="header__profile-avatar"
            />

            <div className={`header__profile-menu ${openMenu ? "active" : ""}`}>
              <div className="profile-info">
                <div className="profile-img">
                  <img
                    src={user.avatarUrl || "https://i.pravatar.cc/150?img=3"}
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

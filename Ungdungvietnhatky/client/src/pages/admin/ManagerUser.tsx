import { useEffect, useMemo, useState } from "react";
import "./ManagerUser.scss";
import { SearchOutlined } from "@ant-design/icons";
import axios from "axios";
import PaginationBar from "../../components/PaginationBar/PaginationBar";
import { Spin } from "antd"; 

type ApiUser = {
  id: number;
  firstName?: string;
  lastName?: string;
  name?: string;
  username?: string;
  email: string;
  isBlocked?: boolean;
  avatar?: string;
};

type User = {
  id: number;
  name: string;
  username: string;
  email: string;
  status: "hoạt động" | "đã chặn" | "tạm khóa";
  avatar?: string;
  isBlocked: boolean;
};

const PAGE_SIZE = 5;

export default function ManagerUser() {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // --- helper ---
  const toName = (u: ApiUser) => {
    if (u.name) return u.name;
    const fn = (u.firstName || "").trim();
    const ln = (u.lastName || "").trim();
    return `${fn} ${ln}`.trim() || (u.email || "").split("@")[0];
  };

  const toUsername = (email: string, incoming?: string) =>
    incoming?.trim() || `@${(email || "").split("@")[0]}`;

  // --- fetch users ---
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await axios.get<ApiUser[]>("http://localhost:8080/users");
        const mapped: User[] = (res.data || []).map((u) => ({
          id: u.id,
          name: toName(u),
          username: toUsername(u.email, u.username),
          email: u.email,
          avatar: u.avatar,
          isBlocked: !!u.isBlocked,
          status: u.isBlocked ? "đã chặn" : "hoạt động",
        }));
        setUsers(mapped);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải danh sách người dùng.");
      } finally {
         setTimeout(() => setLoading(false), 7000);
      }
    };
    fetchUsers();
  }, []);

  //search
  const filteredUsers = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchTerm]);

  // pagination 
  const total = filteredUsers.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const page = Math.min(currentPage, totalPages);
  const start = (page - 1) * PAGE_SIZE;
  const pageData = filteredUsers.slice(start, start + PAGE_SIZE);

  // actions
  const handleBlock = async (id: number) => {
    const prev = users;
    const next = users.map((u) =>
      u.id === id ? { ...u, isBlocked: true, status: "đã chặn" } : u
    );
    setUsers(next);
    try {
      await axios.patch(`http://localhost:8080/users/${id}`, { isBlocked: true });
    } catch (e) {
      console.error(e);
      setUsers(prev);
    }
  };

  const handleUnblock = async (id: number) => {
    const prev = users;
    const next = users.map((u) =>
      u.id === id ? { ...u, isBlocked: false, status: "hoạt động" } : u
    );
    setUsers(next);
    try {
      await axios.patch(`http://localhost:8080/users/${id}`, { isBlocked: false });
    } catch (e) {
      console.error(e);
      setUsers(prev);
    }
  };
  return (
    <main className="main-content">
      <div className="content-area">
        <div className="content-header">
          <div className="header-left">
            <h1>Team members</h1>
            <span className="user-count">{total} users</span>
          </div>

          <div className="search-box">
            <span className="search-icon">
              <SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />
            </span>
            <input
              type="text"
              placeholder="Search user"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
        </div>
        {err && <div style={{ color: "crimson", marginBottom: 12 }}>{err}</div>}
        <Spin spinning={loading} size="large" tip="Đang tải..." delay={50000}>
          <div className="table-container">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Email address</th>
                  <th>Active</th>
                </tr>
              </thead>

              <tbody>
                {pageData.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="avatar">
                          {user.avatar ? (
                            <img src={user.avatar} alt={user.name} />
                          ) : (
                            <div className="avatar-placeholder">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.name}</div>
                          <div className="user-username">{user.username}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`status-badge ${user.isBlocked ? "blocked" : "active"}`}
                      >
                        {user.status}
                      </span>
                    </td>

                    <td className="email-cell">{user.email}</td>

                    <td>
                      <div className="action-buttons">
                        <button
                          className="btn-block"
                          onClick={() => handleBlock(user.id)}
                          disabled={user.isBlocked}
                        >
                          block
                        </button>
                        <button
                          className="btn-unblock"
                          onClick={() => handleUnblock(user.id)}
                          disabled={!user.isBlocked}
                        >
                          unblock
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {!loading && pageData.length === 0 && (
                  <tr>
                    <td colSpan={4} style={{ textAlign: "center", padding: 24 }}>
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Spin>

        <PaginationBar
          current={page}
          total={total}
          pageSize={PAGE_SIZE}
          onChange={(p: number) => setCurrentPage(p)}
        />
      </div>
    </main>
  );
}

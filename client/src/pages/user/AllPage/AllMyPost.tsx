// src/pages/AllPage/AllMyPost.tsx
import React, { useEffect, useMemo, useState } from "react";
import "./AllPage.scss";
import Header from "../../../layouts/Header/Header";
import Footer from "../../../layouts/Footer/Footer";
import { FiArrowUpRight } from "react-icons/fi";
import PaginationBar from "../../../components/PaginationBar/PaginationBar";
import { Button, Modal, Spin, Empty, Alert } from "antd";
import AddArticle from "../../../components/AddArticle/AddArticle";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2"; // ✅ dùng SweetAlert2

type TagInfo = { text: string; bg: string; color: string };
type Post = {
  id: number;
  date: string;
  title: string;
  excerpt: string;
  tag: TagInfo;
  img: string;
  featured?: boolean;
  edit?: boolean;
  content?: string;
};

type Status = "Public" | "Private";
interface Category { id: number; name: string }
interface Article {
  id: number;
  image: string;
  title: string;
  categoryId: number;
  content: string;
  status: Status;
  mood: string;
  createdAt?: string;
  updatedAt?: string;
  userId: number;
}
interface ArticleExpanded extends Article { category?: Category }

interface AuthUser { id: number; firstName?: string; lastName?: string; email?: string }

const tagColorOf = (name?: string): TagInfo => {
  const key = (name || "General").toLowerCase();
  if (key.includes("daily")) return { text: name || "Daily Journal", bg: "#e8f3ff", color: "#1677ff" };
  if (key.includes("work"))  return { text: name || "Work & Career",  bg: "#eefbf3", color: "#22a06b" };
  if (key.includes("personal")) return { text: name || "Personal Thoughts", bg: "#e9fff2", color: "#1d9e6f" };
  if (key.includes("emotion")) return { text: name || "Emotions & Feelings", bg: "#F9F5FF", color: "#7F56D9" };
  return { text: name || "General", bg: "#f5f5f5", color: "#595959" };
};
const toExcerpt = (s: string, max = 140) => (s?.length > max ? s.slice(0, max).trim() + "…" : s || "");
const toDate = (iso?: string) => (iso ? iso.slice(0, 10) : "");

function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem("currentUser");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function AllMyPost() {
  const me = getCurrentUser();
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [openAdd, setOpenAdd] = useState(false);
  const [editing, setEditing] = useState<ArticleExpanded | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (!me) navigate("/login");
  }, [me, navigate]);
  if (!me) return null;

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await axios.get<ArticleExpanded[]>("http://localhost:8080/articles", {
          params: { _expand: "category", _sort: "createdAt", _order: "desc", userId: me.id },
          timeout: 15000,
        });

        const mapped: Post[] = (data || []).map((a) => ({
          id: a.id,
          date: toDate(a.createdAt) || toDate(a.updatedAt) || "",
          title: a.title,
          excerpt: toExcerpt(a.content),
          img: a.image || "https://placehold.co/1200x800",
          tag: tagColorOf(a.category?.name),
          content: a.content,
        }));

        setPosts(mapped);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải bài viết. Kiểm tra server hoặc schema dữ liệu.");
        Swal.fire({ icon: "error", title: "Lỗi", text: "Không thể tải bài viết." });
      } finally {
        setLoading(false);
      }
    })();
  }, [me?.id]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(posts.length / pageSize));
    if (currentPage > maxPage) setCurrentPage(maxPage);
  }, [posts, currentPage]);

  const paginatedPosts = useMemo(
    () => posts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [posts, currentPage]
  );

  const openPost = (post: Post) => navigate(`/post/${post.id}`, { state: post });

  const handleEdit = async (e: React.MouseEvent, p: Post) => {
    e.stopPropagation();
    try {
      const { data } = await axios.get<ArticleExpanded>(`http://localhost:8080/articles/${p.id}`, {
        params: { _expand: "category" },
      });
      setEditing(data);
      setOpenAdd(true);
    } catch (error) {
      console.error(error);
      setErr("Không lấy được dữ liệu bài viết để sửa.");
      Swal.fire({ icon: "error", title: "Lỗi", text: "Không lấy được dữ liệu bài viết để sửa." });
    }
  };

  const handleSubmit = async (values: any) => {
    const now = new Date().toISOString();
    const title = values.title?.trim();
    const categoryId: number | undefined = values.categoryId;
    const content = values.content?.trim() || "";
    const status: Status = values.status === "private" ? "Private" : "Public";
    const mood = values.mood;

    if (!title || !categoryId) {
      await Swal.fire({ icon: "warning", title: "Thiếu thông tin", text: "Vui lòng nhập tiêu đề và chọn danh mục." });
      return;
    }

    // Hiện popup loading trong lúc submit
    Swal.fire({
      title: editing ? "Đang cập nhật..." : "Đang thêm bài viết...",
      allowOutsideClick: false,
      didOpen: () => Swal.showLoading(),
    });

    try {
      let imageUrl = editing?.image || values.image || "https://placehold.co/1200x800";
      const file = values?.files?.[0]?.originFileObj as File | undefined;
      if (file) {
        // TODO: thay bằng upload Cloudinary thật để lấy URL
        imageUrl = URL.createObjectURL(file);
      }

      if (!editing) {
        // THÊM
        const payload = {
          title, categoryId, content, status, image: imageUrl, mood,
          createdAt: now, updatedAt: now, userId: me.id,
        };
        const res = await axios.post<Article>("http://localhost:8080/articles", payload);
        const saved = res.data;

        const { data: expanded } = await axios.get<ArticleExpanded>(
          `http://localhost:8080/articles/${saved.id}`,
          { params: { _expand: "category" } }
        );

        setPosts(prev => [{
          id: expanded.id,
          date: toDate(expanded.createdAt) || toDate(expanded.updatedAt) || "",
          title: expanded.title,
          excerpt: toExcerpt(expanded.content),
          img: expanded.image || "https://placehold.co/1200x800",
          tag: tagColorOf(expanded.category?.name),
          content: expanded.content,
        }, ...prev]);

        setCurrentPage(1);
        await Swal.fire({ icon: "success", title: "Thành công", text: "Thêm bài viết thành công!" });
      } else {
        // SỬA
        const payload = { title, categoryId, content, status, image: imageUrl, mood, updatedAt: now };
        await axios.patch<Article>(`http://localhost:8080/articles/${editing.id}`, payload);

        const { data: updated } = await axios.get<ArticleExpanded>(
          `http://localhost:8080/articles/${editing.id}`,
          { params: { _expand: "category" } }
        );

        setPosts(prev =>
          prev.map(x =>
            x.id === updated.id
              ? {
                  id: updated.id,
                  date: toDate(updated.createdAt) || toDate(updated.updatedAt) || "",
                  title: updated.title,
                  excerpt: toExcerpt(updated.content),
                  img: updated.image || "https://placehold.co/1200x800",
                  tag: tagColorOf(updated.category?.name),
                  content: updated.content,
                }
              : x
          )
        );

        await Swal.fire({ icon: "success", title: "Thành công", text: "Cập nhật bài viết thành công!" });
      }

      setOpenAdd(false);
      setEditing(null);
    } catch (e: any) {
      console.error(e);
      setErr(editing ? "Cập nhật thất bại. Vui lòng thử lại." : "Thêm bài thất bại. Vui lòng thử lại.");
      await Swal.fire({
        icon: "error",
        title: "Lỗi",
        text: editing ? "Cập nhật thất bại. Vui lòng thử lại." : "Thêm bài thất bại. Vui lòng thử lại.",
      });
    }
  };

  return (
    <div>
      <Header />

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Button className="btn-outline" onClick={() => { setEditing(null); setOpenAdd(true); }}>
          Add New Article
        </Button>
      </div>

      <Modal
        centered
        open={openAdd}
        onCancel={() => { setOpenAdd(false); setEditing(null); }}
        footer={null}
        destroyOnClose
        closable={false}
        mask
        maskClosable
        maskStyle={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        styles={{ content: { background: "transparent", boxShadow: "none", padding: 0 }, body: { padding: 0 } }}
      >
        <AddArticle
          onClose={() => { setOpenAdd(false); setEditing(null); }}
          onSubmit={handleSubmit}
          initialValues={
            editing
              ? {
                  title: editing.title,
                  categoryId: Number(editing.categoryId),
                  content: editing.content,
                  status: editing.status.toLowerCase() as "public" | "private",
                  image: editing.image,
                  mood: editing.mood,
                }
              : undefined
          }
          submitText={editing ? "Update" : "Add"}
          heading={editing ? "Edit Article" : "Add New Article"}
        />
      </Modal>

      <section className="bloggrid">
        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}><Spin /></div>
        ) : err ? (
          <Alert type="error" message={err} showIcon style={{ margin: 16 }} />
        ) : posts.length === 0 ? (
          <div style={{ padding: 24 }}><Empty description="Chưa có bài viết" /></div>
        ) : (
          <>
            <div className="bloggrid__grid">
              {paginatedPosts.map((p) => (
                <article
                  key={p.id}
                  className="post"
                  onClick={() => openPost(p)}
                  style={{ cursor: "pointer" }}
                  role="button"
                >
                  <div className="post__media">
                    <img src={p.img} alt={p.title} />
                  </div>

                  <div className="post__content">
                    <div className="post__date">Date: {p.date}</div>

                    <div className="post__title-row">
                      <h4 className="post__title">{p.title}</h4>
                      <FiArrowUpRight className="post__arrow" />
                    </div>

                    <p className="post__excerpt">{p.excerpt}</p>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="post__tag" style={{ background: p.tag.bg, color: p.tag.color }}>
                        {p.tag.text}
                      </span>

                      <span
                        onClick={(e) => handleEdit(e, p)}
                        style={{
                          cursor: "pointer",
                          color: "red",
                          background: "#F9F5FF",
                          borderRadius: "10px",
                          fontSize: "14px",
                          padding: "5px 10px",
                          fontFamily: "sans-serif",
                        }}
                      >
                        Edit your post
                      </span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <PaginationBar
              current={currentPage}
              total={posts.length}
              pageSize={pageSize}
              onChange={setCurrentPage}
            />
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

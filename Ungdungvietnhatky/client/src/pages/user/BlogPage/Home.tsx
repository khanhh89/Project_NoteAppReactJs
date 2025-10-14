import React, { useState, useMemo, useEffect } from "react";
import {
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Divider,
  Spin,
  Empty,
  Alert,
  Button, // <-- thêm Button
} from "antd";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import "./Home.scss";
import Header from "../../../layouts/Header/Header";
import Footer from "../../../layouts/Footer/Footer";
import { FiArrowUpRight } from "react-icons/fi";
import PaginationBar from "../../../components/PaginationBar/PaginationBar";
import axios from "axios";

const { Title, Paragraph, Text } = Typography;

type TagInfo = { text: string; bg: string; color: string };
export type Post = {
  id: number;
  date: string;
  title: string;
  excerpt: string;
  img: string;
  tag: TagInfo;
  featured?: boolean;
  content?: string;
};

type Status = "Public" | "Private";
interface Category {
  id: number;
  name: string;
}
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
}
interface ArticleExpanded extends Article {
  category?: Category;
}

// Màu theo danh mục
const tagColorOf = (name?: string): TagInfo => {
  const key = (name || "General").toLowerCase();
  if (key.includes("daily")) return { text: name || "Daily Journal", bg: "#e8f3ff", color: "#1677ff" };
  if (key.includes("work")) return { text: name || "Work & Career", bg: "#eefbf3", color: "#22a06b" };
  if (key.includes("personal")) return { text: name || "Personal Thoughts", bg: "#e9fff2", color: "#1d9e6f" };
  return { text: name || "General", bg: "#f5f5f5", color: "#595959" };
};

const toExcerpt = (s: string, max = 140) => (s?.length > max ? s.slice(0, max).trim() + "…" : s || "");
const toDate = (iso?: string) => (iso ? iso.slice(0, 10) : ""); // lấy ngày yyyy-mm-dd

// Bỏ dấu để tìm kiếm không dấu
const normalize = (s: string) => s?.toLowerCase().normalize("NFD").replace(/\p{Diacritic}/gu, "") || "";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [active, setActive] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const pageSize = 6;
  const navigate = useNavigate();

  // lấy & set query params (?q=)
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const qn = normalize(q);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await axios.get<ArticleExpanded[]>("http://localhost:8080/articles", {
          params: { _expand: "category", _sort: "createdAt", _order: "desc" },
        });

        const mapped: Post[] = (data || [])
          .filter((a) => a.status !== "Private")
          .map((a) => {
            const tag = tagColorOf(a.category?.name);
            return {
              id: a.id,
              date: toDate(a.createdAt) || toDate(a.updatedAt) || "",
              title: a.title,
              excerpt: toExcerpt(a.content),
              img: a.image || "https://placehold.co/1200x800",
              tag,
              content: a.content,
            };
          });

        setPosts(mapped);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải bài viết. Kiểm tra server hoặc schema dữ liệu.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Danh mục từ dữ liệu
  const categories = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => set.add(p.tag.text));
    return ["All", ...Array.from(set)];
  }, [posts]);

  // Lọc theo từ khóa
  const searched = useMemo(() => {
    if (!qn) return posts;
    return posts.filter((p) => {
      const t = normalize(p.title);
      const c = normalize(p.content || "");
      return t.includes(qn) || c.includes(qn);
    });
  }, [posts, qn]);

  // Lọc theo danh mục
  const filtered = useMemo(
    () => (active === "All" ? searched : searched.filter((p) => p.tag.text === active)),
    [searched, active]
  );

  // Phân trang
  const paginatedPosts = useMemo(
    () => filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filtered, currentPage]
  );

  // Recent section
  const recentFeature = posts[posts.length - 1];
  const recentRightCol = posts.slice(Math.max(posts.length - 3, 0), Math.max(posts.length - 1, 0));

  const goDetail = (p: Post) => navigate(`/post/${p.id}`, { state: p });

  // Xoá bộ lọc + query ?q=
  const handleClearFilters = () => {
    setActive("All");
    setCurrentPage(1);
    setSearchParams({});
  };

  return (
    <div>
      <Header />

      <section className="recent-antd">
        <div className="recent-antd__top">
          <Title level={4} style={{ margin: 0 }}>
            Recent blog posts
          </Title>
          <div className="recent-antd__bar" />
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Spin />
          </div>
        ) : err ? (
          <Alert type="error" message={err} showIcon style={{ marginBottom: 16 }} />
        ) : !recentFeature ? (
          <Empty description="Chưa có bài viết" />
        ) : (
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={14}>
              <Card
                className="recent-antd__feature"
                cover={<img alt={recentFeature.title} src={recentFeature.img} className="cover-16x9" />}
                bordered={false}
                hoverable
                onClick={() => goDetail(recentFeature)}
              >
                <Text className="date">Date: {recentFeature.date}</Text>
                <Title level={4} className="title">
                  {recentFeature.title}
                </Title>
                <Paragraph className="excerpt">{recentFeature.excerpt}</Paragraph>
                <Tag color={recentFeature.tag.bg} style={{ color: recentFeature.tag.color, border: "none" }}>
                  {recentFeature.tag.text}
                </Tag>
              </Card>
            </Col>

            <Col xs={24} lg={10}>
              <Row gutter={[0, 18]}>
                {recentRightCol.map((p, i) => (
                  <Col span={24} key={p.id}>
                    <Card className="recent-antd__small" bordered={false} hoverable onClick={() => goDetail(p)}>
                      <Row gutter={14} align="top">
                        <Col span={10}>
                          <div className="thumb-16x10">
                            <img alt={p.title} src={p.img} />
                          </div>
                        </Col>
                        <Col span={14}>
                          <Text className="date">Date: {p.date}</Text>
                          <Title level={5} className="title">
                            {p.title}
                          </Title>
                          <Paragraph className="excerpt">{p.excerpt}</Paragraph>
                          <Tag color={p.tag.bg} style={{ color: p.tag.color, border: "none" }}>
                            {p.tag.text}
                          </Tag>
                        </Col>
                      </Row>
                    </Card>
                    {i !== recentRightCol.length - 1 && <Divider style={{ margin: 0 }} />}
                  </Col>
                ))}
              </Row>
            </Col>
          </Row>
        )}
      </section>

      <section className="bloggrid">
        <div className="bloggrid__links">
          <a href="#" className="active">
            All blog posts
          </a>
          <Link to="/my-posts">All my Posts</Link>
        </div>

        <div className="bloggrid__cats">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat ${active === cat ? "is-active" : ""}`}
              onClick={() => {
                setActive(cat);
                setCurrentPage(1);
              }}
              disabled={loading}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 24, textAlign: "center" }}>
            <Spin />
          </div>
        ) : err ? (
          <Alert type="error" message={err} showIcon />
        ) : filtered.length === 0 ? (
          <div style={{ padding: 32 }}>
            <Empty
              description={qn ? <>Không tìm thấy bài viết cho từ khóa “{q}”.</> : <>Không có bài viết trong danh mục này.</>}
            >
              {/* <Button type="primary" onClick={handleClearFilters}>
                Xóa bộ lọc
              </Button> */}
            </Empty>
          </div>
        ) : (
          <>
            <div className="bloggrid__grid">
              {paginatedPosts.map((p) => (
                <article
                  key={p.id}
                  className="post"
                  role="button"
                  tabIndex={0}
                  onClick={() => goDetail(p)}
                  onKeyDown={(e) => (e.key === "Enter" ? goDetail(p) : null)}
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
                    <span className="post__tag" style={{ background: p.tag.bg, color: p.tag.color }}>
                      {p.tag.text}
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <PaginationBar current={currentPage} total={filtered.length} pageSize={pageSize} onChange={setCurrentPage} />
          </>
        )}
      </section>

      <Footer />
    </div>
  );
}

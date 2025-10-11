import React, { useState } from "react";
import { Row, Col, Card, Typography, Tag, Divider } from "antd";
import { useNavigate, Link } from "react-router-dom";
import "./Home.scss";
import Header from "../../../layouts/Header/Header";
import Footer from "../../../layouts/Footer/Footer";
import { FiArrowUpRight } from "react-icons/fi";
import PaginationBar from "../../../components/PaginationBar/PaginationBar";
// import HeaderLogin from "../../../layouts/Header/HeaderLogin"
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

const posts: Post[] = [
  {
    id: 1,
    date: "2025-02-25",
    title: "A Productive Day at Work",
    excerpt:
      "Today was a really productive day at work. I managed to finish a report ahead of schedule and received positive feedback from my manager.",
    tag: { text: "Daily Journal", bg: "#e8f3ff", color: "#1677ff" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
    featured: true,
    content:
      "Full content… I managed to finish a report ahead of schedule and received positive feedback from my manager. After work, I went for a walk in the park, enjoying the fresh air. Looking forward to another great day tomorrow!",
  },
  {
    id: 2,
    date: "2025-02-24",
    title: "My First Job Interview Experience",
    excerpt:
      "I had my first job interview today! I was nervous at first, but as the conversation went on, I felt more confident.",
    tag: { text: "Work & Career", bg: "#eefbf3", color: "#22a06b" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 3,
    date: "2025-02-23",
    title: "Overthinking Everything",
    excerpt:
      "Lately, I have been overthinking everything, from small decisions to bigger life choices. I know I should trust myself.",
    tag: { text: "Personal Thoughts", bg: "#e9fff2", color: "#1d9e6f" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 4,
    date: "2025-02-22",
    title: "A Walk in the Park",
    excerpt: "A refreshing walk in the park today. The weather was perfect.",
    tag: { text: "Daily Journal", bg: "#e8f3ff", color: "#1677ff" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 5,
    date: "2025-02-21",
    title: "Learning a New Skill",
    excerpt: "Started learning how to play the guitar. It's challenging but fun.",
    tag: { text: "Personal Thoughts", bg: "#e9fff2", color: "#1d9e6f" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 6,
    date: "2025-02-20",
    title: "Team Lunch",
    excerpt:
      "Had a great team lunch today. It's always good to bond with colleagues outside of work.",
    tag: { text: "Work & Career", bg: "#eefbf3", color: "#22a06b" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 7,
    date: "2025-02-19",
    title: "Movie Night",
    excerpt:
      "Watched a great movie tonight. It was a thriller and kept me on the edge of my seat.",
    tag: { text: "Daily Journal", bg: "#e8f3ff", color: "#1677ff" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 8,
    date: "2025-02-18",
    title: "A New Beginning",
    excerpt:
      "Starting a new chapter in my life. I'm excited for what's to come.",
    tag: { text: "Personal Thoughts", bg: "#e9fff2", color: "#1d9e6f" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
  {
    id: 9,
    date: "2025-02-17",
    title: "Work from Home",
    excerpt:
      "Working from home has its pros and cons. Today was a productive day.",
    tag: { text: "Work & Career", bg: "#eefbf3", color: "#22a06b" },
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop",
  },
];

const categories = ["All", ...new Set(posts.map((p) => p.tag.text))];

export default function Home() {
  const feature = posts[0];
  const rightCol = posts.slice(1, 3);
  const [active, setActive] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 4;
  const navigate = useNavigate();

  const filtered = active === "All" ? posts : posts.filter((p) => p.tag.text === active);
  const paginatedPosts = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const goDetail = (p: Post) => navigate(`/post/${p.id}`,{ state:p });

  return (
    <div>
      <Header />
      {/* <HeaderLogin/> */}
      <section className="recent-antd">
        <div className="recent-antd__top">
          <Title level={4} style={{ margin: 0 }}>Recent blog posts</Title>
          <div className="recent-antd__bar" />
        </div>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={14}>
            <Card
              className="recent-antd__feature"
              cover={<img alt={feature.title} src={feature.img} className="cover-16x9" />}
              bordered={false}
              hoverable
              onClick={() => goDetail(feature)}
            >
              <Text className="date">Date: {feature.date}</Text>
              <Title level={4} className="title">{feature.title}</Title>
              <Paragraph className="excerpt">{feature.excerpt}</Paragraph>
              <Tag color={feature.tag.bg} style={{ color: feature.tag.color, border: "none" }}>
                {feature.tag.text}
              </Tag>
            </Card>
          </Col>

          <Col xs={24} lg={10}>
            <Row gutter={[0, 18]}>
              {rightCol.map((p) => (
                <Col span={24} key={p.id}>
                  <Card
                    className="recent-antd__small"
                    bordered={false}
                    hoverable
                    onClick={() => goDetail(p)}
                  >
                    <Row gutter={14} align="top">
                      <Col span={10}>
                        <div className="thumb-16x10">
                          <img alt={p.title} src={p.img} />
                        </div>
                      </Col>
                      <Col span={14}>
                        <Text className="date">Date: {p.date}</Text>
                        <Title level={5} className="title">{p.title}</Title>
                        <Paragraph className="excerpt">{p.excerpt}</Paragraph>
                        <Tag color={p.tag.bg} style={{ color: p.tag.color, border: "none" }}>
                          {p.tag.text}
                        </Tag>
                      </Col>
                    </Row>
                  </Card>
                  {p.id !== rightCol[rightCol.length - 1].id && (
                    <Divider style={{ margin: 0 }} />
                  )}
                </Col>
              ))}
            </Row>
          </Col>
        </Row>
      </section>

      <section className="bloggrid">
        <div className="bloggrid__links">
          <a href="#" className="active">All blog posts</a>
          <Link to="/my-posts">All my Posts</Link>
        </div>

        <div className="bloggrid__cats">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat ${active === cat ? "is-active" : ""}`}
              onClick={() => { setActive(cat); setCurrentPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>

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
                <span
                  className="post__tag"
                  style={{ background: p.tag.bg, color: p.tag.color }}
                >
                  {p.tag.text}
                </span>
              </div>
            </article>
          ))}
        </div>

        <PaginationBar
          current={currentPage}
          total={filtered.length}
          pageSize={pageSize}
          onChange={setCurrentPage}
          />
      </section>

      <Footer />
    </div>
  );
}

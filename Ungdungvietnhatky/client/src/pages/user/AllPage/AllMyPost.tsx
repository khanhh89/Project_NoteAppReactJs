import React, { useState } from "react";
import "./AllPage.scss";
import Header from "../../../layouts/Header/Header";
import Footer from "../../../layouts/Footer/Footer";
import { FiArrowUpRight } from "react-icons/fi";
import PaginationBar from "../../../components/PaginationBar/PaginationBar";
import { Button, Modal } from "antd";
import AddArticle from "../../../components/AddArticle/AddArticle";
import { useNavigate } from "react-router-dom";

type Post = {
  id: number;
  date: string;
  title: string;
  excerpt: string;
  tag: { text: string; bg: string; color: string };
  img: string;
  featured?: boolean;
  edit?: boolean;
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
    img: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?q=80&w=1200&auto=format&fit=crop" },
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
    excerpt:
      "Started learning how to play the guitar. It's challenging but fun.",
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
    img: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/...",
  },
];


export default function AllMyPost() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const [openAdd, setOpenAdd] = useState(false);

  const navigate = useNavigate();

  const paginatedPosts = posts.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const openPost = (post: Post) => {
    // điều hướng sang trang chi tiết, kèm state để đỡ gọi API lần đầu
    navigate(`/post/${post.id}`, { state: post });
  };

  const handleEdit = (e: React.MouseEvent, post: Post) => {
    e.stopPropagation(); // tránh trigger openPost
    navigate(`/post/${post.id}/edit`, { state: post });
  };

  return (
    <div>
      <Header />

      <div style={{ textAlign: "center", marginTop: 12 }}>
        <Button className="btn-outline" onClick={() => setOpenAdd(true)}>
          Add New Article
        </Button>
      </div>

      {/* Modal Add Article giữ nguyên */}
      <Modal
        centered
        open={openAdd}
        onCancel={() => setOpenAdd(false)}
        footer={null}
        destroyOnClose
        closable={false}
        mask
        maskClosable
        maskStyle={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(2px)" }}
        styles={{
          content: { background: "transparent", boxShadow: "none", padding: 0 },
          body: { padding: 0 },
        }}
      >
        <AddArticle onClose={() => setOpenAdd(false)} />
      </Modal>

      <section className="bloggrid">
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
                  <span
                    className="post__tag"
                    style={{ background: p.tag.bg, color: p.tag.color }}
                  >
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
      </section>

      <Footer />
    </div>
  );
}

// PostDetails.tsx (thay cho PostThread cũ)
import React, { useEffect, useState } from "react";
import { Avatar, Spin, Alert, Empty } from "antd";
import {
  MessageOutlined,
  LikeOutlined,
  DownOutlined,
  UpOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import "./PostDetails.scss";

type Status = "Public" | "Private";
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

type Comment = {
  id: number;
  author: string;
  avatar?: string;
  text: string;
  likes: number;
  replies: number;
};

const seedComments: Comment[] = [
  {
    id: 1,
    author: "Jenny",
    avatar:
      "https://i.pravatar.cc/100?img=12",
    text: "Very good!",
    likes: 15,
    replies: 6,
  },
  {
    id: 2,
    author: "Miki",
    avatar:
      "https://i.pravatar.cc/100?img=21",
    text: "Hello Rikkei!",
    likes: 10,
    replies: 3,
  },
];

const isBlobUrl = (u?: string) => !!u && u.startsWith("blob:");
const safeImg = (u?: string) =>
  !u || isBlobUrl(u) ? "https://placehold.co/200x200" : u;

export default function PostDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation() as { state?: any };

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Local UI states
  const [showAll, setShowAll] = useState(true);
  const [likes, setLikes] = useState(0);

  useEffect(() => {
    // Nếu có state từ list thì dùng ngay để tránh nháy
    if (location.state?.title || location.state?.content) {
      const st = location.state;
      setArticle({
        id: Number(id),
        title: st.title,
        content: st.content || st.excerpt || "",
        image: st.img,
        categoryId: st.categoryId ?? 0,
        status: (st.status as Status) || "Public",
        mood: st.mood || "",
        createdAt: st.createdAt,
        updatedAt: st.updatedAt,
      });
    }
  }, [id, location.state]);

  useEffect(() => {
    // Luôn fetch theo id để đảm bảo reload/direct-link hoạt động
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const { data } = await axios.get<Article>(
          `http://localhost:8080/articles/${id}`
        );
        setArticle(data);
      } catch (e: any) {
        if (e?.response?.status === 404) {
          setErr("Bài viết không tồn tại (404).");
        } else {
          setErr("Không thể tải bài viết. Vui lòng thử lại.");
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleBack = () => navigate(-1);

  if (loading) {
    return (
      <div className="thread thread--center">
        <Spin />
      </div>
    );
  }

  if (err) {
    return (
      <div className="thread thread--center">
        <Alert type="error" message={err} showIcon />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="thread thread--center">
        <Empty description="Không tìm thấy bài viết" />
      </div>
    );
  }

  return (
    <div className="thread">
      {/* Avatar người đăng: dùng article.image (yêu cầu “avatar tương ứng với bài viết”)
          Nếu ảnh là blob: fallback placeholder để không lỗi */}
      <div className="thread__avatar">
        <Avatar size={32} src={safeImg(article.image)} />
      </div>

      <div className="thread__card">
        <div className="thread__header">
          <button
            className="thread__back"
            aria-label="Back"
            onClick={handleBack}
            type="button"
          >
            <LeftOutlined />
          </button>
          {/* <h2 className="thread__title">{article.title}</h2> */}
        </div>

        <div className="thread__content">
          <h2 className="thread__title">{article.title}</h2>
          {article.content}
          </div>

        <div className="thread__actions">
          <button className="action" onClick={() => setLikes((n) => n + 1)} type="button">
            <LikeOutlined /> <span>{likes} Like</span>
          </button>
          <button className="action" type="button">
            <MessageOutlined /> <span>{seedComments.length} Replies</span>
          </button>
        </div>

        <button className="thread__viewall" onClick={() => setShowAll((v) => !v)} type="button">
          <span>View all {seedComments.length} comments</span>
          {showAll ? <UpOutlined className="caret" /> : <DownOutlined className="caret" />}
        </button>

        {showAll && (
          <div className="thread__comments">
            {seedComments.map((c) => (
              <div key={c.id} className="cmt">
                <div className="cmt__avatar">
                  <Avatar size={28} src={c.avatar} />
                </div>
                <div className="cmt__bubble">
                  <div className="cmt__author">{c.author}</div>
                  <div className="cmt__text">{c.text}</div>
                  <div className="cmt__actions">
                    <button className="action" type="button">
                      <LikeOutlined /> <span>{c.likes} Like</span>
                    </button>
                    <button className="action" type="button">
                      <MessageOutlined /> <span>{c.replies} Replies</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

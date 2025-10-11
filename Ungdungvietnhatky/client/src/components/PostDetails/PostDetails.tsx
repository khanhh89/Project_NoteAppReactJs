import React, { useState } from "react";
import { Avatar } from "antd";
import {
  MessageOutlined,
  LikeOutlined,
  DownOutlined,
  UpOutlined,
  LeftOutlined,
} from "@ant-design/icons";
import "./PostDetails.scss";

type Comment = {
  id: number;
  author: string;
  avatar?: string;
  text: string;
  likes: number;
  replies: number;
};

type Props = {
  onBack?: () => void;
  title?: string;
  content?: string;
  authorAvatar?: string;
};

const seedComments: Comment[] = [
  {
    id: 1,
    author: "Jenny",
    avatar:
      "https://sonq1.com.vn/upload/product/airblade-125i-do-phong-cach-ducati-voi-cac-mon-do-choi-chinh-hang1658824228.jpg",
    text: "Very good!",
    likes: 15,
    replies: 6,
  },
  {
    id: 2,
    author: "Miki",
    avatar:
      "https://ttracing.net/wp-content/uploads/2021/06/CO-TITAN-32-RA-35-RA-51.jpg",
    text: "Hello Rikkei!",
    likes: 10,
    replies: 3,
  },
];

export default function PostThread({
  onBack,
  title = "A Productive Day at Work",
  content = `Today was a really productive day at work. I managed to finish a report ahead of schedule and received positive feedback from my manager.
After work, I went for a walk in the park, enjoying the fresh air. Looking forward to another great day tomorrow!`,
  authorAvatar = "https://vuquantuvi.wordpress.com/wp-content/uploads/2016/04/111.jpg",
}: Props) {
  const [showAll, setShowAll] = useState(true);
  const [likes, setLikes] = useState(15);

  const handleBack = () => {
    if (onBack) onBack();
    else window.history.back();
  };

  return (
    <div className="thread">
      {/* Avatar người đăng */}
      <div className="thread__avatar">
        <Avatar size={32} src={authorAvatar} />
      </div>

      {/* Thẻ bài viết */}
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
          <h2 className="thread__title">{title}</h2>
        </div>

        <div className="thread__content">{content}</div>

        {/* Nút hành động */}
        <div className="thread__actions">
          <button
            className="action"
            onClick={() => setLikes((n) => n + 1)}
            type="button"
          >
            <LikeOutlined /> <span>{likes} Like</span>
          </button>
          <button className="action" type="button">
            <MessageOutlined /> <span>6 Replies</span>
          </button>
        </div>

        {/* Nút xem tất cả bình luận */}
        <button
          className="thread__viewall"
          onClick={() => setShowAll((v) => !v)}
          type="button"
        >
          <span>View all 12 comments</span>
          {showAll ? (
            <UpOutlined className="caret" />
          ) : (
            <DownOutlined className="caret" />
          )}
        </button>

        {/* Danh sách bình luận */}
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

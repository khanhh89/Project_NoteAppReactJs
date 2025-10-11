import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  Tag,
  Select,
  Button,
  Space,
  Typography,
  Image,
  message,
  Modal,
  Spin,
  Empty,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import Swal from "sweetalert2";
import axios from "axios";
import "./ManagerArticle.scss";
import PaginationBar from "../../components/PaginationBar/PaginationBar";
import AddArticle from "../../components/AddArticle/AddArticle";
import dayjs from "dayjs";
const { Title, Text } = Typography;

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

const statusTag = (s: Status) =>
  s === "Public" ? (
    <Tag color="blue">Public</Tag>
  ) : (
    <Tag color="red">Private</Tag>
  );

export default function ManagerArticle() {
  const [data, setData] = useState<ArticleExpanded[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<ArticleExpanded | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const PAGE_SIZE = 4;

  // Load danh sách
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setErr(null);
        const res = await axios.get<ArticleExpanded[]>(
          "http://localhost:8080/articles",
          { params: { _expand: "category" } }
        );
        setData(res.data || []);
      } catch (e) {
        console.error(e);
        setErr("Không thể tải danh sách bài viết.");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    })();
  }, []);

  const filtered = useMemo(() => data, [data]);
  const total = filtered.length;
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageData = filtered.slice(start, start + PAGE_SIZE);

  const handleStatusChange = async (id: number, newStatus: Status) => {
    try {
      setData((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      );
      await axios.patch(`http://localhost:8080/articles/${id}`, {
        status: newStatus,
      });
      message.success(`Đã đổi trạng thái #${id} → ${newStatus}`);
    } catch (e) {
      console.error(e);
      setData((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: a.status } : a))
      );
      message.error("Đổi trạng thái thất bại");
    }
  };

  const openAdd = () => {
    setEditing(null);
    setShowAdd(true);
  };

  const handleEdit = (id: number) => {
    const found = data.find((d) => d.id === id);
    if (!found) return;
    setEditing(found);
    setShowAdd(true);
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Xóa bài viết?",
      text: "Bạn có chắc chắn muốn xóa bài viết này?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    });
    if (!result.isConfirmed) return;

    try {
      await axios.delete(`http://localhost:8080/articles/${id}`);
      setData((prev) => prev.filter((a) => a.id !== id));
      await Swal.fire({
        icon: "success",
        title: "Đã xóa!",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        text: "Vui lòng thử lại.",
      });
    }
  };

  /** Submit từ AddArticle:
   * - editing == null → THÊM
   * - editing != null → SỬA
   * values: { title, categoryId, content, status: 'public'|'private', files? }
   */
 const handleSubmit = async (values: any) => {
  const title = values.title?.trim();
  const categoryId: number | undefined = values.categoryId;
  const content = values.content?.trim() || "";
  const status: Status = values.status === "public" ? "Public" : "Private";
  const mood = values.mood;

  if (!title || !categoryId) {
    await Swal.fire({
      icon: "warning",
      title: "Thiếu thông tin!",
      text: "Vui lòng nhập tiêu đề và chọn danh mục.",
    });
    return;
  }

  // ✅ bổ sung dòng này
  const now = new Date().toISOString();

  Swal.fire({
    title: editing ? "Đang cập nhật..." : "Đang thêm bài viết...",
    allowOutsideClick: false,
    didOpen: () => Swal.showLoading(),
  });

  try {
    let imageUrl = editing?.image || "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRd0VGHX6Lj9LN6ApZDL1C6Qn8Lx8W6VwbIvg&s";
    const file = values?.files?.[0]?.originFileObj as File | undefined;
    if (file) {
      imageUrl = URL.createObjectURL(file);
    }

    if (!editing) {
      const payload = {
        title,
        categoryId,
        content,
        status,
        image: imageUrl,
        mood,
        createdAt: now,   // ✅ set khi tạo
        updatedAt: now,   // ✅ set khi tạo
      };
      const res = await axios.post<Article>("http://localhost:8080/articles", payload);
      const saved = res.data;

      const { data: expanded } = await axios.get<ArticleExpanded>(
        `http://localhost:8080/articles/${saved.id}`,
        { params: { _expand: "category" } }
      );

      setData((prev) => [expanded, ...prev]);
      setCurrentPage(1);
      await Swal.fire({ icon: "success", title: "Thêm thành công!", timer: 900, showConfirmButton: false });
    } else {
      const payload = {
        title,
        categoryId,
        content,
        status,
        image: imageUrl,
        mood,
        updatedAt: now,   // ✅ chỉ set khi cập nhật
      };
      await axios.patch<Article>(`http://localhost:8080/articles/${editing.id}`, payload);

      const { data: updated } = await axios.get<ArticleExpanded>(
        `http://localhost:8080/articles/${editing.id}`,
        { params: { _expand: "category" } }
      );

      setData((prev) => prev.map((a) => (a.id === editing.id ? updated : a)));
      await Swal.fire({ icon: "success", title: "Cập nhật thành công!", timer: 900, showConfirmButton: false });
    }

    setShowAdd(false);
    setEditing(null);
  } catch (err) {
    console.error(err);
    await Swal.fire({
      icon: "error",
      title: editing ? "Cập nhật thất bại" : "Thêm thất bại",
      text: "Vui lòng thử lại.",
    });
  }
};


  const columns = [
    {
      title: "Ảnh",
      dataIndex: "image",
      width: 130,
      render: (src: string, r: ArticleExpanded) => (
        <Image
          src={src}
          alt={r.title}
          width={100}
          height={80}
          style={{ objectFit: "cover", borderRadius: 6 }}
        />
      ),
    },
    {
      title: "Tiêu đề",
      dataIndex: "title",
      width: 120,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: "Chủ đề",
      dataIndex: "category",
      width: 130,
      render: (_: any, r: ArticleExpanded) => r.category?.name ?? "(Không có)",
    },
    { title: "Nội dung", dataIndex: "content", ellipsis: true, with: 400 },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: 90,
      render: (s: Status) => statusTag(s),
    },
    {
      title: "Chỉnh sửa trạng thái",
      key: "change",
      width: 150,
      render: (_: any, r: ArticleExpanded) => (
        <Select<Status>
          value={r.status}
          style={{ width: 90 }}
          onChange={(val) => handleStatusChange(r.id, val)}
          options={[
            { value: "Public", label: "Public" },
            { value: "Private", label: "Private" },
          ]}
        />
      ),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 160,
      render: (_: any, r: ArticleExpanded) => (
        <Space>
          <Button className="btn-edit-red" onClick={() => handleEdit(r.id)}>
            Sửa
          </Button>
          <Button
            className="btn-delete-green"
            onClick={() => handleDelete(r.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    }]

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "16px 20px" }}>
      <Title
        level={3}
        style={{ textAlign: "center", fontSize: 32, fontWeight: 600 }}
      >
        Quản lý bài viết
      </Title>

      <div style={{ display: "flex" }}>
        <Button
          type="primary"
          
          onClick={openAdd}
          style={{ borderRadius: 20, margin: 20, backgroundColor: "#65558F" }}
        >
          Thêm bài viết
        </Button>
      </div>

      {loading && (
        <div style={{ padding: 40, textAlign: "center" }}>
          <Spin size="large" />
        </div>
      )}

      {!loading && err && (
        <div style={{ color: "crimson", padding: 16 }}>{err}</div>
      )}

      {!loading && !err && data.length === 0 && (
        <div style={{ padding: 24 }}>
          <Empty description="Chưa có bài viết" />
        </div>
      )}

      {!loading && !err && data.length > 0 && (
        <>
          <Table<ArticleExpanded>
            rowKey="id"
            columns={columns as any}
            dataSource={pageData}
            className="mgr-article__table mgr-article__table--compact"
            size="small"
            pagination={false}
          />
          <PaginationBar
            current={currentPage}
            total={total}
            pageSize={PAGE_SIZE}
            onChange={(p: number) => setCurrentPage(p)}
          />
        </>
      )}

      <Modal
        centered
        open={showAdd}
        onCancel={() => {
          setShowAdd(false);
          setEditing(null);
        }}
        footer={null}
        destroyOnClose
        closable={false}
        mask
        maskClosable
        maskStyle={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(2px)",
        }}
        styles={{
          content: { background: "transparent", boxShadow: "none", padding: 0 },
          body: { padding: 0 },
        }}
      >
        <AddArticle
          key={editing ? `edit-${editing.id}` : "create"}
          onClose={() => {
            setShowAdd(false);
            setEditing(null);
          }}
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
    </div>
  );
}

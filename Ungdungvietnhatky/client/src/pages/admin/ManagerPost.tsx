import React, { useState, useMemo, useEffect } from "react";
import { Table, Button, Space, Typography, Input, Card, Row, Col } from "antd";
import { PlusOutlined, FolderOpenOutlined, SearchOutlined } from "@ant-design/icons";
import "./ManagerPost.scss";
import axios from "axios";
import Swal from "sweetalert2";
import PaginationBar from "../../../src/components/PaginationBar/PaginationBar";

const { Title, Text } = Typography;

interface Category {
  id: number;
  name: string;
}

function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loadingList, setLoadingList] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());

  // ========= LOAD LIST =========
  useEffect(() => {
    (async () => {
      try {
        setLoadingList(true);
        const res = await axios.get<Category[]>("http://localhost:8080/categories");
        setCategories(res.data || []);
      } catch (e) {
        console.error(e);
        await Swal.fire({
          icon: "error",
          title: "Không thể tải danh mục",
          text: "Vui lòng kiểm tra server hoặc đường dẫn API.",
          confirmButtonColor: "#1677ff",
        });
      } finally {
        setLoadingList(false);
      }
    })();
  }, []);

  // ========= SEARCH + SORT =========
  const filteredCategories = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    const sorted = [...categories].sort((a, b) => a.id - b.id);
    return sorted.filter((c) => c.name.toLowerCase().includes(q));
  }, [categories, searchTerm]);

  // ========= PAGINATION =========
  const pageSize = 4;
  const [currentPage, setCurrentPage] = useState(1);

  // Reset về trang 1 khi thay đổi từ khóa tìm kiếm
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paged = useMemo(
    () => filteredCategories.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [filteredCategories, currentPage]
  );

  // ========= HELPERS =========
  const hasArticlesInCategory = async (categoryId: number) => {
    try {
      // chỉ cần biết có tồn tại bài viết hay không (_limit=1 cho nhanh)
      const res = await axios.get("http://localhost:8080/articles", {
        params: { categoryId, _limit: 1 },
      });
      return Array.isArray(res.data) && res.data.length > 0;
    } catch (e) {
      console.error(e);
      // Nếu lỗi khi kiểm tra, coi như có ràng buộc để an toàn
      return true;
    }
  };

  // ========= ADD =========
  const handleAddCategory = async () => {
    const name = newCategoryName.trim();
    if (!name) {
      await Swal.fire({
        icon: "warning",
        title: "Thiếu tên danh mục",
        text: "Vui lòng nhập tên danh mục trước khi thêm.",
        confirmButtonColor: "#1677ff",
      });
      return;
    }
    if (categories.some((c) => c.name.trim().toLowerCase() === name.toLowerCase())) {
      await Swal.fire({
        icon: "info",
        title: "Danh mục đã tồn tại",
        text: `Tên "${name}" đã có trong hệ thống.`,
        confirmButtonColor: "#1677ff",
      });
      return;
    }

    try {
      setAdding(true);
      const res = await axios.post<Category>("http://localhost:8080/categories", { name });
      setCategories((prev) => [...prev, res.data]);
      setNewCategoryName("");

      await Swal.fire({
        icon: "success",
        title: "Thêm danh mục thành công",
        text: `Đã thêm: ${name}`,
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error(e);
      await Swal.fire({
        icon: "error",
        title: "Thêm danh mục thất bại",
        text: "Vui lòng thử lại.",
        confirmButtonColor: "#1677ff",
      });
    } finally {
      setAdding(false);
    }
  };

  // ========= DELETE (blocked if has articles) =========
  const confirmAndDelete = async (cat: Category) => {
    // 1) Kiểm tra ràng buộc: nếu còn bài viết thì chặn
    const blocked = await hasArticlesInCategory(cat.id);
    if (blocked) {
      await Swal.fire({
        icon: "info",
        title: "Không thể xóa danh mục",
        text: `Danh mục "${cat.name}" vẫn còn bài viết. Hãy chuyển danh mục hoặc xóa các bài viết trước.`,
        confirmButtonColor: "#1677ff",
      });
      return;
    }

    // 2) Hỏi xác nhận
    const res = await Swal.fire({
      title: "Xóa danh mục?",
      text: `Bạn có chắc muốn xóa "${cat.name}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#ff4d4f",
      cancelButtonColor: "#595959",
      reverseButtons: true,
    });

    if (!res.isConfirmed) return;

    // 3) Xóa (optimistic)
    const prev = categories;
    const next = categories.filter((c) => c.id !== cat.id);
    setCategories(next);
    setDeletingIds((s) => new Set(s).add(cat.id));

    try {
      await axios.delete(`http://localhost:8080/categories/${cat.id}`);
      await Swal.fire({
        icon: "success",
        title: "Đã xóa danh mục",
        timer: 1000,
        showConfirmButton: false,
      });
    } catch (e) {
      console.error(e);
      setCategories(prev);
      await Swal.fire({
        icon: "error",
        title: "Xóa thất bại",
        text: "Vui lòng thử lại.",
        confirmButtonColor: "#1677ff",
      });
    } finally {
      setDeletingIds((s) => {
        const copy = new Set(s);
        copy.delete(cat.id);
        return copy;
      });
    }
  };

  // ========= EDIT =========
  const promptAndEdit = async (cat: Category) => {
    const { value: newName, isConfirmed } = await Swal.fire({
      title: "Sửa danh mục",
      input: "text",
      inputValue: cat.name,
      inputLabel: "Tên danh mục",
      inputAttributes: { autocapitalize: "off" },
      showCancelButton: true,
      confirmButtonText: "Lưu",
      cancelButtonText: "Hủy",
      confirmButtonColor: "#1677ff",
      cancelButtonColor: "#595959",
      showLoaderOnConfirm: true,
      preConfirm: async (value) => {
        const trimmed = (value || "").trim();
        if (!trimmed) {
          Swal.showValidationMessage("Tên danh mục không được để trống.");
          return false;
        }
        const dup = categories
          .filter((c) => c.id !== cat.id)
          .some((c) => c.name.toLowerCase() === trimmed.toLowerCase());
        if (dup) {
          Swal.showValidationMessage("Danh mục này đã tồn tại.");
          return false;
        }

        try {
          await axios.patch(`http://localhost:8080/categories/${cat.id}`, { name: trimmed });
          return trimmed;
        } catch (e) {
          console.error(e);
          Swal.showValidationMessage("Cập nhật thất bại, vui lòng thử lại.");
          return false;
        }
      },
      allowOutsideClick: () => !Swal.isLoading(),
    });

    if (!isConfirmed || !newName) return;

    setCategories((prev) => prev.map((c) => (c.id === cat.id ? { ...c, name: newName } : c)));

    await Swal.fire({
      icon: "success",
      title: "Đã cập nhật danh mục",
      timer: 900,
      showConfirmButton: false,
    });
  };

  const columns = [
    {
      title: "#",
      dataIndex: "id",
      key: "id",
      width: 60,
      render: (_: number, __: Category, index: number) => index + 1 + (currentPage - 1) * pageSize,
    },
    {
      title: "Category Name",
      dataIndex: "name",
      key: "name",
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: "Actions",
      key: "actions",
      width: 200,
      render: (_: any, record: Category) => {
        const deleting = deletingIds.has(record.id);
        return (
          <Space size={6}>
            <Button
              size="small"
              className="action-button edit-button"
              onClick={() => promptAndEdit(record)}
              disabled={loadingList || deleting || adding}
            >
              Sửa
            </Button>
            <Button
              danger
              size="small"
              className="action-button delete-button"
              onClick={() => confirmAndDelete(record)}
              disabled={loadingList || adding}
              loading={deleting}
            >
              Xóa
            </Button>
          </Space>
        );
      },
    },
  ];

  return (
    <div className="category-manager-container">
      {/* Thanh tìm kiếm */}
      <div className="category-search-bar">
        <Input
          placeholder="Search Article Categories"
          prefix={<SearchOutlined style={{ color: "rgba(0,0,0,.45)" }} />}
          style={{ width: 400 }}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          disabled={loadingList}
        />
      </div>

      <Card className="category-manager-card" bordered={false}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Title level={4} className="category-main-title" style={{ marginBottom: 0 }}>
            <FolderOpenOutlined className="icon-main-title" /> Manage Categories
          </Title>
        </div>

        {/* Form thêm danh mục */}
        <Row gutter={16} className="category-add-section">
          <Col span={24}>
            <Text strong>Category Name:</Text>
            <Input
              placeholder="Enter category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onPressEnter={handleAddCategory}
              style={{ marginTop: 8 }}
              disabled={adding || loadingList}
            />
          </Col>
          <Col span={24} style={{ marginTop: 16 }}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="add-category-button"
              onClick={handleAddCategory}
              disabled={adding || loadingList}
              loading={adding}
            >
              Add Category
            </Button>
          </Col>
        </Row>

        {/* Danh sách */}
        <Title level={5} className="category-list-title">
          <FolderOpenOutlined className="icon-list-title" /> Category List
        </Title>
        <Table
          rowKey="id"
          columns={columns as any}
          dataSource={paged}               // dùng dữ liệu đã cắt theo trang
          size="small"
          pagination={false}
          className="category-list-table"
          loading={loadingList}
        />
      </Card>

      {/* Thanh phân trang */}
      <PaginationBar
        current={currentPage}
        total={filteredCategories.length}  // tổng trước khi cắt trang
        pageSize={pageSize}
        onChange={setCurrentPage}
      />
    </div>
  );
}

export default ManageCategories;

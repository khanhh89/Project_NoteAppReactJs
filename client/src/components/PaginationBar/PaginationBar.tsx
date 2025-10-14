import React from "react";
import { Pagination, Button } from "antd";
import { ArrowRightOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import "./PaginationBar.scss";

type Props = {
  current: number;        // trang hiện tại
  total: number;          // tổng số item
  pageSize?: number;      // số item mỗi trang
  onChange?: (page: number) => void;
};

const PaginationBar: React.FC<Props> = ({
  current = 1,
  total = 0,
  pageSize = 10,
  onChange,
}) => {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const goPrev = () => onChange?.(Math.max(1, current - 1));
  const goNext = () => onChange?.(Math.min(totalPages, current + 1));

  return (
    <div className="pager">
      <Button
        className="pager__btn"
        icon={<ArrowLeftOutlined />}
        disabled={current === 1}
        onClick={goPrev}
      >
        Previous
      </Button>

      <Pagination
        className="pager__numbers"
        current={current}
        total={total}
        pageSize={pageSize}
        onChange={onChange}
        showSizeChanger={false}
        showLessItems
        itemRender={(page, type, element) => {
          if (type === "prev" || type === "next") return null; // ẩn mũi tên mặc định
          return element;
        }}
      />

      <Button
        className="pager__btn"
        icon={<ArrowRightOutlined />}
        disabled={current === totalPages}
        onClick={goNext}
      >
        Next
      </Button>
    </div>
  );
};

export default PaginationBar;

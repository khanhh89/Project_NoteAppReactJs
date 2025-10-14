import React from "react";
import { Button } from "antd";
import { Link } from "react-router-dom";

export default function Unauthorized() {
  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h1>403 - Unauthorized</h1>
      <p>Bạn không có quyền truy cập trang này.</p>
      <div style={{ marginTop: 16 }}>
        <Link to="/"><Button type="primary">Về trang chủ</Button></Link>
        <Link to="/login"><Button style={{ marginLeft: 8 }}>Đăng nhập</Button></Link>
      </div>
    </div>
  );
}

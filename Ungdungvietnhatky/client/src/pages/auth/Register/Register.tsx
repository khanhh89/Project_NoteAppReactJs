import React from "react";
import { Form, Input, Button } from "antd";
import axios from "axios";
import "./Register.scss";
import imgbackground from "../../../assets/Register/register.png";
import gadien1 from "../../../assets/Register/Gradient1.png";
import gadien2 from "../../../assets/Register/Gradient2.png";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
export default function Register() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
 const onFinish = async (values: any) => {
  const { confirmPassword, firstName = "", lastName = "", email = "", password = "" } = values;
  const normalize = (s: string) => (s || "").trim().toLowerCase();
  try {
    // 1) Lấy danh sách users
    const res = await axios.get("http://localhost:8080/users");
    const users: Array<{ id: number; email: string }> = res.data || [];

    // 2) Check email trùng (case-insensitive)
    const existed = users.some((u) => normalize(u.email) === normalize(email));
    if (existed) {
      await Swal.fire({
        icon: "error",
        title: "Email đã tồn tại!",
        text: "Vui lòng dùng email khác.",
        confirmButtonColor: "#1677ff",
      });
      return;
    }

    // 3) Tạo user mới
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      password,                // demo json-server: lưu plain-text
      isBlocked: false,
      // username: `@${email.split("@")[0]}`,
      // name: `${firstName} ${lastName}`.trim() || email.split("@")[0],
      avatar: ""               // có thể cho phép người dùng nhập sau
    };

    await axios.post("http://localhost:8080/users", payload);

    // 4) Thông báo + điều hướng
    await Swal.fire({
      icon: "success",
      title: "Đăng ký thành công!",
      text: "Sẽ tự động chuyển hướng về trang đăng nhập.",
      confirmButtonText: "OK",
      confirmButtonColor: "#1677ff",
      timer: 1800,
      timerProgressBar: true,
    });

    navigate("/login");
  } catch (error) {
    console.log("Lỗi ", error);
    await Swal.fire({
      icon: "error",
      title: "Có lỗi xảy ra",
      text: "Không thể kết nối đến server. Vui lòng thử lại.",
      confirmButtonColor: "#1677ff",
    });
  }}

  return (
    <div className="register-page">
      <div className="bg-wrapper">
        <img
          src={imgbackground}
          alt="Login illustration"
          className="bg-image"
        />
        <img src={gadien1} alt="" className="gradient gradient--one" />
        <img src={gadien2} alt="" className="gradient gradient--two" />
      </div>

      <div className="auth">
        <div className="auth__left">
          <h1>Welcome to the website</h1>
          <p>RIKKEI EDUCATION</p>
        </div>

        <div className="auth__right">
          <div className="register-card">
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <div className="register__row">
                <Form.Item
                  name="firstName"
                  extra={
                  <span
                    style={{
                      // fontWeight: "bold",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  >
                    First name
                  </span>
                }
                  rules={[
                    { required: true, message: "Họ không được để trống" },
                  ]}
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="lastName"
                  extra={
                  <span
                    style={{
                      // fontWeight: "bold",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  >
                    Last name
                  </span>
                }
                  rules={[
                    { required: true, message: "Tên không được để trống" },
                  ]}
                >
                  <Input />
                </Form.Item>
              </div>

              <Form.Item
                name="email"
                extra={
                  <span
                    style={{
                      // fontWeight: "bold",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  >
                    Email address
                  </span>
                }
                rules={[
                  { required: true, message: "Email không được để trống" },
                  { type: "email", message: "Email phải đúng định dạng" },
                ]}
              >
                <Input />
              </Form.Item>

              <Form.Item
                name="password"
                extra={
                  <span
                    style={{
                      // fontWeight: "bold",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  >
                    Password
                  </span>
                }
                rules={[
                  { required: true, message: "Mật khẩu không được để trống" },
                  { min: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                extra={
                  <span
                    style={{
                      // fontWeight: "bold",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  >
                    Confirm Password
                  </span>
                }
                dependencies={["password"]}
                rules={[
                  {
                    required: true,
                    message: "Mật khẩu xác nhận không được để trống",
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue("password") === value)
                        return Promise.resolve();
                      return Promise.reject(
                        new Error("Mật khẩu phải trùng khớp")
                      );
                    },
                  }),
                ]}
              >
                <Input.Password />
              </Form.Item>

              <Button
                type="primary"
                htmlType="submit"
                className="register__submit"
              >
                Sign up
              </Button>
            </Form>

            <div className="register__footer">
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

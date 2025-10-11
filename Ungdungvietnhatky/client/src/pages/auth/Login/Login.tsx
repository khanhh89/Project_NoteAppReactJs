import React from "react";
import { Form, Input, Button, message } from "antd";
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaGoogle } from "react-icons/fa";
import imgLeft from "../../../assets/Login/Login.png";
import Swal from "sweetalert2";
import "./Login.scss";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const onFinish = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      // Fetch user data from json-server
      const res = await axios.get("http://localhost:8080/users");

      // User data type definition
      interface User {
        id: number;
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        role?: "admin" | "user"; // Added role property
      }

      const users: Array<User> = res.data || [];

      const normalize = (s: string) => (s || "").trim().toLowerCase();
      const user = users.find((u) => normalize(u.email) === normalize(email));

      // 1. Check if user exists
      if (!user) {
        await Swal.fire({
          icon: "error",
          title: "Email does not exist", // Translated from "Email không tồn tại"
          text: "Please check your email address.", // Translated from "Vui lòng kiểm tra lại địa chỉ email."
          confirmButtonColor: "#1677ff",
        });
        return;
      }

      const inputPw = String(password ?? "");
      const dbPw = String(user.password ?? "");

      // 2. Check password
      if (dbPw !== inputPw) {
        await Swal.fire({
          icon: "error",
          title: "Incorrect password", // Translated from "Sai mật khẩu"
          text: "The password you entered is incorrect, please try again.", // Translated from "Mật khẩu không chính xác, vui lòng thử lại."
          confirmButtonColor: "#1677ff",
        });
        return;
      }

      // --- ROLE HANDLING AND REDIRECTION LOGIC ---

      // 3. Save user info to localStorage (excluding password)
      const userDataToStore = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role || "user", // Default to 'user' if role is missing
      };

      localStorage.setItem("currentUser", JSON.stringify(userDataToStore));

      const userRole = userDataToStore.role;

      // 4. Display success notification
      await Swal.fire({
        icon: "success",
        title: "Login successful!", // Translated from "Đăng nhập thành công!"
        showConfirmButton: false,
        timer: 1200,
        timerProgressBar: true,
      });

      // 5. Redirect based on role
      if (userRole === "admin") {
        navigate("/admin");
      } else {
        navigate("/"); // Redirect to homepage for other roles (including regular users)
      }
    } catch (err) {
      console.error("❌ Server Error:", err); // Translated "Lỗi server"
      await Swal.fire({
        icon: "error",
        title: "Could not connect to the server", // Translated from "Không thể kết nối server"
        text: "Please check the json-server or API path.", // Translated from "Vui lòng kiểm tra json-server hoặc đường dẫn API."
        confirmButtonColor: "#1677ff",
      });
    }
  };

  const onFinishFailed = () => {
    // Translated from "Vui lòng kiểm tra lại thông tin đăng nhập."
    message.warning("Please check your login details.");
  };

  return (
    <div>
      <div className="login">
        <div className="login__left">
          <Link to="/">
            <img src={imgLeft} alt="Login illustration" />
          </Link>
        </div>

        <div className="login__right">
          <div className="login__card">
            <div className="flex">
              <div className="login__title">Sign in with</div>

              <div className="login__social">
                <Button className="login__social-btn">
                  <FaFacebookF />
                </Button>
                <Button className="login__social-btn">
                  <FaTwitter />
                </Button>
                <Button className="login__social-btn">
                  <FaLinkedinIn />
                </Button>
              </div>
            </div>
            <div className="login__or">Or</div>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              autoComplete="off"
            >
              <Form.Item
                name="email"
                rules={[
                  { required: true, message: "Email is required" }, // Translated from "Email không được để trống"
                  { type: "email", message: "Email must be a valid format" }, // Translated from "Email phải đúng định dạng"
                ]}
                className="login__form-item"
                extra={
                  <span
                    style={{
                      // fontWeight: "bold",
                      color: "#000",
                      fontSize: "14px",
                    }}
                  >
                    Email Address
                  </span>
                }
              >
                <Input placeholder="Enter a valid email address" />
              </Form.Item>

              <Form.Item
                name="password"
                rules={[
                  { required: true, message: "Password is required" }, // Translated from "Mật khẩu không được để trống"
                ]}
                className="login__form-item"
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
              >
                <Input.Password placeholder="Enter password" />
              </Form.Item>

              <Button
                htmlType="submit"
                type="primary"
                className="login__submit"
              >
                Login
              </Button>
            </Form>

            <div className="login__footer">
              Don’t have an account? <Link to="/register">Sign up</Link>
            </div>
          </div>
        </div>
      </div>

      <div className="footer">
        <span>Copyright © 2025. All rights reserved.</span>
        <div>
          <Button className="login__social-btn">
            <FaFacebookF />
          </Button>
          <Button className="login__social-btn">
            <FaTwitter />
          </Button>
          <Button className="login__social-btn">
            <FaLinkedinIn />
          </Button>
          <Button className="login__social-btn">
            <FaGoogle />
          </Button>
        </div>
      </div>
    </div>
  );
}
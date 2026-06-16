import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://myshop-cms.onrender.com";

const AuthModal = ({ closeAuth, onLoginSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: "", email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? "/api/auth/local" : "/api/auth/local/register";
      const payload = isLogin
        ? { identifier: formData.email, password: formData.password }
        : { username: formData.username, email: formData.email, password: formData.password };

      const res = await axios.post(`${API_URL}${endpoint}`, payload);
      
      // Зберігаємо JWT токен і дані юзера
      localStorage.setItem("jwt", res.data.jwt);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      toast.success(isLogin ? "Успішний вхід!" : "Реєстрація успішна!");
      onLoginSuccess(res.data.user);
      closeAuth();
    } catch (error) {
      console.error(error);
      toast.error("Помилка! Перевірте дані.");
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuth}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "400px" }}>
        <div className="cart-header">
          <h2>{isLogin ? "Вхід" : "Реєстрація"}</h2>
          <span className="close-btn" onClick={closeAuth}>×</span>
        </div>
        <div className="cart-body" style={{ padding: "20px" }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            {!isLogin && (
              <input
                type="text" name="username" placeholder="Ім'я користувача" required
                value={formData.username} onChange={handleChange} className="modal-input"
              />
            )}
            <input
              type="email" name="email" placeholder="Email" required
              value={formData.email} onChange={handleChange} className="modal-input"
            />
            <input
              type="password" name="password" placeholder="Пароль" required
              value={formData.password} onChange={handleChange} className="modal-input"
            />
            <button type="submit" className="checkout-btn">
              {isLogin ? "УВІЙТИ" : "ЗАРЕЄСТРУВАТИСЯ"}
            </button>
          </form>
          <p 
            style={{ textAlign: "center", marginTop: "15px", cursor: "pointer", color: "#007bff" }} 
            onClick={() => setIsLogin(!isLogin)}
          >
            {isLogin ? "Немає акаунту? Створити" : "Вже є акаунт? Увійти"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

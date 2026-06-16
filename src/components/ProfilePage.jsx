import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { IMaskInput } from "react-imask";

const API_URL = "https://myshop-cms.onrender.com";

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(user?.phone || "");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Стейт для історії замовлень
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Підтягуємо замовлення при монтуванні або зміні номера
  useEffect(() => {
    if (user?.phone) {
      fetchOrders(user.phone);
    }
  }, [user]);

  const fetchOrders = async (userPhone) => {
    setLoadingOrders(true);
    try {
      // Робимо запит до Strapi з фільтрацією по телефону і сортуванням від нових до старих
      const res = await axios.get(
        `${API_URL}/api/orders?filters[clientPhone][$eq]=${encodeURIComponent(userPhone)}&sort=createdAt:desc`
      );
      setOrders(res.data.data || []);
    } catch (error) {
      console.error("Помилка завантаження замовлень:", error);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdatePhone = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const updatedUser = { ...user, phone: res.data.phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Номер успішно оновлено!");
      fetchOrders(res.data.phone); // Одразу підтягуємо замовлення для нового номера
    } catch (error) {
      console.error(error);
      toast.error("Помилка оновлення даних.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwt");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/");
  };

  if (!user) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Ви не авторизовані</h2>
        <p>Будь ласка, увійдіть у систему, щоб переглянути профіль.</p>
      </div>
    );
  }

  return (
    <div className="container product-page" style={{ minHeight: "50vh", marginTop: "40px", display: "flex", gap: "40px", flexWrap: "wrap" }}>
      
      {/* ЛІВА КОЛОНКА: ДАНІ ПРОФІЛЮ */}
      <div style={{ flex: "1 1 400px" }}>
        <h1>Особистий кабінет</h1>
        <div className="specs-table-container" style={{ marginTop: "20px" }}>
          <table className="specs-table">
            <tbody>
              <tr>
                <td className="spec-key">Ім'я</td>
                <td className="spec-value">{user.username}</td>
              </tr>
              <tr>
                <td className="spec-key">Email</td>
                <td className="spec-value">{user.email}</td>
              </tr>
              <tr>
                <td className="spec-key" style={{ verticalAlign: "middle" }}>Телефон</td>
                <td className="spec-value">
                  <div style={{ display: "flex", gap: "10px" }}>
                    <IMaskInput
                      mask="+{38} (000) 000-00-00"
                      radix="."
                      value={phone}
                      unmask={false}
                      onAccept={(value) => setPhone(value)}
                      placeholder="Додати номер"
                      className="modal-input"
                      style={{ margin: 0, flex: 1 }}
                    />
                    <button 
                      onClick={handleUpdatePhone} 
                      disabled={isUpdating || phone === user.phone}
                      className="buy-btn-large"
                      style={{ 
                        margin: 0, 
                        padding: "0 20px", 
                        width: "auto", 
                        whiteSpace: "nowrap",
                        opacity: (isUpdating || phone === user.phone) ? 0.6 : 1 
                      }}
                    >
                      Зберегти
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
          
          <button 
            onClick={handleLogout} 
            className="buy-btn-large" 
            style={{ marginTop: "30px", backgroundColor: "#dc3545" }}
          >
            Вийти з акаунту
          </button>
        </div>
      </div>

      {/* ПРАВА КОЛОНКА: ІСТОРІЯ ЗАМОВЛЕНЬ */}
      <div style={{ flex: "2 1 500px" }}>
        <h2>Історія замовлень</h2>
        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "15px" }}>
          
          {loadingOrders ? (
            <p>Завантаження бази...</p>
          ) : orders.length === 0 ? (
            <div style={{ background: "#f9f9f9", padding: "40px", borderRadius: "12px", textAlign: "center", color: "#666" }}>
              <i className="fas fa-box-open" style={{ fontSize: "50px", marginBottom: "15px", color: "#ccc" }}></i>
              <p style={{ fontSize: "18px" }}>У вас ще немає замовлень.</p>
            </div>
          ) : (
            orders.map((order) => {
              const attrs = order.attributes || order;
              const date = new Date(attrs.createdAt).toLocaleDateString('uk-UA', {
                day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
              });

              return (
                <div key={order.id} style={{ background: "#fff", border: "1px solid #eee", borderRadius: "12px", padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.03)" }}>
                  
                  <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #eee", paddingBottom: "12px", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "bold", fontSize: "16px", color: "#333" }}>Замовлення #{order.id}</span>
                    <span style={{ color: "#888", fontSize: "14px" }}>{date}</span>
                  </div>
                  
                  <div style={{ marginBottom: "15px", fontSize: "14px", lineHeight: "1.6" }}>
                    <div style={{ marginBottom: "8px" }}>
                      <i className="fas fa-map-marker-alt" style={{ color: "#dc3545", width: "20px" }}></i> 
                      <b>Доставка:</b> {attrs.deliveryAddress || "Не вказано"}
                    </div>
                    <div>
                      <i className="fas fa-box" style={{ color: "#007bff", width: "20px" }}></i> 
                      <b>Товари:</b> {attrs.orderDetails}
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "15px", paddingTop: "15px", borderTop: "1px dashed #ddd" }}>
                    <span style={{ padding: "6px 14px", background: "#e8f5e9", color: "#2e7d32", borderRadius: "20px", fontSize: "12px", fontWeight: "bold" }}>
                      <i className="fas fa-check-circle" style={{ marginRight: "5px" }}></i> Оформлено
                    </span>
                    <span style={{ fontWeight: "900", fontSize: "20px" }}>{attrs.total} ₴</span>
                  </div>

                </div>
              );
            })
          )}
          
        </div>
      </div>

    </div>
  );
};

export default ProfilePage;

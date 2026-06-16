import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { IMaskInput } from "react-imask";

const API_URL = "https://myshop-cms.onrender.com";

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [phone, setPhone] = useState(user?.phone || "");
  const [isUpdating, setIsUpdating] = useState(false);

  if (!user) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Ви не авторизовані</h2>
        <p>Будь ласка, увійдіть у систему, щоб переглянути профіль.</p>
      </div>
    );
  }

  const handleUpdatePhone = async () => {
    setIsUpdating(true);
    try {
      const token = localStorage.getItem("jwt");
      const res = await axios.put(
        `${API_URL}/api/users/${user.id}`,
        { phone },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Оновлюємо стейт та локалсторадж
      const updatedUser = { ...user, phone: res.data.phone };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      toast.success("Номер успішно оновлено!");
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

  return (
    <div className="container product-page" style={{ minHeight: "50vh", marginTop: "40px" }}>
      <h1>Особистий кабінет</h1>
      <div className="specs-table-container" style={{ marginTop: "20px", maxWidth: "600px" }}>
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
                    className="buy-btn"
                    style={{ padding: "0 15px", borderRadius: "8px" }}
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
  );
};

export default ProfilePage;

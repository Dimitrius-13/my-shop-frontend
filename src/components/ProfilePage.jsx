import React from "react";
import { useNavigate } from "react-router-dom";

const ProfilePage = ({ user, setUser }) => {
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="container" style={{ padding: "40px", textAlign: "center" }}>
        <h2>Ви не авторизовані</h2>
        <p>Будь ласка, увійдіть у систему, щоб переглянути профіль.</p>
      </div>
    );
  }

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
              <td className="spec-key">Ім'я (Username)</td>
              <td className="spec-value">{user.username}</td>
            </tr>
            <tr>
              <td className="spec-key">Email</td>
              <td className="spec-value">{user.email}</td>
            </tr>
            <tr>
              <td className="spec-key">Статус</td>
              <td className="spec-value">{user.confirmed ? "Підтверджений ✅" : "Очікує підтвердження"}</td>
            </tr>
          </tbody>
        </table>
        
        <button 
          onClick={handleLogout} 
          className="buy-btn-large" 
          style={{ marginTop: "20px", backgroundColor: "#dc3545" }}
        >
          Вийти з акаунту
        </button>
      </div>
    </div>
  );
};

export default ProfilePage;

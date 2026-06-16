import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://myshop-cms.onrender.com";

// База даних міст для автокомплиту (можна розширювати)
const UKRAINIAN_CITIES = [
  "Вінниця", "Київ", "Львів", "Одеса", "Харків", "Дніпро", 
  "Запоріжжя", "Миколаїв", "Полтава", "Чернігів", "Чернівці", 
  "Житомир", "Суми", "Рівне", "Івано-Франківськ", "Тернопіль", "Луцьк"
];

const CheckoutPage = ({ cart, setCart, user }) => {
  const navigate = useNavigate();
  
  const [name, setName] = useState(user ? user.username : "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Логіка доставки
  const [cityInput, setCityInput] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState("");
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [warehouse, setWarehouse] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const cityRef = useRef(null);
  const total = cart.reduce((sum, item) => sum + item.price, 0);

  // Слідкуємо за кліками поза дропдауном міст
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cityRef.current && !cityRef.current.contains(e.target)) {
        setShowCityDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Фільтрація міст по введенню
  const handleCityChange = (e) => {
    const val = e.target.value;
    setCityInput(val);
    setSelectedCity(""); // Скидаємо вибір, якщо почали писати заново
    setWarehouse("");

    if (val.trim().length >= 2) {
      const filtered = UKRAINIAN_CITIES.filter(c => 
        c.toLowerCase().includes(val.toLowerCase())
      );
      setFilteredCities(filtered);
      setShowCityDropdown(true);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  };

  const selectCity = (city) => {
    setCityInput(city);
    setSelectedCity(city);
    setShowCityDropdown(false);
  };

  // Генеруємо фейкові відділення під обране місто
  const getWarehouses = () => {
    if (!selectedCity) return [];
    return [
      `Відділення №1: вул. Головна, 10`,
      `Відділення №2: проспект Центральний, 45`,
      `Відділення №3: вул. Залізнична, 12 (до 30 кг)`,
      `Відділення №4: вул. Наукова, 8`,
    ];
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderDetails = cart.map((i) => `${i.name}`).join(", ");
      const fullAddress = `Нова Пошта, м. ${selectedCity}, ${warehouse}`;

      await axios.post(`${API_URL}/api/orders`, {
        data: { 
          clientName: name, 
          clientPhone: phone, 
          total, 
          orderDetails,
          // Якщо на беку розшириш схему Order полями місто/адреса, воно залетить туди.
          // Поки що пакуємо в дефолтне поле для сумісності:
          deliveryAddress: fullAddress 
        },
      });

      toast.success("🚀 Замовлення успішно оформлено!");
      setCart([]);
      navigate("/");
    } catch (err) {
      console.error(err);
      toast.error("Збій при відправці замовлення.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: "80px 20px", textAlign: "center" }}>
        <h2>Ваш кошик порожній 😕</h2>
        <button className="buy-btn-large" style={{ marginTop: "20px", width: "auto" }} onClick={() => navigate("/")}>
          Повернутись до магазину
        </button>
      </div>
    );
  }

  const isFormValid = name.trim() !== "" && phone.length === 19 && selectedCity && warehouse;

  return (
    <div className="container product-page" style={{ marginTop: "30px" }}>
      <h1>Оформлення замовлення</h1>
      
      {/* Використовуємо існуючий клас product-layout для розділення 60/40 */}
      <div className="product-layout" style={{ marginTop: "20px", gap: "40px" }}>
        
        {/* ЛІВА ЧАСТИНА: ФОРМА ДОСТАВКИ */}
        <div className="product-info-full" style={{ background: "#fff", padding: "25px", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <form onSubmit={handleOrderSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            
            <h3>1. Контактні дані</h3>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>ПІБ Отримувача</label>
              <input
                type="text" required placeholder="Прізвище Ім'я По батькові"
                value={name} onChange={(e) => setName(e.target.value)}
                className="modal-input" style={{ margin: 0 }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Номер телефону</label>
              <IMaskInput
                mask="+{38} (000) 000-00-00"
                radix="."
                value={phone}
                unmask={false}
                onAccept={(value) => setPhone(value)}
                placeholder="+38 (0__) ___-__-__"
                className="modal-input" required style={{ margin: 0 }}
              />
            </div>

            <h3 style={{ marginTop: "15px" }}>2. Доставка (Нова Пошта)</h3>
            
            {/* АВТОКОМПЛИТ МІСТА */}
            <div style={{ position: "relative" }} ref={cityRef}>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Введіть місто</label>
              <input
                type="text" required placeholder="Почніть вводити назву (напр. Вінниця)"
                value={cityInput} onChange={handleCityChange}
                className="modal-input" style={{ margin: 0 }}
                onFocus={() => cityInput.trim().length >= 2 && setShowCityDropdown(true)}
              />
              {showCityDropdown && filteredCities.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "#fff", border: "1px solid #ccc", borderRadius: "8px",
                  zIndex: 10, maxHeight: "150px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}>
                  {filteredCities.map((city) => (
                    <div 
                      key={city} onClick={() => selectCity(city)}
                      style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee" }}
                      onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                      onMouseLeave={(e) => e.target.style.background = "none"}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ВИБІР ВІДДІЛЕННЯ */}
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Оберіть відділення</label>
              <select
                disabled={!selectedCity} required
                value={warehouse} onChange={(e) => setWarehouse(e.target.value)}
                className="modal-input" style={{ margin: 0, cursor: selectedCity ? "pointer" : "not-allowed" }}
              >
                <option value="">{selectedCity ? "-- Оберіть відділення з переліку --" : "Спочатку оберіть місто"}</option>
                {getWarehouses().map((w) => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            <button 
              type="submit" className="buy-btn-large" 
              disabled={!isFormValid || isSubmitting}
              style={{ marginTop: "20px", background: isFormValid ? "#28a745" : "#ccc" }}
            >
              {isSubmitting ? "ОБРОБКА..." : "ПІДТВЕРДИТИ ЗАМОВЛЕННЯ"}
            </button>
          </form>
        </div>

        {/* СПРАВА: СУМА ТА СПИСОК ТОВАРІВ */}
        <div className="specs-table-container" style={{ background: "#f9f9f9", padding: "25px", borderRadius: "12px", height: "fit-content" }}>
          <h3>Ваше замовлення</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px" }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <img src={item.image || "https://placehold.co/50"} width="50" alt="" style={{ borderRadius: "6px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>{item.name}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>Категорія: {item.category}</div>
                </div>
                <b style={{ fontSize: "15px" }}>{item.price} ₴</b>
              </div>
            ))}
          </div>
          
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "20px", paddingTop: "15px", borderTop: "2px solid #ddd" }}>
            <span style={{ fontSize: "18px", fontWeight: "bold" }}>Разом до сплати:</span>
            <span style={{ fontSize: "22px", fontWeight: "bold", color: "#000" }}>{total} ₴</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CheckoutPage;

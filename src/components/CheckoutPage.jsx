import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IMaskInput } from "react-imask";
import axios from "axios";
import { toast } from "react-toastify";

const API_URL = "https://myshop-cms.onrender.com";

// ВСТАВ СВІЙ КЛЮЧ З КАБІНЕТУ НП ОСЬ ТУТ:
const NP_API_KEY = "65317b2f4ccbe2131f035c5d00030538";
const NP_API_URL = "https://api.novaposhta.ua/v2.0/json/";

const CheckoutPage = ({ cart, setCart, user }) => {
  const navigate = useNavigate();
  
  const [name, setName] = useState(user ? user.username : "");
  const [phone, setPhone] = useState(user?.phone || "");
  
  // Логіка Нової Пошти
  const [cityInput, setCityInput] = useState("");
  const [filteredCities, setFilteredCities] = useState([]);
  const [selectedCity, setSelectedCity] = useState(null); // Тепер тут об'єкт { Description, Ref }
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [isSearchingCity, setIsSearchingCity] = useState(false);
  
  const [warehouses, setWarehouses] = useState([]);
  const [warehouse, setWarehouse] = useState("");
  const [isLoadingWarehouses, setIsLoadingWarehouses] = useState(false);
  
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

  // Розумний пошук міст із затримкою (Debounce)
  useEffect(() => {
    if (cityInput.trim().length >= 2 && !selectedCity) {
      const delayDebounceFn = setTimeout(async () => {
        setIsSearchingCity(true);
        try {
          const res = await axios.post(NP_API_URL, {
            apiKey: NP_API_KEY,
            modelName: "Address",
            calledMethod: "getCities",
            methodProperties: {
              FindByString: cityInput,
              Limit: "20"
            }
          });
          if (res.data.success) {
            setFilteredCities(res.data.data);
            setShowCityDropdown(true);
          }
        } catch (e) {
          console.error("Помилка НП (Міста):", e);
        } finally {
          setIsSearchingCity(false);
        }
      }, 400); // 400мс затримки, щоб не спамити запитами

      return () => clearTimeout(delayDebounceFn);
    } else {
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
  }, [cityInput, selectedCity]);

  // Обробник ручного вводу (якщо юзер передумав і стирає місто)
  const handleCityChange = (e) => {
    setCityInput(e.target.value);
    setSelectedCity(null);
    setWarehouse("");
    setWarehouses([]);
  };

  // Вибір міста і завантаження відділень
  const handleCitySelect = async (cityObj) => {
    setCityInput(cityObj.Description);
    setSelectedCity(cityObj);
    setShowCityDropdown(false);
    setWarehouse("");
    
    setIsLoadingWarehouses(true);
    try {
      const res = await axios.post(NP_API_URL, {
        apiKey: NP_API_KEY,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityObj.Ref,
          Limit: "200" // Ліміт, щоб не тягнути тисячі відділень в міліонниках
        }
      });
      if (res.data.success) {
        setWarehouses(res.data.data);
      }
    } catch (e) {
      console.error("Помилка НП (Відділення):", e);
    } finally {
      setIsLoadingWarehouses(false);
    }
  };

  const handleOrderSubmit = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setIsSubmitting(true);

    try {
      const orderDetails = cart.map((i) => `${i.name}`).join(", ");
      const fullAddress = `Нова Пошта, м. ${selectedCity.Description}, ${warehouse}`;

      await axios.post(`${API_URL}/api/orders`, {
        data: { 
          clientName: name, 
          clientPhone: phone, 
          total, 
          orderDetails,
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
      
      <div className="product-layout" style={{ marginTop: "20px", gap: "40px" }}>
        
        {/* ЛІВА ЧАСТИНА: ФОРМА */}
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
                type="text" required placeholder="Почніть вводити назву (напр. Київ)"
                value={cityInput} onChange={handleCityChange}
                className="modal-input" style={{ margin: 0 }}
                onFocus={() => cityInput.trim().length >= 2 && setShowCityDropdown(true)}
              />
              {isSearchingCity && <span style={{ position: "absolute", right: "15px", top: "35px", fontSize: "12px", color: "#666" }}>Шукаю...</span>}
              
              {showCityDropdown && filteredCities.length > 0 && (
                <div style={{
                  position: "absolute", top: "100%", left: 0, right: 0,
                  background: "#fff", border: "1px solid #ccc", borderRadius: "8px",
                  zIndex: 10, maxHeight: "200px", overflowY: "auto", boxShadow: "0 4px 8px rgba(0,0,0,0.1)"
                }}>
                  {filteredCities.map((city) => (
                    <div 
                      key={city.Ref} onClick={() => handleCitySelect(city)}
                      style={{ padding: "10px", cursor: "pointer", borderBottom: "1px solid #eee", fontSize: "14px" }}
                      onMouseEnter={(e) => e.target.style.background = "#f5f5f5"}
                      onMouseLeave={(e) => e.target.style.background = "none"}
                    >
                      {city.Description} <span style={{ color: "#999", fontSize: "12px" }}>({city.AreaDescription} обл.)</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ВИБІР ВІДДІЛЕННЯ */}
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Оберіть відділення або поштомат</label>
              <select
                disabled={!selectedCity || isLoadingWarehouses} required
                value={warehouse} onChange={(e) => setWarehouse(e.target.value)}
                className="modal-input" style={{ margin: 0, cursor: selectedCity ? "pointer" : "not-allowed" }}
              >
                <option value="">
                  {isLoadingWarehouses ? "Завантаження відділень..." : selectedCity ? "-- Оберіть точку видачі --" : "Спочатку оберіть місто"}
                </option>
                {warehouses.map((w) => (
                  <option key={w.Ref} value={w.Description}>{w.Description}</option>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "15px", maxHeight: "400px", overflowY: "auto" }}>
            {cart.map((item, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", justifyBetween: "space-between", gap: "15px", borderBottom: "1px solid #eee", paddingBottom: "10px" }}>
                <img src={item.image || "https://placehold.co/50"} width="50" alt="" style={{ borderRadius: "6px" }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: "500" }}>{item.name}</div>
                  <div style={{ fontSize: "13px", color: "#666" }}>Категорія: {item.category}</div>
                </div>
                <b style={{ fontSize: "15px", whiteSpace: "nowrap" }}>{item.price} ₴</b>
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

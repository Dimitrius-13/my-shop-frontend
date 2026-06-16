import React from "react";
import { useNavigate } from "react-router-dom";

const CartModal = ({ cart, closeCart, removeItem }) => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const navigate = useNavigate();

  const handleProceedToCheckout = () => {
    closeCart();
    navigate("/checkout");
  };

  return (
    <div className="modal-overlay" onClick={closeCart}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Кошик</h2>
          <span className="close-btn" onClick={closeCart}>×</span>
        </div>
        <div className="cart-body">
          {cart.map((i, idx) => (
            <div key={idx} className="cart-item-row">
              <img src={i.image || "https://placehold.co/40"} width="40" alt="" />
              <div style={{ flex: 1, marginLeft: "10px" }}>
                <div style={{ fontSize: "14px" }}>{i.name}</div>
                <b style={{ fontSize: "14px" }}>{i.price} ₴</b>
              </div>
              <span className="del" onClick={() => removeItem(idx)}>🗑️</span>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="empty-state">😕 Кошик порожній</div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row" style={{ marginBottom: "15px" }}>
              Разом: {total} ₴
            </div>
            <button className="checkout-btn" onClick={handleProceedToCheckout}>
              ПЕРЕЙТИ ДО ОФОРМЛЕННЯ
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;

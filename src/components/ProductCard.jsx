import React from "react";
import { Link } from "react-router-dom";

const ProductCard = ({ product, addToCart }) => {
  return (
    <div className="product-card">
      <div className="card-top">
        {product.isPromo && <span className="status-badge sale">SALE</span>}
      </div>
      <Link
        to={`/product/${product.documentId}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <div className="img-container">
          <img
            src={product.image || "https://placehold.co/300?text=No+Img"}
            alt={product.name}
            onError={(e) => {
              e.target.src = "https://placehold.co/300";
            }}
          />
        </div>
        <div className="card-info">
          <div className="rating">
            <i className="fas fa-star filled" style={{ color: "#ffbf00" }}></i>{" "}
            {product.rating}
          </div>
          <h3 title={product.name}>{product.name}</h3>
          <div className="price-block">
            <div className="prices">
              {product.oldPrice > 0 && (
                <span className="old-price">{product.oldPrice} ₴</span>
              )}
              <span className={`current-price ${product.oldPrice ? "red" : ""}`}>
                {product.price} ₴
              </span>
            </div>
          </div>
        </div>
      </Link>
      <button
        className="buy-btn"
        onClick={(e) => {
          e.preventDefault();
          addToCart(product);
        }}
      >
        <i className="fas fa-shopping-cart"></i>
      </button>
    </div>
  );
};

export default ProductCard;

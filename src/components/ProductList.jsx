import React from "react";
import ProductCard from "./ProductCard";

const SkeletonLoader = () => (
  <div className="products-grid">
    {Array(8)
      .fill(0)
      .map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton skeleton-img"></div>
          <div className="skeleton skeleton-title"></div>
          <div className="skeleton skeleton-price"></div>
          <div className="skeleton skeleton-btn"></div>
        </div>
      ))}
  </div>
);

const ProductList = ({ products, loading, addToCart, setSelectedBrand, setSortOption }) => {
  if (loading) return <SkeletonLoader />;

  if (products.length === 0) {
    return (
      <div className="no-products">
        <p>Нічого не знайдено 🕵️‍♂️</p>
        <button
          onClick={() => {
            setSelectedBrand("all");
            setSortOption("default");
          }}
          className="buy-btn-large"
          style={{ marginTop: "20px" }}
        >
          Скинути фільтри
        </button>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} addToCart={addToCart} />
      ))}
    </div>
  );
};

export default ProductList;

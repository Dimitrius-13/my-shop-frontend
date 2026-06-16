import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useParams,
  useNavigate,
} from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";

import ProductList from "./components/ProductList";
import AuthModal from "./components/AuthModal";
import ProfilePage from "./components/ProfilePage";
import CartModal from "./components/CartModal";
import CheckoutPage from "./components/CheckoutPage";

const API_URL = "https://myshop-cms.onrender.com";

const CATEGORIES = [
  { id: "all", name: "Всі товари", icon: "fa-layer-group" },
  { id: "smartphones", name: "Смартфони", icon: "fa-mobile-alt" },
  { id: "laptops", name: "Ноутбуки", icon: "fa-laptop" },
  { id: "gaming", name: "Геймінг", icon: "fa-gamepad" },
  { id: "tv", name: "Телевізори", icon: "fa-tv" },
  { id: "audio", name: "Аудіо", icon: "fa-headphones" },
];

const HEADER_CATEGORIES = [
  { id: "smartphones", name: "Смартфони" },
  { id: "laptops", name: "Ноутбуки" },
  { id: "gaming", name: "Геймінг" },
];

const renderDescription = (desc) => {
  if (!desc) return "Опис відсутній";
  if (typeof desc === "string") return desc;
  if (Array.isArray(desc)) {
    return desc.map((block, index) => {
      const text = block.children?.map((child) => child.text).join("") || "";
      return (
        <p key={index} style={{ marginBottom: "5px", fontSize: "14px" }}>
          {text}
        </p>
      );
    });
  }
  return "";
};

const Header = ({ cartCount, openCart, products, onLogoClick, onSearch, user, openAuth }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      const results = products.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm, products]);

  const handleGlobalSearch = () => {
    onSearch(searchTerm);
    setSearchResults([]);
    navigate("/");
  };

  const getPreviewProducts = (catId) =>
    products.filter((p) => p.category === catId).slice(0, 3);

  return (
    <header className="header">
      <div className="container header-content">
        <Link
          to="/"
          className="logo"
          onClick={() => {
            onLogoClick();
            setSearchTerm("");
          }}
        >
          <i className="fas fa-bolt"></i> MEGA<span>STORE</span>
        </Link>

        <nav className="desktop-nav">
          {HEADER_CATEGORIES.map((cat) => (
            <div
              key={cat.id}
              className="nav-item-wrapper"
              onMouseEnter={() => setHoveredCategory(cat.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <Link
                to="/"
                className="nav-link"
                onClick={() => onLogoClick(cat.id)}
              >
                {cat.name}{" "}
                <i
                  className="fas fa-chevron-down"
                  style={{ fontSize: "10px", marginLeft: "5px" }}
                ></i>
              </Link>
              {hoveredCategory === cat.id && (
                <div className="hover-preview-dropdown">
                  <h4>Популярне в {cat.name}</h4>
                  <div className="preview-grid">
                    {getPreviewProducts(cat.id).length > 0 ? (
                      getPreviewProducts(cat.id).map((prod) => (
                        <Link
                          to={`/product/${prod.documentId}`}
                          key={prod.id}
                          className="preview-card"
                          onClick={() => setHoveredCategory(null)}
                        >
                          <img
                            src={prod.image || "https://placehold.co/100"}
                            alt={prod.name}
                          />
                          <div className="preview-info">
                            <p className="p-name">{prod.name}</p>
                            <p className="p-price">{prod.price} ₴</p>
                          </div>
                        </Link>
                      ))
                    ) : (
                      <p className="no-items">Пусто...</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className="search-bar-wrapper">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Я шукаю..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGlobalSearch()}
            />
            <button onClick={handleGlobalSearch}>
              <i className="fas fa-search"></i>
            </button>
          </div>
          {searchResults.length > 0 && (
            <div className="search-dropdown-results">
              {searchResults.map((prod) => (
                <Link
                  to={`/product/${prod.documentId}`}
                  key={prod.id}
                  className="search-result-item"
                  onClick={() => {
                    setSearchTerm("");
                    setSearchResults([]);
                  }}
                >
                  <img src={prod.image || "https://placehold.co/50"} alt="" />
                  <div className="search-info">
                    <span className="search-name">{prod.name}</span>
                    <span className="search-price">{prod.price} ₴</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="header-actions">
          {/* АВТОРИЗАЦІЯ / ПРОФІЛЬ */}
          <div className="action-btn" onClick={() => user ? navigate('/profile') : openAuth()}>
            <div className="icon-wrapper">
              <i className="fas fa-user"></i>
            </div>
            <span className="btn-text">{user ? user.username : "Увійти"}</span>
          </div>

          <div className="action-btn" onClick={openCart}>
            <div className="icon-wrapper">
              <i className="fas fa-shopping-cart"></i>
              {cartCount > 0 && (
                <span className="badge-count">{cartCount}</span>
              )}
            </div>
            <span className="btn-text">Кошик</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const SubHeader = ({ onSelectCategory }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const handleCategoryClick = (id) => {
    onSelectCategory(id);
    setIsMenuOpen(false);
    navigate("/");
  };
  return (
    <div className="sub-header">
      <div className="container sub-header-content">
        <div className="catalog-wrapper">
          <button
            className="catalog-btn"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <i className={`fas ${isMenuOpen ? "fa-times" : "fa-bars"}`}></i>{" "}
            Каталог товарів
          </button>
          {isMenuOpen && (
            <div className="catalog-dropdown">
              {CATEGORIES.map((cat) => (
                <div
                  key={cat.id}
                  className="catalog-item"
                  onClick={() => handleCategoryClick(cat.id)}
                >
                  <i className={`fas ${cat.icon}`}></i> {cat.name}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="promo-text">
          <i className="fas fa-truck"></i> Безкоштовна доставка від 2000 ₴
        </div>
      </div>
    </div>
  );
};

const HomePage = ({
  products,
  addToCart,
  loading,
  categoryTitle,
  sortOption,
  setSortOption,
  selectedBrand,
  setSelectedBrand,
  availableBrands,
}) => {
  const getSortedProducts = () => {
    const sorted = [...products];
    if (sortOption === "price_asc") return sorted.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc") return sorted.sort((a, b) => b.price - a.price);
    if (sortOption === "rating") return sorted.sort((a, b) => b.rating - a.rating);
    return sorted;
  };

  const displayProducts = getSortedProducts();

  return (
    <div className="container main-layout-full">
      <div className="hero-banner">
        <div className="banner-text">
          <h1>Великий розпродаж!</h1>
          <p>Знижки до -50%</p>
        </div>
        <div className="banner-decor"></div>
      </div>

      <div className="section-header-row">
        <h2 className="section-title">{categoryTitle}</h2>

        <div className="filters-row">
          <div className="filter-wrapper">
            <label>Бренд:</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
            >
              <option value="all">Всі бренди</option>
              {availableBrands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          <div className="sort-wrapper">
            <label>Сортування:</label>
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="default">За замовчуванням</option>
              <option value="price_asc">Дешевші</option>
              <option value="price_desc">Дорожчі</option>
              <option value="rating">Рейтингові</option>
            </select>
          </div>
        </div>
      </div>

      <ProductList
        products={displayProducts}
        loading={loading}
        addToCart={addToCart}
        setSelectedBrand={setSelectedBrand}
        setSortOption={setSortOption}
      />
    </div>
  );
};

const Breadcrumbs = ({ categoryName, productName }) => (
  <div className="breadcrumbs">
    <Link to="/">Головна</Link> <span className="separator">/</span>
    {categoryName && (
      <>
        <span className="crumb-category">{categoryName}</span>
        <span className="separator">/</span>
      </>
    )}
    <span className="crumb-product">{productName}</span>
  </div>
);

const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1); // Додали локальний стейт кількості

  useEffect(() => {
    axios.get(`${API_URL}/api/products/${id}?populate=*`).then((res) => {
      const d = res.data.data;
      const a = d.attributes || d;
      let img = null;
      let rawUrl = a.image?.url || a.image?.data?.attributes?.url;
      if (rawUrl) img = rawUrl.startsWith('http') ? rawUrl : API_URL + rawUrl;

      setProduct({
        id: d.id || d.documentId,
        name: a.Name || a.name,
        price: a.Price || a.price,
        oldPrice: a.OldPrice || a.oldPrice,
        description: a.Description || a.description,
        image: img,
        rating: a.Rating || a.rating,
        category: a.Category || a.category,
        specs: a.specs || null,
      });
    });
  }, [id]);

  if (!product) return <div className="container" style={{ padding: "40px", textAlign: "center" }}><h3>Завантаження...</h3></div>;

  return (
    <div className="container product-page">
      <Breadcrumbs categoryName={product.category} productName={product.name} />
      <div className="product-layout">
        <div className="product-image-large">
          <img src={product.image || "https://placehold.co/600"} alt="" />
        </div>
        <div className="product-info-full">
          <h1>{product.name}</h1>
          <div className="rating">
            <i className="fas fa-star filled" style={{ color: "#ffbf00" }}></i> {product.rating}
          </div>
          
          <div className="price-box" style={{ display: "flex", gap: "20px", flexWrap: "wrap", alignItems: "center" }}>
            <div className="prices-large">
              {product.oldPrice && <span className="old-price-large">{product.oldPrice} ₴</span>}
              <div className="big-price">{product.price} ₴</div>
            </div>
            
            {/* БЛОК ВИБОРУ КІЛЬКОСТІ */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px", background: "#f5f5f5", padding: "5px", borderRadius: "8px" }}>
              <button 
                onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                style={{ border: "none", background: "#fff", width: "35px", height: "35px", borderRadius: "6px", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }}
              >-</button>
              <span style={{ fontWeight: "bold", minWidth: "25px", textAlign: "center", fontSize: "16px" }}>{quantity}</span>
              <button 
                onClick={() => setQuantity(q => q + 1)} 
                style={{ border: "none", background: "#fff", width: "35px", height: "35px", borderRadius: "6px", cursor: "pointer", fontSize: "18px", fontWeight: "bold" }}
              >+</button>
            </div>

            <button
              className="buy-btn-large"
              onClick={() => addToCart(product, quantity)}
            >
              Купити
            </button>
          </div>

          {product.specs && (
            <div className="specs-table-container">
              <h3>Характеристики</h3>
              <table className="specs-table">
                <tbody>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <tr key={key}>
                      <td className="spec-key">{key}</td>
                      <td className="spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="description-block">
            <h3>Опис</h3>
            {renderDescription(product.description)}
          </div>
        </div>
      </div>
    </div>
  );
};

const NotFoundPage = () => (
  <div className="container page-404">
    <div className="content-404">
      <h1>404</h1>
      <Link to="/" className="btn-404">
        Додому
      </Link>
    </div>
  </div>
);

function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [sortOption, setSortOption] = useState("default");
  const [searchTerm, setSearchTerm] = useState("");

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const availableBrands = useMemo(() => {
    const brands = products.map((p) => p.brand).filter(Boolean);
    return [...new Set(brands)];
  }, [products]);

  useEffect(() => {
    const fetchProducts = () => {
      axios.get(`${API_URL}/api/products?populate=*`)
        .then((res) => {
          const formatted = res.data.data.map((item) => {
            const d = item.attributes || item;
            
            let img = null;
            let rawUrl = null;
            
            if (d.image && d.image.url) {
                rawUrl = d.image.url;
            } else if (d.image && d.image.data && d.image.data.attributes) {
                rawUrl = d.image.data.attributes.url;
            }

            if (rawUrl) {
                img = rawUrl.startsWith('http') ? rawUrl : API_URL + rawUrl;
            }

            return {
              id: item.id,
              documentId: item.documentId || item.id,
              name: d.Name || d.name,
              price: d.Price || d.price,
              oldPrice: d.OldPrice || d.oldPrice,
              category: d.Category || d.category,
              brand: d.brand || null,
              specs: d.specs || null,
              image: img,
              isPromo: d.IsPromo || d.isPromo,
              rating: d.Rating || d.rating || 0,
            };
          });
          
          setProducts(formatted);
          setLoading(false);
        })
        .catch((err) => {
          console.log("Server is sleeping... retrying in 3s");
          setTimeout(fetchProducts, 3000);
        });
    };

    fetchProducts();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let temp = products;

    if (searchTerm) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      if (selectedCategory !== "all") {
        temp = temp.filter((p) => p.category === selectedCategory);
      }
    }

    if (selectedBrand !== "all") {
      temp = temp.filter((p) => p.brand === selectedBrand);
    }

    setFilteredProducts(temp);
  }, [products, selectedCategory, selectedBrand, searchTerm]);

  const handleSelectCategory = (categoryId) => {
    setSearchTerm("");
    setSelectedCategory(categoryId);
    setSelectedBrand("all");
    setSortOption("default");
  };

  const handleSearch = (query) => {
    setSearchTerm(query);
    setSelectedCategory("search_results");
    setSelectedBrand("all");
  };

  const getCategoryTitle = () => {
    if (searchTerm) return `Результати пошуку: "${searchTerm}"`;
    const cat = CATEGORIES.find((c) => c.id === selectedCategory);
    return cat ? cat.name : "Каталог";
  };

  const addToCart = (p, quantity = 1) => {
    setCart((prevCart) => {
      // Шукаємо, чи є вже такий товар у кошику
      const existingIndex = prevCart.findIndex((item) => item.id === p.id);
      
      if (existingIndex !== -1) {
        // Якщо є — плюсуємо кількість
        const newCart = [...prevCart];
        newCart[existingIndex].quantity += quantity;
        return newCart;
      }
      // Якщо немає — додаємо новий об'єкт з полем quantity
      return [...prevCart, { ...p, quantity }];
    });

    toast.success(`${p.name} (${quantity} шт.) додано!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };

  const removeItem = (idx) => {
    setCart(cart.filter((_, i) => i !== idx));
    toast.info("Видалено", { position: "bottom-right", autoClose: 1000 });
  };

  return (
    <Router>
      <div className="app">
        <Header
          cartCount={cart.length}
          openCart={() => setIsCartOpen(true)}
          products={products}
          onLogoClick={() => handleSelectCategory("all")}
          onSearch={handleSearch}
          user={user}
          openAuth={() => setIsAuthOpen(true)}
        />
        <SubHeader onSelectCategory={handleSelectCategory} />

        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                products={filteredProducts}
                addToCart={addToCart}
                loading={loading}
                categoryTitle={getCategoryTitle()}
                sortOption={sortOption}
                setSortOption={setSortOption}
                selectedBrand={selectedBrand}
                setSelectedBrand={setSelectedBrand}
                availableBrands={availableBrands}
              />
            }
          />
          <Route
            path="/product/:id"
            element={<ProductPage addToCart={addToCart} />}
          />
          <Route 
            path="/profile" 
            element={<ProfilePage user={user} setUser={setUser} />} 
          />
          <Route 
            path="/checkout" 
            element={<CheckoutPage cart={cart} setCart={setCart} user={user} />} 
          />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {isAuthOpen && (
          <AuthModal 
            closeAuth={() => setIsAuthOpen(false)} 
            onLoginSuccess={(userData) => setUser(userData)} 
          />
        )}

        {isCartOpen && (
          <CartModal
            cart={cart}
            closeCart={() => setIsCartOpen(false)}
            removeItem={removeItem}
          />
        )}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;

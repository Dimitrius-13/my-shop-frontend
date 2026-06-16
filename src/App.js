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
import { IMaskInput } from "react-imask";
import "./App.css";
import ProductList from "./components/ProductList";

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

// --- КОМПОНЕНТИ ---

const Header = ({ cartCount, openCart, products, onLogoClick, onSearch }) => {
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
    if (sortOption === "price_asc")
      return sorted.sort((a, b) => a.price - b.price);
    if (sortOption === "price_desc")
      return sorted.sort((a, b) => b.price - a.price);
    if (sortOption === "rating")
      return sorted.sort((a, b) => b.rating - a.rating);
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

      {/* ПАНЕЛЬ ФІЛЬТРІВ */}
      <div className="section-header-row">
        <h2 className="section-title">{categoryTitle}</h2>

        <div className="filters-row">
          {/* ФІЛЬТР ПО БРЕНДУ */}
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

          {/* СОРТУВАННЯ */}
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

      {/* ВИКЛИК КОМПОНЕНТА СПИСКУ ТОВАРІВ ЗАМІСТЬ МОНОЛІТУ */}
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

export default HomePage;
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

// СТОРІНКА ТОВАРУ (З ТАБЛИЦЕЮ SPECS)
const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/api/products/${id}?populate=*`).then((res) => {
      const d = res.data.data;
      const a = d.attributes || d;
      
      // --- БЕЗПЕЧНА ЛОГІКА КАРТИНОК ---
      let img = null;
      let rawUrl = null;

      if (a.image && a.image.url) {
          rawUrl = a.image.url;
      } else if (a.image && a.image.data && a.image.data.attributes) {
          rawUrl = a.image.data.attributes.url;
      }

      if (rawUrl) {
          img = rawUrl.startsWith('http') ? rawUrl : API_URL + rawUrl;
      }
      // ---------------------------------

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

  if (!product)
    return (
      <div className="container" style={{ padding: "40px" }}>
        <SkeletonLoader />
      </div>
    );

  return (
    <div className="container product-page">
      <Breadcrumbs categoryName={product.category} productName={product.name} />
      <div className="product-layout">
        <div className="product-image-large">
          <img src={product.image} alt="" />
        </div>
        <div className="product-info-full">
          <h1>{product.name}</h1>
          <div className="rating">
            <i className="fas fa-star filled" style={{ color: "#ffbf00" }}></i>{" "}
            {product.rating}
          </div>
          <div className="price-box">
            <div className="prices-large">
              {product.oldPrice && (
                <span className="old-price-large">{product.oldPrice} ₴</span>
              )}
              <div className="big-price">{product.price} ₴</div>
            </div>
            <button
              className="buy-btn-large"
              onClick={() => addToCart(product)}
            >
              Купити
            </button>
          </div>

          {/* ТАБЛИЦЯ ХАРАКТЕРИСТИК (SPECS) */}
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

const CartModal = ({ cart, closeCart, removeItem, submitOrder }) => {
  const total = cart.reduce((sum, item) => sum + item.price, 0);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const isFormValid = name.trim() !== "" && phone.length === 19;
  return (
    <div className="modal-overlay" onClick={closeCart}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        <div className="cart-header">
          <h2>Кошик</h2>
          <span className="close-btn" onClick={closeCart}>
            ×
          </span>
        </div>
        <div className="cart-body">
          {cart.map((i, idx) => (
            <div key={idx} className="cart-item-row">
              <img src={i.image} width="40" alt="" />
              <div style={{ flex: 1, marginLeft: "10px" }}>
                <div style={{ fontSize: "14px" }}>{i.name}</div>
                <b style={{ fontSize: "14px" }}>{i.price} ₴</b>
              </div>
              <span className="del" onClick={() => removeItem(idx)}>
                🗑️
              </span>
            </div>
          ))}
          {cart.length === 0 && (
            <div className="empty-state">😕 Кошик порожній</div>
          )}
        </div>
        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="total-row">Разом: {total} ₴</div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitOrder(name, phone);
              }}
            >
              <label>Ваше ім'я</label>
              <input
                placeholder="Введіть ім'я"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="modal-input"
              />
              <label>Номер телефону</label>
              <IMaskInput
                mask="+{38} (000) 000-00-00"
                radix="."
                value={phone}
                unmask={false}
                onAccept={(value) => setPhone(value)}
                placeholder="+38 (0__) ___-__-__"
                className="modal-input"
                required
              />
              <button className="checkout-btn" disabled={!isFormValid}>
                {isFormValid ? "ПІДТВЕРДИТИ ЗАМОВЛЕННЯ" : "Заповніть дані"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

// ... NotFoundPage ...
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

// ГОЛОВНИЙ APP
function App() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState("all"); // НОВЕ: БРЕНД
  const [sortOption, setSortOption] = useState("default");
  const [searchTerm, setSearchTerm] = useState(""); // Глобальний пошук

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Отримуємо список унікальних брендів з поточних продуктів
  const availableBrands = useMemo(() => {
    const brands = products.map((p) => p.brand).filter(Boolean); // Тільки не пусті
    return [...new Set(brands)]; // Унікальні
  }, [products]);

  // App.js

  useEffect(() => {
    // Створюємо функцію завантаження
    const fetchProducts = () => {
      axios.get(`${API_URL}/api/products?populate=*`)
        .then((res) => {
          // ЯКЩО УСПІХ:
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
          setLoading(false); // Прибираємо скелетон
          
          // Можна показати повідомлення, що ми підключились
          // toast.success("Каталог оновлено!"); 
        })
        .catch((err) => {
          // ЯКЩО ПОМИЛКА (Сервер спить):
          console.log("Server is sleeping... retrying in 3s");
          
          // Якщо це перша спроба і ми ще чекаємо - показуємо тост
          if (loading) {
             // Можна розкоментувати, якщо хочеш бачити повідомлення
             // toast.info("Сервер прокидається, зачекайте...", { autoClose: 2000 });
          }

          // Пробуємо знову через 3 секунди (рекурсія)
          setTimeout(fetchProducts, 3000);
        });
    };

    // Запускаємо перший раз
    fetchProducts();
  }, []); // Порожній масив = запуск тільки при старті

  // ЄДИНА ЛОГІКА ФІЛЬТРАЦІЇ
  useEffect(() => {
    let temp = products;

    // 1. Пошук
    if (searchTerm) {
      temp = temp.filter((p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } else {
      // 2. Категорія (тільки якщо немає пошуку)
      if (selectedCategory !== "all") {
        temp = temp.filter((p) => p.category === selectedCategory);
      }
    }

    // 3. Бренд (завжди)
    if (selectedBrand !== "all") {
      temp = temp.filter((p) => p.brand === selectedBrand);
    }

    setFilteredProducts(temp);
  }, [products, selectedCategory, selectedBrand, searchTerm]);

  const handleSelectCategory = (categoryId) => {
    setSearchTerm(""); // Скидаємо пошук
    setSelectedCategory(categoryId);
    setSelectedBrand("all"); // Скидаємо бренд при зміні категорії
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

  // ... (addToCart, removeItem, submitOrder ті самі) ...
  const addToCart = (p) => {
    setCart([...cart, p]);
    toast.success(`${p.name} додано!`, {
      position: "bottom-right",
      autoClose: 2000,
    });
  };
  const removeItem = (idx) => {
    setCart(cart.filter((_, i) => i !== idx));
    toast.info("Видалено", { position: "bottom-right", autoClose: 1000 });
  };
  const submitOrder = async (n, p) => {
    try {
      const total = cart.reduce((sum, item) => sum + item.price, 0);
      const orderDetails = cart.map((i) => `${i.name}`).join(", ");
      await axios.post(`${API_URL}/api/orders`, {
        data: { clientName: n, clientPhone: p, total, orderDetails },
      });
      toast.success("✅ Замовлення прийнято!", {
        position: "top-center",
        autoClose: 5000,
      });
      setCart([]);
      setIsCartOpen(false);
    } catch (e) {
      console.error(e);
      toast.error("Помилка замовлення!");
    }
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
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {isCartOpen && (
          <CartModal
            cart={cart}
            closeCart={() => setIsCartOpen(false)}
            removeItem={removeItem}
            submitOrder={submitOrder}
          />
        )}
        <ToastContainer />
      </div>
    </Router>
  );
}

export default App;

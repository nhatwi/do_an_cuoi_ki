// 1. Dữ liệu 5 sản phẩm mẫu ban đầu
const defaultProducts = [
  { id: 1, name: "Laptop Gaming Nitro 5", price: 18500000, image: "images/product-01.jpg", desc: "Core i5, RAM 16GB, SSD 512GB, màn hình 144Hz." },
  { id: 2, name: "Tai nghe Bluetooth Sony WH", price: 2490000, image: "images/product-02.jpg", desc: "Chống ồn chủ động, pin 30 giờ liên tục." },
  { id: 3, name: "Bàn phím cơ Keychron K2", price: 1750000, image: "images/product-03.jpg", desc: "Switch Gateron Brown, kết nối 3 thiết bị." },
  { id: 4, name: "Chuột không dây Logitech G304", price: 790000, image: "images/product-04.jpg", desc: "Cảm biến HERO siêu nhạy, trọng lượng nhẹ." },
  { id: 5, name: "Màn hình Dell UltraSharp 24\"", price: 4600000, image: "images/product-05.jpg", desc: "Tấm nền IPS Full HD, chuẩn màu 99% sRGB." }
];

// 2. Lấy danh sách sản phẩm từ localStorage (nếu chưa có thì nạp 5 SP mẫu)
function getProducts() {
  let products = JSON.parse(localStorage.getItem("techstore_products"));
  if (!products || products.length === 0) {
    products = defaultProducts;
    localStorage.setItem("techstore_products", JSON.stringify(products));
  }
  return products;
}

// 3. Hiển thị danh sách sản phẩm ra lưới Bootstrap
function renderProducts(list) {
  const container = document.getElementById("productList");
  if (!container) return;

  if (list.length === 0) {
    container.innerHTML = `<div class="col-12 text-center py-5 text-muted">Không tìm thấy sản phẩm nào phù hợp.</div>`;
    return;
  }

  container.innerHTML = list.map(sp => `
    <div class="col-12 col-sm-6 col-md-4 fade-in">
      <div class="card h-100 shadow-sm product-card">
        <div class="overflow-hidden">
          <img src="${sp.image}" class="card-img-top product-img" alt="${sp.name}" 
               onerror="this.src='https://placehold.co/400x260?text=${encodeURIComponent(sp.name)}'">
        </div>
        <div class="card-body d-flex flex-column">
          <h5 class="card-title fw-bold">${sp.name}</h5>
          <p class="card-text text-secondary small">${sp.desc || "Sản phẩm chính hãng bảo hành 12 tháng."}</p>
          <p class="text-danger fw-bold fs-5 mt-auto mb-3">${Number(sp.price).toLocaleString("vi-VN")}đ</p>
          <div class="d-flex gap-2">
            <button class="btn btn-primary flex-grow-1" onclick="addToCart(${sp.id})">
              <i class="bi bi-cart-plus"></i> Thêm vào giỏ
            </button>
            <button class="btn btn-outline-danger" onclick="deleteProduct(${sp.id})" title="Xóa sản phẩm">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join("");
}

// 4. Lọc & Sắp xếp sản phẩm
function filterAndSort() {
  const keyword = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const sortType = document.getElementById("sortSelect")?.value || "default";
  
  let filtered = getProducts().filter(sp => sp.name.toLowerCase().includes(keyword));
  
  if (sortType === "asc") filtered.sort((a, b) => a.price - b.price);
  if (sortType === "desc") filtered.sort((a, b) => b.price - a.price);
  
  renderProducts(filtered);
}

// 5. Xử lý Form Upload sản phẩm mới vào localStorage
const addForm = document.getElementById("addProductForm");
if (addForm) {
  addForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = document.getElementById("prodName").value.trim();
    const price = Number(document.getElementById("prodPrice").value);
    const desc = document.getElementById("prodDesc").value.trim();
    const fileInput = document.getElementById("prodImageFile");

    const saveNewProduct = (imgData) => {
      const products = getProducts();
      const newProduct = {
        id: Date.now(),
        name: name,
        price: price,
        image: imgData,
        desc: desc
      };
      products.unshift(newProduct); // Đưa sản phẩm mới upload lên đầu danh sách
      localStorage.setItem("techstore_products", JSON.stringify(products));

      addForm.reset();
      bootstrap.Modal.getInstance(document.getElementById("addProductModal")).hide();
      filterAndSort();
      alert("Đã upload sản phẩm mới và lưu vào localStorage!");
    };

    // Nếu người dùng chọn file ảnh từ máy -> chuyển sang Base64 để lưu được vào localStorage
    if (fileInput.files && fileInput.files[0]) {
      const reader = new FileReader();
      reader.onload = function (event) {
        saveNewProduct(event.target.result);
      };
      reader.readAsDataURL(fileInput.files[0]);
    } else {
      saveNewProduct("images/product-01.jpg");
    }
  });
}

// Xóa sản phẩm
function deleteProduct(id) {
  if (!confirm("Bạn có chắc muốn xóa sản phẩm này?")) return;
  const products = getProducts().filter(sp => sp.id !== id);
  localStorage.setItem("techstore_products", JSON.stringify(products));
  filterAndSort();
}

// 6. Chức năng Giỏ hàng cơ bản
let cart = JSON.parse(localStorage.getItem("techstore_cart")) || [];

function addToCart(productId) {
  const product = getProducts().find(sp => sp.id === productId);
  if (!product) return;
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  localStorage.setItem("techstore_cart", JSON.stringify(cart));
  updateCartUI();
}

function updateCartUI() {
  const countEl = document.getElementById("cartCount");
  const bodyEl = document.getElementById("cartBody");
  const totalEl = document.getElementById("cartTotal");
  
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  if (countEl) countEl.textContent = totalQty;

  if (!bodyEl || !totalEl) return;
  if (cart.length === 0) {
    bodyEl.innerHTML = `<p class="text-center text-muted my-3">Giỏ hàng đang trống.</p>`;
    totalEl.textContent = "0đ";
    return;
  }

  let totalMoney = 0;
  bodyEl.innerHTML = cart.map(item => {
    totalMoney += item.price * item.qty;
    return `
      <div class="d-flex justify-content-between align-items-center border-bottom py-2">
        <div>
          <h6 class="mb-0 fw-bold">${item.name}</h6>
          <small class="text-muted">${item.price.toLocaleString("vi-VN")}đ x ${item.qty}</small>
        </div>
        <span class="fw-bold text-danger">${(item.price * item.qty).toLocaleString("vi-VN")}đ</span>
      </div>
    `;
  }).join("");
  totalEl.textContent = totalMoney.toLocaleString("vi-VN") + "đ";
}

function checkoutCart() {
  if (cart.length === 0) return alert("Giỏ hàng đang trống!");
  alert("Đặt hàng thành công! Cảm ơn bạn đã mua sắm tại TechStore.");
  cart = [];
  localStorage.setItem("techstore_cart", JSON.stringify(cart));
  updateCartUI();
  bootstrap.Modal.getInstance(document.getElementById("cartModal")).hide();
}

// Khởi chạy khi tải trang
document.addEventListener("DOMContentLoaded", () => {
  filterAndSort();
  updateCartUI();
  document.getElementById("searchInput")?.addEventListener("input", filterAndSort);
  document.getElementById("sortSelect")?.addEventListener("change", filterAndSort);
});
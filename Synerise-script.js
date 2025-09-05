//Script compatible with: https://www.x-kom.pl/
//Dev proof video: https://drive.google.com/file/d/14az-0b-9VoRvoMTFOu7EfUKDyG6cMucJ/view?usp=drive_link

const SELECTORS = {
  name: ".parts__Title-sc-17c34dee-5",
  price: ".parts__ScreenReaderPrice-sc-24f114ef-6",
  image: ".sc-dzfhSK",
};

const styles = document.createElement("style");
styles.textContent = `
  .cart-panel {
    position: fixed;
    bottom: 0;
    right: 0;
    min-height: 300px;
    max-height: 500px;
    width: 100%;
    max-width: 500px;
    background: white;
    z-index: 999;
    overflow-y: auto;
    padding: 10px;
    border: 1px solid black;
    color: black;
  }
  .cart-table { width: 100%; border-collapse: collapse; border-radius: 10px }
  .cart-empty { text-align: center; margin-top: 50px }
  .cart-table th, .cart-table td {
    border: 1px solid black;
    padding: 5px;
    text-align: center;
  }
  .cart-table th { background: gray }
  .cart-total { font-weight: bold; }
  .btn { padding: 2px 6px }
`;

document.head.appendChild(styles);

const cartPanel = document.createElement("div");
cartPanel.className = "cart-panel";
document.body.appendChild(cartPanel);

const parsePrice = (str) =>
  parseFloat(str.replace(/[^\d,]/g, "").replace(",", ".")) || 0;

const getProduct = () => ({
  name: document.querySelector(SELECTORS.name)?.textContent || "Unknown",
  price: parsePrice(
    document.querySelector(SELECTORS.price)?.textContent || "0",
  ),
  image: document.querySelector(SELECTORS.image)?.src || "",
  url: location.href,
});

const getCartFromLocalStorage = () =>
  JSON.parse(localStorage.getItem("cart")) || [];

const saveCartToLocalStorage = (cart) => {
  localStorage.setItem("cart", JSON.stringify(cart));
  window.dispatchEvent(new Event("storage"));
};

const addToCart = () => {
  const product = getProduct();
  const cart = getCartFromLocalStorage();
  const existing = cart.find((item) => item.url === product.url);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCartToLocalStorage(cart);
};

const updateQuantity = (url) => {
  const cart = getCartFromLocalStorage();
  const item = cart.find((product) => product.url === url);
  if (item) {
    item.quantity -= 1;
    if (item.quantity <= 0) {
      cart.splice(cart.indexOf(item), 1);
    }
  }
  saveCartToLocalStorage(cart);
};

const removeItemFromCart = (url) => {
  const cart = getCartFromLocalStorage().filter((item) => item.url !== url);
  saveCartToLocalStorage(cart);
};

const renderCart = () => {
  let totalCartValue = 0;

  const cart = getCartFromLocalStorage();
  cartPanel.innerHTML = "";

  if (!cart.length) {
    const emptyMsg = document.createElement("p");
    emptyMsg.textContent = "Cart is empty";
    emptyMsg.className = "cart-empty";
    cartPanel.appendChild(emptyMsg);
    return;
  }

  const table = document.createElement("table");
  table.className = "cart-table";

  const headers = ["Name", "Price", "Quantity", "Total", "Actions"];
  const thead = document.createElement("thead");
  const headerRow = document.createElement("tr");

  headers.forEach((text) => {
    const th = document.createElement("th");
    th.textContent = text;
    headerRow.appendChild(th);
  });
  thead.appendChild(headerRow);

  const tbody = document.createElement("tbody");
  cart.forEach((item) => {
    const row = document.createElement("tr");
    const itemTotal = item.price * item.quantity;
    totalCartValue += itemTotal;

    const rowData = [
      item.name,
      item.price.toFixed(2),
      item.quantity,
      itemTotal.toFixed(2),
    ];
    rowData.forEach((val) => {
      const td = document.createElement("td");
      td.textContent = val;
      row.appendChild(td);
    });

    const actionCell = document.createElement("td");
    const decreaseBtn = document.createElement("button");
    const removeBtn = document.createElement("button");

    removeBtn.className = "btn";
    decreaseBtn.className = "btn";

    decreaseBtn.textContent = "-";
    removeBtn.textContent = "X";

    decreaseBtn.addEventListener("click", () => updateQuantity(item.url));
    removeBtn.addEventListener("click", () => removeItemFromCart(item.url));

    actionCell.appendChild(decreaseBtn);
    actionCell.appendChild(removeBtn);
    row.appendChild(actionCell);

    tbody.appendChild(row);
  });

  const totalRow = document.createElement("tr");
  const totalLabelCell = document.createElement("td");
  totalLabelCell.colSpan = 3;
  totalLabelCell.className = "cart-total";
  totalLabelCell.textContent = "Total cart value";

  const totalValueCell = document.createElement("td");
  totalValueCell.colSpan = 2;
  totalValueCell.className = "cart-total";
  totalValueCell.textContent = totalCartValue.toFixed(2);

  totalRow.appendChild(totalLabelCell);
  totalRow.appendChild(totalValueCell);
  tbody.appendChild(totalRow);

  table.appendChild(thead);
  table.appendChild(tbody);
  cartPanel.appendChild(table);
};

window.addEventListener("storage", renderCart);

addToCart();

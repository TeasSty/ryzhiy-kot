const RK = {
  phone: "8 (913) 311-78-77",
  tel: "+79133117877",
  vk: "https://vk.com/redcat42",
  vkMe: "https://vk.me/redcat42",
  wa: "https://wa.me/79133117877",
  map: "https://2gis.ru/novokuznetsk/search/проспект%20Строителей%2041"
};

const TAG_LABEL = {
  birthday: "День рождения",
  love: "Любимому человеку",
  baby: "Рождение малыша",
  kids: "Детский праздник",
  grad: "Выпускной",
  gift: "Просто подарок"
};

const TAG_OVERRIDE = {
  16217645: "birthday",
  16172485: "love",
  16172452: "birthday",
  16154089: "kids",
  16134970: "baby",
  16134935: "baby",
  16134930: "birthday",
  16054325: "love",
  16054292: "baby",
  16042050: "kids",
  16042042: "kids",
  16125949: "grad",
  16125944: "grad",
  15912755: "birthday",
  15039070: "love",
  15039060: "love",
  15997481: "love"
};

const WHO_TAG = { mom: "love", love: "love", baby: "baby", kid: "kids", team: "gift" };

let catalog = [];

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[ch]));
}

function rub(amount) {
  return new Intl.NumberFormat("ru-RU").format(amount) + " ₽";
}

function tagOf(item) {
  if (TAG_OVERRIDE[item.id]) return TAG_OVERRIDE[item.id];
  const text = (item.title + " " + item.desc).toLowerCase();
  if (/выпис|малыш|метрик|годовас|роддом|новорож|барни/.test(text)) return "baby";
  if (/учител|тетрад|карандаш|выпуск|сентябр/.test(text)) return "grad";
  if (/муж|love|романт|сердц|девич/.test(text)) return "love";
  if (/летие|радуг|бабоч|зверят|девочк/.test(text)) return "kids";
  if (/рожден|birthday/.test(text)) return "birthday";
  return "gift";
}

function readList(key) {
  try { return JSON.parse(localStorage.getItem(key) || "[]"); }
  catch { return []; }
}
function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
  updateCartCount();
}
function cartItems() { return readList("rk-cart"); }
function favIds() { return readList("rk-fav"); }
function isFav(id) { return favIds().includes(id); }

function addToCart(id) {
  const items = cartItems();
  const row = items.find((item) => item.id === id);
  if (row) row.qty += 1;
  else items.push({ id, qty: 1 });
  writeList("rk-cart", items);
  toast("Добавили в корзину");
}

function setQty(id, qty) {
  let items = cartItems();
  if (qty <= 0) items = items.filter((item) => item.id !== id);
  else items = items.map((item) => item.id === id ? { ...item, qty } : item);
  writeList("rk-cart", items);
}

function toggleFav(id) {
  const ids = favIds();
  const next = ids.includes(id) ? ids.filter((item) => item !== id) : [...ids, id];
  writeList("rk-fav", next);
  document.querySelectorAll(`[data-fav="${id}"]`).forEach((button) => {
    const on = next.includes(id);
    button.setAttribute("aria-pressed", on ? "true" : "false");
    button.textContent = on ? "В избранном" : "В избранное";
  });
}

function toast(text) {
  let node = document.querySelector(".toast");
  if (!node) {
    node = document.createElement("div");
    node.className = "toast";
    document.body.appendChild(node);
  }
  node.textContent = text;
  node.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => node.classList.remove("show"), 1800);
}

function updateCartCount() {
  const count = cartItems().reduce((sum, item) => sum + item.qty, 0);
  document.querySelectorAll("[data-cart-count]").forEach((node) => {
    node.textContent = count ? `Корзина ${count}` : "Корзина";
  });
}

function pageName() {
  const file = location.pathname.split("/").pop() || "index.html";
  return file === "" ? "index.html" : file;
}

function renderHeader() {
  const host = document.querySelector("[data-header]");
  if (!host) return;
  const current = pageName();
  const link = (href, label) => `<a href="${href}" ${current === href ? 'aria-current="page"' : ""}>${label}</a>`;
  host.className = "site-header";
  host.innerHTML = `
    <a class="brand" href="index.html">
      <img src="img/logo.jpg" alt="" width="38" height="38">
      <span><strong>РЫЖИЙ КОТ</strong><small>воздушные шары</small></span>
    </a>
    <div class="menu-panel">
      <nav class="nav" aria-label="Разделы">
        ${link("catalog.html", "Каталог")}
        ${link("solutions.html", "Готовые решения")}
        ${link("decor.html", "Оформление")}
        ${link("delivery.html", "Доставка")}
        ${link("about.html", "О нас")}
        ${link("contacts.html", "Контакты")}
      </nav>
      <form class="search" action="catalog.html" role="search">
        <input name="q" type="search" placeholder="Поиск" aria-label="Поиск композиции">
        <button type="submit">Найти</button>
      </form>
      <a class="phone" href="tel:${RK.tel}">${RK.phone}</a>
      <a class="btn write" href="${RK.vkMe}" target="_blank" rel="noopener">Написать</a>
    </div>
    <a class="cart-link" data-cart-count href="cart.html">Корзина</a>
    <button class="nav-toggle" type="button" aria-expanded="false">Меню</button>
  `;
  host.querySelector(".nav-toggle").addEventListener("click", () => {
    const open = host.classList.toggle("menu-open");
    host.querySelector(".nav-toggle").setAttribute("aria-expanded", open ? "true" : "false");
  });
  updateCartCount();
}

function renderFooter() {
  const host = document.querySelector("[data-footer]");
  if (!host) return;
  host.className = "site-footer";
  host.innerHTML = `
    <span>Рыжий кот · Новокузнецк, пр-т Строителей, 41</span>
    <span><a href="tel:${RK.tel}">${RK.phone}</a> · доставка круглосуточно</span>
  `;
}

function goodCard(item) {
  const fav = isFav(item.id);
  return `
    <article class="good">
      <a href="product.html?id=${item.id}">
        <img src="img/products/${esc(item.file)}" alt="${esc(item.title)}">
      </a>
      <div class="good-meta">
        <a class="good-name" href="product.html?id=${item.id}">${esc(item.title)}</a>
        <span class="good-price">${rub(item.price)}</span>
        <div class="good-actions">
          <button class="ghost" type="button" data-fav="${item.id}" aria-pressed="${fav ? "true" : "false"}">${fav ? "В избранном" : "В избранное"}</button>
          <button class="ghost" type="button" data-cart="${item.id}">В корзину</button>
        </div>
      </div>
    </article>
  `;
}

function bindShop(root) {
  root.querySelectorAll("[data-cart]").forEach((button) => {
    button.addEventListener("click", () => addToCart(Number(button.dataset.cart)));
  });
  root.querySelectorAll("[data-fav]").forEach((button) => {
    button.addEventListener("click", () => toggleFav(Number(button.dataset.fav)));
  });
}

function params() {
  return new URLSearchParams(location.search);
}

function filteredProducts() {
  const query = params();
  const q = (query.get("q") || "").trim().toLowerCase();
  let tag = query.get("tag") || "";
  const who = query.get("who") || "";
  if (!tag && who) tag = WHO_TAG[who] || "";
  const range = query.get("max") || "";
  const favOnly = query.get("fav") === "1";
  const fav = favIds();
  return catalog.filter((item) => {
    if (favOnly && !fav.includes(item.id)) return false;
    if (tag && item.tag !== tag) return false;
    if (q && !(item.title + " " + item.desc).toLowerCase().includes(q)) return false;
    if (range === "8000plus") return item.price >= 8000;
    if (range) return item.price <= Number(range);
    return true;
  });
}

function renderCatalog() {
  const grid = document.querySelector("[data-catalog]");
  if (!grid) return;
  const items = filteredProducts();
  const query = params();
  const note = document.querySelector("[data-catalog-note]");
  const bits = [];
  if (query.get("q")) bits.push(`по запросу «${query.get("q")}»`);
  if (query.get("tag") && TAG_LABEL[query.get("tag")]) bits.push(TAG_LABEL[query.get("tag")].toLowerCase());
  if (query.get("who")) bits.push("с учётом, для кого подарок");
  if (query.get("max") === "8000plus") bits.push("от 8 000 ₽");
  else if (query.get("max")) bits.push(`до ${rub(Number(query.get("max")))}`);
  if (query.get("fav") === "1") bits.push("из избранного");
  if (note) {
    note.textContent = bits.length
      ? `Подборка: ${bits.join(", ")}. Нашли ${items.length}.`
      : `В каталоге ${items.length} композиций из магазина.`;
  }
  document.querySelectorAll("[data-filter]").forEach((link) => {
    const wanted = link.dataset.filter;
    const active = (wanted === "" && !query.get("tag") && !query.get("fav")) || wanted === (query.get("tag") || "") || (wanted === "fav" && query.get("fav") === "1");
    if (active) link.setAttribute("aria-current", "true");
  });
  grid.innerHTML = items.length
    ? items.map(goodCard).join("")
    : `<p>Такой композиции пока нет. Напишите нам — соберём под ваш повод.</p>`;
  bindShop(grid);
}

function renderStrips() {
  document.querySelectorAll("[data-strip]").forEach((node) => {
    const tag = node.dataset.strip;
    const items = catalog.filter((item) => item.tag === tag).slice(0, 3);
    node.innerHTML = items.map((item) => `
      <a href="product.html?id=${item.id}">
        <img src="img/products/${esc(item.file)}" alt="${esc(item.title)}">
        <strong>${esc(item.title)}</strong>
        <span>${rub(item.price)}</span>
      </a>
    `).join("");
  });
}

function renderProduct() {
  const root = document.querySelector("[data-product]");
  if (!root) return;
  const id = Number(params().get("id"));
  const item = catalog.find((entry) => entry.id === id);
  if (!item) {
    root.innerHTML = `<div class="product-copy"><h1>Композиция не найдена</h1><p><a href="catalog.html">Вернуться в каталог</a></p></div>`;
    return;
  }
  document.title = `${item.title} — Рыжий кот`;
  const fav = isFav(item.id);
  root.innerHTML = `
    <img src="img/products/${esc(item.file)}" alt="${esc(item.title)}">
    <div class="product-copy">
      <p class="eyebrow">${esc(TAG_LABEL[item.tag] || "Композиция")}</p>
      <h1>${esc(item.title)}</h1>
      <p class="product-price">${rub(item.price)}</p>
      <p class="desc">${esc(item.desc || "Соберём композицию в этой гамме. Надпись на шаре можно заменить.")}</p>
      <div class="product-actions">
        <button class="btn" type="button" data-cart="${item.id}">В корзину</button>
        <button class="ghost" type="button" data-fav="${item.id}" aria-pressed="${fav ? "true" : "false"}">${fav ? "В избранном" : "В избранное"}</button>
      </div>
      <p><a href="catalog.html">Все композиции</a></p>
    </div>
  `;
  bindShop(root);
}

function renderCart() {
  const root = document.querySelector("[data-cart-page]");
  if (!root) return;
  const items = cartItems().map((row) => ({ ...row, product: catalog.find((item) => item.id === row.id) })).filter((row) => row.product);
  if (!items.length) {
    root.innerHTML = `<p>Корзина пустая. Выберите композицию в <a href="catalog.html">каталоге</a> — мы подтвердим заказ в сообщении.</p>`;
    return;
  }
  const total = items.reduce((sum, row) => sum + row.product.price * row.qty, 0);
  root.innerHTML = items.map((row) => `
    <div class="cart-row">
      <img src="img/products/${esc(row.product.file)}" alt="">
      <div>
        <a href="product.html?id=${row.product.id}"><strong>${esc(row.product.title)}</strong></a>
        <div>${rub(row.product.price)}</div>
        <div class="qty">
          <button type="button" data-qty="${row.id}" data-delta="-1" aria-label="Меньше">−</button>
          <span>${row.qty}</span>
          <button type="button" data-qty="${row.id}" data-delta="1" aria-label="Больше">+</button>
          <button type="button" data-remove="${row.id}">Убрать</button>
        </div>
      </div>
      <strong>${rub(row.product.price * row.qty)}</strong>
    </div>
  `).join("") + `
    <div class="cart-total">
      <strong>Итого ${rub(total)}</strong>
      <div class="finale-actions">
        <a class="btn btn-wa" id="cart-wa" href="#">Отправить в WhatsApp</a>
        <a class="btn btn-vk" href="${RK.vkMe}" target="_blank" rel="noopener">Написать в VK</a>
      </div>
    </div>
    <p>Это заявка, не онлайн-оплата. Мы ответим и подтвердим состав, надпись и время доставки.</p>
  `;
  const lines = items.map((row) => `— ${row.product.title} × ${row.qty} — ${rub(row.product.price * row.qty)}`).join("\n");
  const text = `Здравствуйте! Хочу заказать в «Рыжем коте»:\n${lines}\nИтого: ${rub(total)}`;
  root.querySelector("#cart-wa").href = `${RK.wa}?text=${encodeURIComponent(text)}`;
  root.querySelectorAll("[data-qty]").forEach((button) => {
    button.addEventListener("click", () => {
      const id = Number(button.dataset.qty);
      const row = cartItems().find((item) => item.id === id);
      setQty(id, (row?.qty || 1) + Number(button.dataset.delta));
      renderCart();
    });
  });
  root.querySelectorAll("[data-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      setQty(Number(button.dataset.remove), 0);
      renderCart();
    });
  });
}

function bindOrderForm() {
  const form = document.querySelector("[data-order]");
  if (!form) return;
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const text = [
      "Здравствуйте! Хочу заказать оформление.",
      data.get("name") ? `Имя: ${data.get("name")}` : "",
      data.get("phone") ? `Телефон: ${data.get("phone")}` : "",
      data.get("date") ? `Дата: ${data.get("date")}` : "",
      data.get("kind") ? `Повод: ${data.get("kind")}` : "",
      data.get("place") ? `Место: ${data.get("place")}` : "",
      data.get("comment") ? `Комментарий: ${data.get("comment")}` : ""
    ].filter(Boolean).join("\n");
    window.open(`${RK.wa}?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  });
}

function bindHome() {
  const shelf = document.querySelector("[data-shelf]");
  if (!shelf) return;
  const ids = [16217645, 16172485, 16172452, 16154089, 16134970];
  const items = ids.map((id) => catalog.find((item) => item.id === id)).filter(Boolean);
  shelf.innerHTML = items.map(goodCard).join("");
  bindShop(shelf);
}

async function boot() {
  renderHeader();
  renderFooter();
  const response = await fetch("data/products.json");
  const raw = await response.json();
  catalog = raw.map((item) => ({ ...item, tag: tagOf(item) }));
  bindHome();
  renderCatalog();
  renderStrips();
  renderProduct();
  renderCart();
  bindOrderForm();
}

boot();

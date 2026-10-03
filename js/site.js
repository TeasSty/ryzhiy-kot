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
    button.classList.toggle("is-on", on);
    if (button.classList.contains("fav")) {
      button.setAttribute("aria-label", on ? "В избранном" : "В избранное");
    } else {
      button.textContent = on ? "В избранном" : "В избранное";
    }
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
    node.textContent = count ? String(count) : "";
    node.hidden = !count;
    const link = node.closest("a");
    if (link) link.setAttribute("aria-label", count ? `Корзина, ${count}` : "Корзина");
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
  const query = params().get("q") || "";
  const link = (href, label) => `<a href="${href}" ${current === href ? 'aria-current="page"' : ""}>${label}</a>`;
  host.className = "site-header";
  host.innerHTML = `
    <a class="brand" href="index.html">
      <img src="img/logo.jpg" alt="" width="44" height="44">
      <span><strong>РЫЖИЙ КОТ</strong><small>воздушные шары</small></span>
    </a>
    <nav class="nav" aria-label="Разделы">
      ${link("catalog.html", "Каталог")}
      ${link("solutions.html", "Готовые решения")}
      ${link("decor.html", "Оформление")}
      ${link("delivery.html", "Доставка")}
      ${link("about.html", "О нас")}
      ${link("contacts.html", "Контакты")}
    </nav>
    <div class="head-tools">
      <form class="search" action="catalog.html" role="search">
        <input name="q" type="search" placeholder="Поиск по товарам…" aria-label="Поиск по товарам" value="${esc(query)}">
        <button type="submit" aria-label="Найти">
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/></svg>
        </button>
      </form>
      <a class="phone" href="tel:${RK.tel}">
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M7 3.8h3.2l1.2 3.2-1.8 1.1a12.5 12.5 0 0 0 5.3 5.3l1.1-1.8 3.2 1.2V16a2 2 0 0 1-2.2 2A16.2 16.2 0 0 1 5 6a2 2 0 0 1 2-2.2z"/></svg>
        <span><strong>${RK.phone}</strong><small>Новокузнецк</small></span>
      </a>
    </div>
    <a class="cart-link" href="cart.html" aria-label="Корзина">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M6 7h15l-1.6 8.2a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.5L5.2 4.8H3"/><circle cx="9" cy="20" r="1.3"/><circle cx="17" cy="20" r="1.3"/></svg>
      <span data-cart-count hidden></span>
    </a>
    <a class="btn btn-write" href="${RK.wa}" target="_blank" rel="noopener">
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M12.04 2C6.58 2 2.15 6.4 2.15 11.83c0 1.74.46 3.44 1.34 4.94L2 22l5.39-1.4a10 10 0 0 0 4.65 1.18h.01c5.46 0 9.89-4.4 9.89-9.84C21.94 6.4 17.5 2 12.04 2zm5.76 14.15c-.24.68-1.4 1.25-1.94 1.33-.5.07-1.12.1-1.81-.11-.41-.13-.95-.31-1.64-.61-2.88-1.24-4.76-4.13-4.9-4.32-.14-.19-1.16-1.54-1.16-2.94s.73-2.08 1-2.37c.24-.26.64-.38.86-.38h.62c.2 0 .46-.07.72.55.27.64.91 2.22.99 2.38.08.16.13.35.03.56-.1.21-.16.34-.31.52-.15.18-.32.4-.46.54-.15.15-.3.31-.13.6.17.29.74 1.22 1.59 1.98 1.09.97 2.01 1.27 2.3 1.42.29.15.46.13.63-.07.17-.2.73-.85.92-1.14.19-.29.39-.24.66-.14.27.1 1.71.8 2 .95.29.14.49.21.56.33.07.12.07.7-.17 1.37z"/></svg>
      Написать
    </a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-label="Меню">
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
    </button>
  `;
  const search = host.querySelector(".search");
  const searchInput = search.querySelector("input");
  search.querySelector("button").addEventListener("click", (event) => {
    if (!searchInput.value.trim()) {
      event.preventDefault();
      searchInput.focus();
    }
  });
  host.querySelector(".nav-toggle").addEventListener("click", () => {
    const open = host.classList.toggle("menu-open");
    const toggle = host.querySelector(".nav-toggle");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
    toggle.setAttribute("aria-label", open ? "Закрыть меню" : "Меню");
  });
  updateCartCount();
}

function renderFooter() {
  const host = document.querySelector("[data-footer]");
  if (!host) return;
  host.className = "site-footer";
  host.innerHTML = `
    <div class="footer-grid">
      <a class="brand" href="index.html">
        <img src="img/logo.jpg" alt="" width="44" height="44">
        <span><strong>РЫЖИЙ КОТ</strong><small>воздушные шары</small></span>
      </a>
      <div>
        <a class="footer-phone" href="tel:${RK.tel}">${RK.phone}</a>
        <p>Новокузнецк, пр-т Строителей, 41</p>
      </div>
      <div>
        <p>Будни 10:00–19:00</p>
        <p>Выходные 10:00–17:00</p>
        <p>Доставка 24/7</p>
      </div>
      <div class="footer-links">
        <a href="${RK.vk}" target="_blank" rel="noopener">ВКонтакте</a>
        <a href="${RK.wa}" target="_blank" rel="noopener">WhatsApp</a>
      </div>
    </div>
  `;
}

function goodCard(item) {
  const fav = isFav(item.id);
  return `
    <article class="good">
      <div class="good-photo">
        <a href="product.html?id=${item.id}">
          <img src="img/products/${esc(item.file)}" alt="${esc(item.title)}">
        </a>
        <button class="fav${fav ? " is-on" : ""}" type="button" data-fav="${item.id}" aria-pressed="${fav ? "true" : "false"}" aria-label="${fav ? "В избранном" : "В избранное"}">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19.4s-6.2-3.9-6.2-8.1A3.6 3.6 0 0 1 12 8.2a3.6 3.6 0 0 1 6.2 3.1c0 4.2-6.2 8.1-6.2 8.1z"/></svg>
        </button>
      </div>
      <a class="good-name" href="product.html?id=${item.id}">${esc(item.title)}</a>
      <div class="good-buy">
        <span class="good-price">${rub(item.price)}</span>
        <button class="btn" type="button" data-cart="${item.id}">В корзину</button>
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
      <a class="mini" href="product.html?id=${item.id}">
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

const HOME_IDS = [16217645, 16172485, 16172452, 16154089, 16134970, 15912755, 16054325, 15039060, 16042050, 12304688, 15983938, 15039070, 16134935];
const HOME_AUD = {
  16217645: ["her", "set"],
  16172485: ["her"],
  16172452: ["set"],
  16154089: ["kids", "set"],
  16134970: ["kids", "set"],
  15912755: ["her", "set"],
  16054325: ["him", "set"],
  15039060: ["her"],
  16042050: ["kids", "set"],
  12304688: ["him"],
  15983938: ["him"],
  15039070: ["her"],
  16134935: ["kids", "set"]
};

function bindHome() {
  const shelf = document.querySelector("[data-shelf]");
  const pills = document.querySelector("[data-home-filters]");
  if (!shelf || !pills) return;
  const paint = (aud) => {
    const items = HOME_IDS
      .map((id) => catalog.find((item) => item.id === id))
      .filter((item) => item && (!aud || (HOME_AUD[item.id] || []).includes(aud)));
    shelf.innerHTML = items.length
      ? items.map(goodCard).join("")
      : `<p>В этой подборке пока нет готовых композиций. Посмотрите <a href="catalog.html">весь каталог</a>.</p>`;
    bindShop(shelf);
    pills.querySelectorAll("button").forEach((button) => {
      const on = (button.dataset.aud || "all") === (aud || "all");
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
  };
  pills.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const aud = button.dataset.aud || "all";
    paint(aud === "all" ? "" : aud);
  });
  paint("");
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

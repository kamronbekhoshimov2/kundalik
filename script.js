function initUsers() {
    let users = JSON.parse(localStorage.getItem("users")) || [{ username: "admin", password: "1234" }];
    localStorage.setItem("users", JSON.stringify(users));
}

initUsers();

function login() {
    let u = document.getElementById("user").value;
    let p = document.getElementById("pass").value;
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(x => x.username === u && x.password === p)) {
        localStorage.setItem("login", u); // saqlaymiz: kim kirgan
        showApp();
    } else {
        alert("Login yoki parol xato");
    }
}

function register() {
    let u = document.getElementById("user").value.trim();
    let p = document.getElementById("pass").value;
    if (!u || !p) {
        alert("Iltimos foydalanuvchi va parol kiriting");
        return;
    }
    let users = JSON.parse(localStorage.getItem("users")) || [];
    if (users.find(x => x.username === u)) {
        alert("Bu foydalanuvchi mavjud");
        return;
    }
    users.push({ username: u, password: p });
    localStorage.setItem("users", JSON.stringify(users));
    alert("Ro'yxatdan o'tildi. Iltimos tizimga kiring.");
}

function logout() {
    localStorage.removeItem("login");
    location.reload();
}

function showApp() {
    let loginBox = document.getElementById("loginBox");
    let appBox = document.getElementById("appBox");
    if (loginBox) loginBox.classList.add("hidden");
    if (appBox) appBox.classList.remove("hidden");
    // agar HTMLda currentUser elementi bo'lsa, foydalanuvchi nomini yozamiz
    let cu = document.getElementById("currentUser");
    if (cu) cu.innerText = localStorage.getItem("login") || "";
    load();
}

if (localStorage.getItem("login")) {
    showApp();
}

// ===== per-user DATA =====
function getUserKey() {
    let user = localStorage.getItem("login");
    return user ? `data_${user}` : null;
}

function save() {
    let userKey = getUserKey();
    if (!userKey) {
        alert("Avval tizimga kiring.");
        return;
    }

    let taskEl = document.getElementById("task");
    let moneyEl = document.getElementById("money");
    let task = taskEl ? taskEl.value.trim() : "";
    let money = parseInt(moneyEl ? moneyEl.value : 0) || 0;
    let date = new Date().toISOString().slice(0, 10);

    let data = JSON.parse(localStorage.getItem(userKey)) || [];
    data.push({ date, task, money });
    localStorage.setItem(userKey, JSON.stringify(data));

    if (taskEl) taskEl.value = "";
    if (moneyEl) moneyEl.value = "";
    load();
}

function load() {
    let userKey = getUserKey();
    let data = userKey ? (JSON.parse(localStorage.getItem(userKey)) || []) : [];
    let list = document.getElementById("list");
    let total = 0;
    let month = new Date().toISOString().slice(0, 7);

    if (list) list.innerHTML = "";
    data.slice().reverse().forEach(d => {
        if (d.date && d.date.startsWith(month)) total += Number(d.money) || 0;
        if (list) {
            list.innerHTML += `
        <div class="entry">
        📅 ${d.date}<br>
        📝 ${d.task}<br>
        💰 ${d.money} so'm
        </div>`;
        }
    });

    let totalEl = document.getElementById("total");
    if (totalEl) totalEl.innerText = total;
}
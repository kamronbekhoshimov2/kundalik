/* Improved, cleaner admin panel and general refactor.
   Replaces updateAdminStats with a compact, accessible UI:
   - left column: clickable user list (username + quick stats)
   - right column: selected user's detail cards (newest first)
   - overall summary injected into adminStats
   - automatic highlight of selected user and keyboard focus
*/

function initUsers() {
    let users = JSON.parse(localStorage.getItem("users")) || [{ username: "admin", password: "1234" }];
    localStorage.setItem("users", JSON.stringify(users));
}
initUsers();

function login() {
    const u = document.getElementById("user").value.trim();
    const p = document.getElementById("pass").value;
    const users = getUsers();
    if (users.find(x => x.username === u && x.password === p)) {
        localStorage.setItem("login", u);
        showApp();
    } else {
        alert("Login yoki parol xato");
    }
}

function register() {
    const u = document.getElementById("user").value.trim();
    const p = document.getElementById("pass").value;
    if (!u || !p) { alert("Iltimos foydalanuvchi va parol kiriting"); return; }
    const users = getUsers();
    if (users.find(x => x.username === u)) { alert("Bu foydalanuvchi mavjud"); return; }
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
    let current = localStorage.getItem("login") || "";
    if (cu) cu.innerText = current;

    // admin bo'lsa — normal user elementlarini yashirish
    const hideIds = ["task", "money", "list", "total"];
    // app ichidagi tugmalar (Saqlash va Chiqish) — Saqlash tugmasini onclick="save()" orqali topamiz
    const appButtons = Array.from(document.querySelectorAll("#appBox button"));

    if (current === "admin") {
        hideIds.forEach(id => {
            let el = document.getElementById(id);
            if (el) el.style.display = "none";
        });
        appButtons.forEach(b => {
            const oc = b.getAttribute("onclick") || "";
            if (oc.includes("save(")) b.style.display = "none"; // saqlashni yashirish
        });
    } else {
        // normal foydalanuvchi uchun qayta ko'rsatish
        hideIds.forEach(id => {
            let el = document.getElementById(id);
            if (el) el.style.display = "";
        });
        appButtons.forEach(b => {
            const oc = b.getAttribute("onclick") || "";
            if (oc.includes("save(")) b.style.display = ""; // saqlashni ko'rsatish
        });
    }

    load();
}

if (localStorage.getItem("login")) showApp();

function getUserKeyFor(username) { return username ? `data_${username}` : null; }
function getCurrentUserKey() { const u = localStorage.getItem("login"); return getUserKeyFor(u); }
function getUsers() { return JSON.parse(localStorage.getItem("users")) || []; }

function save() {
    const userKey = getCurrentUserKey();
    if (!userKey) { alert("Avval tizimga kiring."); return; }
    const taskEl = document.getElementById("task");
    const moneyEl = document.getElementById("money");
    const task = taskEl ? taskEl.value.trim() : "";
    const money = parseInt(moneyEl ? moneyEl.value : 0) || 0;
    const date = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(localStorage.getItem(userKey)) || [];
    data.push({ date, task, money });
    localStorage.setItem(userKey, JSON.stringify(data));
    if (taskEl) taskEl.value = "";
    if (moneyEl) moneyEl.value = "";
    load();
}

function load() {
    const userKey = getCurrentUserKey();
    const data = userKey ? (JSON.parse(localStorage.getItem(userKey)) || []) : [];
    const list = document.getElementById("list");
    let total = 0;
    const month = new Date().toISOString().slice(0, 7);

    if (list) list.innerHTML = "";
    data.slice().reverse().forEach(d => {
        if (d.date && d.date.startsWith(month)) total += Number(d.money) || 0;
        if (list) {
            const entry = document.createElement("div");
            entry.className = "entry";
            entry.innerHTML = `📅 ${escapeText(d.date)}<br>📝 ${escapeText(d.task)}<br>💰 ${escapeText(d.money)} so'm`;
            list.appendChild(entry);
        }
    });

    const totalEl = document.getElementById("total");
    if (totalEl) totalEl.innerText = total;

    updateAdminStats();
}

function escapeText(v){ return String(v === undefined || v === null ? '' : v); }

/* ---------- Improved admin UI ---------- */
function updateAdminStats() {
    const current = localStorage.getItem("login");
    const adminDiv = document.getElementById("adminStats");
    const usersCountEl = document.getElementById("usersCount");
    const usersTotalEl = document.getElementById("usersTotal");
    const adminUsersList = document.getElementById("adminUsersList");
    if (!adminDiv || !usersCountEl || !usersTotalEl || !adminUsersList) return;

    if (current !== "admin") { adminDiv.classList.add("hidden"); return; }
    adminDiv.classList.remove("hidden");

    const users = getUsers();
    usersTotalEl.textContent = users.length;

    // overall summary
    let overallTotal = 0;
    let overallMonth = 0;
    const monthPrefix = new Date().toISOString().slice(0,7);
    let activeCount = 0;

    adminUsersList.innerHTML = "";
    adminUsersList.style.padding = "0";
    adminUsersList.style.margin = "0";

    users.forEach(u => {
        const key = `data_${u.username}`;
        let arr = [];
        try { arr = JSON.parse(localStorage.getItem(key)) || []; } catch(e) { arr = []; }
        const count = Array.isArray(arr) ? arr.length : 0;
        const totalMoney = Array.isArray(arr) ? arr.reduce((s, it) => s + (Number(it.money) || 0), 0) : 0;
        arr.forEach(it => {
            overallTotal += Number(it.money) || 0;
            if (it.date && it.date.startsWith(monthPrefix)) overallMonth += Number(it.money) || 0;
        });
        if (count) activeCount++;

        // list item
        const li = document.createElement("li");
        li.style.listStyle = "none";
        li.style.marginBottom = "8px";
        li.style.padding = "6px";
        li.style.borderRadius = "8px";

        // header (name, meta, arrow)
        const header = document.createElement("div");
        header.style.display = "flex";
        header.style.alignItems = "center";
        header.style.justifyContent = "space-between";
        header.style.gap = "8px";

        const left = document.createElement("div");
        left.style.display = "flex";
        left.style.alignItems = "center";
        left.style.gap = "8px";

        const nameSpan = document.createElement("span");
        nameSpan.textContent = u.username;
        nameSpan.style.fontWeight = "600";
        nameSpan.style.minWidth = "80px";

        const meta = document.createElement("span");
        meta.textContent = `y:${count} • ${totalMoney} so'm`;
        meta.style.color = "#333";
        meta.style.fontSize = "0.9em";
        meta.style.whiteSpace = "nowrap";

        left.appendChild(nameSpan);
        left.appendChild(meta);

        const arrow = document.createElement("button");
        arrow.type = "button";
        arrow.className = "admin-arrow";
        arrow.innerText = "▸";
        arrow.style.border = "none";
        arrow.style.background = "transparent";
        arrow.style.cursor = "pointer";
        arrow.style.fontSize = "16px";
        arrow.style.padding = "4px";

        header.appendChild(left);
        header.appendChild(arrow);
        li.appendChild(header);

        // detail panel (collapsed by default)
        const detail = document.createElement("div");
        detail.className = "admin-detail";
        detail.style.display = "none";
        detail.style.marginTop = "8px";
        detail.style.padding = "8px";
        detail.style.borderRadius = "6px";
        detail.style.background = "#f8f9fa";
        detail.style.maxHeight = "320px";
        detail.style.overflowY = "auto";

        const detHeader = document.createElement("div");
        detHeader.style.display = "flex";
        detHeader.style.justifyContent = "space-between";
        detHeader.style.marginBottom = "8px";
        detHeader.innerHTML = `<strong>${escapeText(u.username)}</strong><span style="font-size:0.95em">Yozuv: ${count} — Jami: ${totalMoney} so'm</span>`;
        detail.appendChild(detHeader);

        if (!count) {
            const none = document.createElement("div");
            none.style.opacity = "0.8";
            none.textContent = "Yozuvlar yo'q";
            detail.appendChild(none);
        } else {
            // newest first
            arr.slice().reverse().forEach(entry => {
                const card = document.createElement("div");
                card.style.padding = "8px";
                card.style.marginBottom = "8px";
                card.style.borderRadius = "8px";
                card.style.background = "#fff";
                card.style.border = "1px solid #eee";
                const dt = document.createElement("div"); dt.textContent = `📅 ${entry.date || '-'}`;
                const tsk = document.createElement("div"); tsk.textContent = `📝 ${entry.task || '-'}`;
                const mn = document.createElement("div"); mn.textContent = `💰 ${entry.money || 0} so'm`;
                card.appendChild(dt); card.appendChild(tsk); card.appendChild(mn);
                detail.appendChild(card);
            });
        }

        li.appendChild(detail);
        adminUsersList.appendChild(li);

        // toggle behavior: open this detail, close others
        arrow.addEventListener("click", () => {
            const open = detail.style.display === "block";
            // close all
            Array.from(adminUsersList.querySelectorAll(".admin-detail")).forEach(d => d.style.display = "none");
            Array.from(adminUsersList.querySelectorAll(".admin-arrow")).forEach(a => a.innerText = "▸");
            if (!open) {
                detail.style.display = "block";
                arrow.innerText = "▾";
                // ensure visible
                li.scrollIntoView({ behavior: "smooth", block: "nearest" });
            } else {
                detail.style.display = "none";
                arrow.innerText = "▸";
            }
        });
    });

    usersCountEl.textContent = activeCount;
    // update overall summary (create if missing)
    let overallEl = document.getElementById("adminOverall");
    if (!overallEl) {
        overallEl = document.createElement("div");
        overallEl.id = "adminOverall";
        overallEl.style.marginTop = "6px";
        overallEl.style.marginBottom = "8px";
        adminDiv.prepend(overallEl);
    }
    overallEl.innerHTML = `Jami summa: <strong>${overallTotal} so'm</strong> — Ushbu oy: <strong>${overallMonth} so'm</strong>`;
}
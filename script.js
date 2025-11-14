const itemInput = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const shoppingList = document.getElementById("shoppingList");
const clearBtn = document.getElementById("clearBtn");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");
const syncStatusEl = document.getElementById("syncStatus");

// Items and Firebase reference
// Load items from localStorage by default so users keep their list when logged out
let items = JSON.parse(localStorage.getItem("shoppingItems")) || [];
let itemsCollectionRef = null;

// Render initial items (will show localStorage items if not signed in)
renderList();

// Sync status helper
function setSyncStatus(state, message) {
  if (!syncStatusEl) return;
  syncStatusEl.classList.remove("saving", "synced", "offline", "error");
  switch (state) {
    case "saving":
      syncStatusEl.textContent = message || "Saving...";
      syncStatusEl.classList.add("saving");
      break;
    case "synced":
      syncStatusEl.textContent = message || "Synced";
      syncStatusEl.classList.add("synced");
      break;
    case "offline":
      syncStatusEl.textContent = message || "Offline";
      syncStatusEl.classList.add("offline");
      break;
    case "error":
      syncStatusEl.textContent = message || "Error";
      syncStatusEl.classList.add("error");
      break;
    default:
      syncStatusEl.textContent = message || "—";
  }
}

window.addEventListener("online", () => setSyncStatus("synced"));
window.addEventListener("offline", () => setSyncStatus("offline"));

// Event listeners
addBtn.addEventListener("click", addItem);
itemInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    addItem();
  }
});
clearBtn.addEventListener("click", clearAll);

function addItem() {
  const itemText = itemInput.value.trim();

  if (itemText === "") {
    itemInput.focus();
    return;
  }

  const item = {
    id: Date.now(),
    text: itemText,
    completed: false,
  };

  items.push(item);
  saveItems();
  renderList();
  itemInput.value = "";
  itemInput.focus();
}

function deleteItem(id) {
  items = items.filter((item) => item.id !== id);
  saveItems();
  renderList();
}

function toggleComplete(id) {
  const item = items.find((item) => item.id === id);
  if (item) {
    item.completed = !item.completed;
    saveItems();
    renderList();
  }
}

function clearAll() {
  if (items.length === 0) return;

  if (confirm("Biztosan ki szeretnéd üríteni a teljes bevásárlólista? 🐧")) {
    items = [];
    saveItems();
    renderList();
  }
}

function renderList() {
  shoppingList.innerHTML = "";

  if (items.length === 0) {
    shoppingList.innerHTML =
      '<div class="empty-state">Még nincsenek tételek. Kezdj el hozzáadni! 🛒</div>';
    clearBtn.disabled = true;
    updateStats();
    return;
  }

  clearBtn.disabled = false;

  items.forEach((item) => {
    const li = document.createElement("li");
    li.className = item.completed ? "completed" : "";

    li.innerHTML = `
            <input 
                type="checkbox" 
                class="checkbox" 
                ${item.completed ? "checked" : ""}
                onchange="toggleComplete(${item.id})"
            >
            <span class="item-text">${escapeHtml(item.text)}</span>
            <button class="delete-btn" onclick="deleteItem(${
              item.id
            })">Törlés</button>
        `;

    shoppingList.appendChild(li);
  });

  updateStats();
}

function updateStats() {
  const total = items.length;
  const completed = items.filter((item) => item.completed).length;

  totalCount.textContent = total;
  completedCount.textContent = completed;
}

function saveItems() {
  // Indicate saving
  setSyncStatus("saving");

  if (window.currentUser && window.firebaseServices) {
    // Try to save to Firebase (async). saveToFirebase will update status on completion.
    saveToFirebase();
  } else {
    // Fallback to localStorage (synchronous)
    localStorage.setItem("shoppingItems", JSON.stringify(items));
    setSyncStatus("synced");
  }
}

async function saveToFirebase() {
  try {
    setSyncStatus("saving");
    const { db } = window.firebaseServices;
    const userListRef = db
      .collection("users")
      .doc(window.currentUser.uid)
      .collection("shoppingItems");

    // Clear existing items and add new ones
    const snapshot = await userListRef.get();

    // Delete items that no longer exist
    snapshot.forEach((doc) => {
      const itemExists = items.find((item) => item.id === parseInt(doc.id));
      if (!itemExists) {
        doc.ref.delete();
      }
    });

    // Add/update items
    for (const item of items) {
      await userListRef.doc(item.id.toString()).set({
        text: item.text,
        completed: item.completed,
        timestamp: new Date(),
      });
    }
    // Successfully saved
    setSyncStatus("synced");
  } catch (error) {
    console.error("Hiba a Firebase-be való mentéskor:", error);
    // Fallback to localStorage
    localStorage.setItem("shoppingItems", JSON.stringify(items));
    setSyncStatus("error", "Save failed — saved locally");
  }
}

// Load shopping list from Firebase
window.loadUserShoppingList = async function () {
  try {
    const { db } = window.firebaseServices;
    const userListRef = db
      .collection("users")
      .doc(window.currentUser.uid)
      .collection("shoppingItems");

    const snapshot = await userListRef.orderBy("timestamp", "asc").get();
    items = [];

    snapshot.forEach((doc) => {
      items.push({
        id: parseInt(doc.id),
        text: doc.data().text,
        completed: doc.data().completed,
      });
    });

    renderList();
    // initial load complete
    setSyncStatus("synced");

    // Set up real-time listener
    userListRef.orderBy("timestamp", "asc").onSnapshot((snapshot) => {
      items = [];
      snapshot.forEach((doc) => {
        items.push({
          id: parseInt(doc.id),
          text: doc.data().text,
          completed: doc.data().completed,
        });
      });
      renderList();
      setSyncStatus("synced");
    });
  } catch (error) {
    console.error("Hiba a Firebase-ből való betöltéskor:", error);
    // Load from localStorage as fallback
    items = JSON.parse(localStorage.getItem("shoppingItems")) || [];
    renderList();
    setSyncStatus("error", "Load failed — showing local list");
  }
};

// Clear shopping list UI for logged out users
window.clearShoppingListUI = function () {
  // When user logs out, restore (or keep) items from localStorage so they don't disappear
  items = JSON.parse(localStorage.getItem("shoppingItems")) || [];
  renderList();
};

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Sync status helper (updates the small UI indicator)
function setSyncStatus(state, message) {
  // In the root script (non-public) the element may or may not exist
  const el = document.getElementById('syncStatus');
  if (!el) return;

  el.className = 'sync-status';

  if (state === 'saving') {
    el.textContent = 'Mentés...';
    el.classList.add('saving');
  } else if (state === 'synced') {
    el.textContent = 'Szinkronban';
    el.classList.add('synced');
  } else if (state === 'offline') {
    el.textContent = 'Offline';
    el.classList.add('offline');
  } else if (state === 'error') {
    el.textContent = message || 'Hiba';
    el.classList.add('error');
  } else {
    el.textContent = state;
  }
}

// Update status when network changes
window.addEventListener('online', () => setSyncStatus('synced'));
window.addEventListener('offline', () => setSyncStatus('offline'));

// Initialize status
(function initSyncStatus() {
  if (navigator.onLine) setSyncStatus('synced');
  else setSyncStatus('offline');
})();

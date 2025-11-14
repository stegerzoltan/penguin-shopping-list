const itemInput = document.getElementById("itemInput");
const addBtn = document.getElementById("addBtn");
const shoppingList = document.getElementById("shoppingList");
const clearBtn = document.getElementById("clearBtn");
const totalCount = document.getElementById("totalCount");
const completedCount = document.getElementById("completedCount");

// Items and Firebase reference
let items = [];
let itemsCollectionRef = null;

// Render initial items (fallback to localStorage)
renderList();

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

  if (confirm("Are you sure you want to clear your entire shopping list? 🐧")) {
    items = [];
    saveItems();
    renderList();
  }
}

function renderList() {
  shoppingList.innerHTML = "";

  if (items.length === 0) {
    shoppingList.innerHTML =
      '<div class="empty-state">No items yet. Start adding! 🛒</div>';
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
            })">Delete</button>
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
  // Save to Firebase if user is logged in
  if (window.currentUser && itemsCollectionRef) {
    saveToFirebase();
  } else {
    // Fallback to localStorage
    localStorage.setItem("shoppingItems", JSON.stringify(items));
  }
}

async function saveToFirebase() {
  try {
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
  } catch (error) {
    console.error("Error saving to Firebase:", error);
    // Fallback to localStorage
    localStorage.setItem("shoppingItems", JSON.stringify(items));
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
    });
  } catch (error) {
    console.error("Error loading shopping list:", error);
    // Load from localStorage as fallback
    items = JSON.parse(localStorage.getItem("shoppingItems")) || [];
    renderList();
  }
};

// Clear shopping list UI for logged out users
window.clearShoppingListUI = function () {
  items = [];
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

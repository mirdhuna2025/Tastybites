// script.js - Single Admin Login, Image URLs, ₹ Rupees, Popup Cart

// DATABASE STRUCTURE
let database = {
    restaurants: [
        {
            id: 1,
            name: "Pizza Palace",
            password: "palace", // Admin password for this restaurant
            menuItems: [
                { id: 1, name: "Margherita Pizza", price: 349, image: "https://via.placeholder.com/300x200?text=Margherita+Pizza" },
                { id: 2, name: "Pepperoni Pizza", price: 429, image: "https://via.placeholder.com/300x200?text=Pepperoni+Pizza" },
                { id: 3, name: "Veggie Supreme", price: 459, image: "https://via.placeholder.com/300x200?text=Veggie+Supreme" }
            ]
        },
        {
            id: 2,
            name: "Burger Barn",
            password: "barn",
            menuItems: [
                { id: 4, name: "Classic Cheeseburger", price: 259, image: "https://via.placeholder.com/300x200?text=Cheeseburger" },
                { id: 5, name: "Bacon Avocado Burger", price: 349, image: "https://via.placeholder.com/300x200?text=Bacon+Avocado" },
                { id: 6, name: "Double Cheeseburger", price: 379, image: "https://via.placeholder.com/300x200?text=Double+Cheese" }
            ]
        },
        {
            id: 3,
            name: "Sushi Spot",
            password: "spot",
            menuItems: [
                { id: 7, name: "California Roll", price: 299, image: "https://via.placeholder.com/300x200?text=California+Roll" },
                { id: 8, name: "Spicy Tuna Roll", price: 379, image: "https://via.placeholder.com/300x200?text=Spicy+Tuna" },
                { id: 9, name: "Dragon Roll", price: 499, image: "https://via.placeholder.com/300x200?text=Dragon+Roll" }
            ]
        }
    ]
};

// CART STATE
let cart = [];
let currentRestaurant = null;
let currentAdminRestaurant = null;
let loggedInAdmin = false;

// DOM ELEMENTS
const restaurantsContainer = document.getElementById('restaurantsContainer');
const menuContainer = document.getElementById('menuContainer');
const currentRestaurantName = document.getElementById('currentRestaurantName');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const cartBtn = document.getElementById('cartBtn');
const cartCount = document.getElementById('cartCount');
const cartModal = document.getElementById('cartModal');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');
const checkoutBtn = document.getElementById('checkoutBtn');
const checkoutModal = document.getElementById('checkoutModal');
const checkoutForm = document.getElementById('checkoutForm');
const orderItemsSummary = document.getElementById('orderItemsSummary');
const orderTotal = document.getElementById('orderTotal');
const orderConfirmModal = document.getElementById('orderConfirmModal');
const orderNumber = document.getElementById('orderNumber');
const closeConfirmBtn = document.getElementById('closeConfirmBtn');
const adminLoginModal = document.getElementById('adminLoginModal');
const adminDashboard = document.getElementById('adminDashboard');
const adminRestaurantName = document.getElementById('adminRestaurantName');
const logoutBtn = document.getElementById('logoutBtn');
const adminLoginBtn = document.getElementById('adminLoginBtn');

// INITIALIZE APP
document.addEventListener('DOMContentLoaded', function() {
    loadRestaurants();
    setupEventListeners();
    loadCartFromStorage();
    updateCartUI();
});

// LOAD RESTAURANTS
function loadRestaurants() {
    restaurantsContainer.innerHTML = '';
    
    database.restaurants.forEach(restaurant => {
        const restaurantCard = document.createElement('div');
        restaurantCard.className = 'restaurant-card';
        restaurantCard.innerHTML = `
            <img src="https://via.placeholder.com/300x200?text=${encodeURIComponent(restaurant.name)}" alt="${restaurant.name}">
            <h3>${restaurant.name}</h3>
            <p>${restaurant.menuItems.length} items available</p>
            <button class="view-menu-btn" data-id="${restaurant.id}">View Menu</button>
        `;
        restaurantsContainer.appendChild(restaurantCard);
    });
    
    // Add event listeners
    document.querySelectorAll('.view-menu-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const restaurantId = parseInt(this.getAttribute('data-id'));
            showRestaurantMenu(restaurantId);
        });
    });
}

// SHOW RESTAURANT MENU
function showRestaurantMenu(restaurantId) {
    const restaurant = database.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;
    
    currentRestaurant = restaurant;
    currentRestaurantName.textContent = restaurant.name;
    menuContainer.innerHTML = '';
    
    restaurant.menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price.toFixed(2)}</p>
                <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">➕ Add to Cart</button>
            </div>
        `;
        menuContainer.appendChild(menuItem);
    });
    
    // Add to cart event listeners
    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const item = {
                id: parseInt(this.getAttribute('data-id')),
                name: this.getAttribute('data-name'),
                price: parseFloat(this.getAttribute('data-price')),
                image: this.getAttribute('data-image'),
                quantity: 1
            };
            addToCart(item);
        });
    });
    
    // Scroll to menu
    document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
}

// SETUP EVENT LISTENERS
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', filterMenuItems);
    searchBtn.addEventListener('click', filterMenuItems);
    
    // Cart button
    cartBtn.addEventListener('click', function() {
        showCartModal();
    });
    
    // Global Admin Login button
    adminLoginBtn.addEventListener('click', function() {
        adminLoginModal.style.display = 'flex';
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', function() {
            this.closest('.modal').style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    });
    
    // Checkout button
    checkoutBtn.addEventListener('click', function() {
        if (cart.length === 0) {
            alert('Please add some items to cart first!');
            return;
        }
        cartModal.style.display = 'none';
        showCheckoutModal();
    });
    
    // Checkout form
    checkoutForm.addEventListener('submit', function(e) {
        e.preventDefault();
        placeOrder();
    });
    
    // Close confirmation
    closeConfirmBtn.addEventListener('click', function() {
        orderConfirmModal.style.display = 'none';
        clearCart();
    });
    
    // Admin login form (SINGLE GLOBAL LOGIN)
    document.getElementById('adminLoginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const restaurantId = parseInt(document.getElementById('restaurantId').value);
        const password = document.getElementById('adminPassword').value;
        
        const restaurant = database.restaurants.find(r => r.id === restaurantId);
        
        if (!restaurant) {
            alert('Invalid Restaurant ID');
            return;
        }
        
        if (restaurant.password !== password) {
            alert('Incorrect password for this restaurant');
            return;
        }
        
        // Login successful
        loggedInAdmin = true;
        currentAdminRestaurant = restaurant;
        adminLoginModal.style.display = 'none';
        showAdminDashboard(restaurant);
    });
    
    // Logout button
    logoutBtn.addEventListener('click', function() {
        loggedInAdmin = false;
        adminDashboard.style.display = 'none';
        currentAdminRestaurant = null;
    });
    
    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove active class from all tabs
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            const tabId = this.getAttribute('data-tab');
            document.getElementById(tabId + 'Tab').classList.add('active');
            
            // Refresh data if needed
            if (tabId === 'view') {
                loadAdminMenu();
            } else if (tabId === 'edit') {
                populateEditDropdown();
            }
        });
    });
    
    // Add item form
    document.getElementById('addItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        addMenuItem();
    });
    
    // Edit item select
    document.getElementById('editItemSelect').addEventListener('change', function() {
        const itemId = this.value;
        if (itemId) {
            showEditForm(itemId);
        } else {
            document.getElementById('editItemForm').style.display = 'none';
        }
    });
    
    // Edit item form
    document.getElementById('editItemForm').addEventListener('submit', function(e) {
        e.preventDefault();
        updateMenuItem();
    });
    
    // Delete item button
    document.getElementById('deleteItemBtn').addEventListener('click', function() {
        deleteMenuItem();
    });
}

// FILTER MENU ITEMS
function filterMenuItems() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (!currentRestaurant) {
        // Search across all restaurants
        menuContainer.innerHTML = '';
        
        let foundItems = [];
        database.restaurants.forEach(restaurant => {
            const matchingItems = restaurant.menuItems.filter(item => 
                item.name.toLowerCase().includes(searchTerm)
            );
            
            if (matchingItems.length > 0) {
                foundItems.push({
                    restaurantName: restaurant.name,
                    items: matchingItems
                });
            }
        });
        
        if (foundItems.length === 0 && searchTerm) {
            menuContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.2rem;">No dishes found!</p>';
            return;
        }
        
        foundItems.forEach(group => {
            const restaurantHeader = document.createElement('div');
            restaurantHeader.innerHTML = `<h3 style="grid-column: 1/-1; margin: 20px 0 15px; color: #e65100; font-size: 1.4rem; text-align: center;">${group.restaurantName}</h3>`;
            menuContainer.appendChild(restaurantHeader);
            
            group.items.forEach(item => {
                const menuItem = document.createElement('div');
                menuItem.className = 'menu-item';
                menuItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}">
                    <div class="menu-item-content">
                        <h3>${item.name}</h3>
                        <p class="price">₹${item.price.toFixed(2)}</p>
                        <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">➕ Add to Cart</button>
                    </div>
                `;
                menuContainer.appendChild(menuItem);
            });
        });
        
        // Re-attach event listeners
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = {
                    id: parseInt(this.getAttribute('data-id')),
                    name: this.getAttribute('data-name'),
                    price: parseFloat(this.getAttribute('data-price')),
                    image: this.getAttribute('data-image'),
                    quantity: 1
                };
                addToCart(item);
            });
        });
    } else {
        // Filter within current restaurant
        menuContainer.innerHTML = '';
        
        const filteredItems = currentRestaurant.menuItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm)
        );
        
        if (filteredItems.length === 0 && searchTerm) {
            menuContainer.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 40px; font-size: 1.2rem;">No dishes found!</p>';
            return;
        }
        
        filteredItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.className = 'menu-item';
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div class="menu-item-content">
                    <h3>${item.name}</h3>
                    <p class="price">₹${item.price.toFixed(2)}</p>
                    <button class="add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image}">➕ Add to Cart</button>
                </div>
            `;
            menuContainer.appendChild(menuItem);
        });
        
        // Re-attach event listeners
        document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const item = {
                    id: parseInt(this.getAttribute('data-id')),
                    name: this.getAttribute('data-name'),
                    price: parseFloat(this.getAttribute('data-price')),
                    image: this.getAttribute('data-image'),
                    quantity: 1
                };
                addToCart(item);
            });
        });
    }
}

// CART FUNCTIONALITY
function addToCart(item) {
    // Check if item already exists in cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...item}); // Add new item
    }
    
    saveCartToStorage();
    updateCartUI();
    showNotification(`${item.name} added to cart!`);
}

function updateCartUI() {
    // Update cart count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;
    
    // Update cart modal content
    renderCartItems();
    
    // Update cart total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = `₹${total.toFixed(2)}`;
}

function renderCartItems() {
    cartItems.innerHTML = '';
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; padding: 30px; color: #666;">Your cart is empty!</p>';
        return;
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.name}</h4>
                <p class="cart-item-price">₹${item.price.toFixed(2)}</p>
                <div class="cart-item-quantity">
                    <button class="quantity-btn decrease" data-id="${item.id}">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn increase" data-id="${item.id}">+</button>
                </div>
            </div>
            <button class="remove-item" data-id="${item.id}">🗑️</button>
        `;
        cartItems.appendChild(cartItem);
    });
    
    // Add event listeners for quantity buttons
    document.querySelectorAll('.decrease').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            decreaseQuantity(id);
        });
    });
    
    document.querySelectorAll('.increase').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            increaseQuantity(id);
        });
    });
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            removeFromCart(id);
        });
    });
}

function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            removeFromCart(id);
            return;
        }
        saveCartToStorage();
        updateCartUI();
    }
}

function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        saveCartToStorage();
        updateCartUI();
    }
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCartToStorage();
    updateCartUI();
    showNotification('Item removed from cart!');
}

function saveCartToStorage() {
    localStorage.setItem('tastybitesCart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const savedCart = localStorage.getItem('tastybitesCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
}

function clearCart() {
    cart = [];
    saveCartToStorage();
    updateCartUI();
}

// MODAL FUNCTIONS
function showCartModal() {
    updateCartUI();
    cartModal.style.display = 'flex';
}

function showCheckoutModal() {
    // Populate order summary
    orderItemsSummary.innerHTML = '';
    
    cart.forEach(item => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <span>${item.name} x${item.quantity}</span>
            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
        `;
        orderItemsSummary.appendChild(orderItem);
    });
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `₹${total.toFixed(2)}`;
    
    checkoutModal.style.display = 'flex';
}

function placeOrder() {
    // Generate random order number
    const orderNum = 'TB' + Math.floor(100000 + Math.random() * 900000);
    orderNumber.textContent = orderNum;
    
    // In a real app, you would send this data to a server
    console.log('Order placed:', {
        orderNumber: orderNum,
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        customerAddress: document.getElementById('customerAddress').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    });
    
    // Show confirmation
    checkoutModal.style.display = 'none';
    orderConfirmModal.style.display = 'flex';
    
    // Clear form
    checkoutForm.reset();
}

// NOTIFICATION FUNCTION
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = '#4caf50';
    notification.style.color = 'white';
    notification.style.padding = '15px 25px';
    notification.style.borderRadius = '8px';
    notification.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
    notification.style.zIndex = '3000';
    notification.style.fontSize = '1rem';
    notification.style.fontWeight = '500';
    notification.style.animation = 'slideIn 0.3s ease-out, fadeOut 0.5s ease-out 2.5s forwards';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Remove after animation
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// Add CSS animation for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
`;
document.head.appendChild(style);

// ADMIN FUNCTIONS
function showAdminDashboard(restaurant) {
    if (!restaurant) return;
    
    adminRestaurantName.textContent = restaurant.name;
    adminDashboard.style.display = 'block';
    
    // Load the view menu tab by default
    loadAdminMenu();
    populateEditDropdown();
}

function loadAdminMenu() {
    const adminMenuContainer = document.getElementById('adminMenuContainer');
    adminMenuContainer.innerHTML = '';
    
    currentAdminRestaurant.menuItems.forEach(item => {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-content">
                <h3>${item.name}</h3>
                <p class="price">₹${item.price.toFixed(2)}</p>
            </div>
        `;
        adminMenuContainer.appendChild(menuItem);
    });
}

function populateEditDropdown() {
    const select = document.getElementById('editItemSelect');
    select.innerHTML = '<option value="">Select item to edit</option>';
    
    currentAdminRestaurant.menuItems.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        option.textContent = item.name;
        select.appendChild(option);
    });
}

function showEditForm(itemId) {
    const item = currentAdminRestaurant.menuItems.find(i => i.id == itemId);
    if (!item) return;
    
    document.getElementById('editItemName').value = item.name;
    document.getElementById('editItemPrice').value = item.price;
    document.getElementById('editItemImage').value = item.image;
    document.getElementById('editItemForm').style.display = 'flex';
}

function addMenuItem() {
    const name = document.getElementById('newItemName').value;
    const price = parseFloat(document.getElementById('newItemPrice').value);
    const imageUrl = document.getElementById('newItemImage').value || "https://via.placeholder.com/300x200?text=" + encodeURIComponent(name);
    
    if (!name || isNaN(price)) {
        alert('Please fill in all required fields!');
        return;
    }
    
    // Generate new ID
    const newId = Math.max(...currentAdminRestaurant.menuItems.map(item => item.id), 0) + 1;
    
    const newItem = {
        id: newId,
        name: name,
        price: price,
        image: imageUrl
    };
    
    currentAdminRestaurant.menuItems.push(newItem);
    
    // Reset form
    document.getElementById('newItemName').value = '';
    document.getElementById('newItemPrice').value = '';
    document.getElementById('newItemImage').value = '';
    
    // Show notification
    showNotification('New item added successfully!');
    
    // Update UI
    loadAdminMenu();
    populateEditDropdown();
    
    // If viewing this restaurant, update menu
    if (currentRestaurant && currentRestaurant.id === currentAdminRestaurant.id) {
        showRestaurantMenu(currentRestaurant.id);
    }
}

function updateMenuItem() {
    const itemId = document.getElementById('editItemSelect').value;
    const name = document.getElementById('editItemName').value;
    const price = parseFloat(document.getElementById('editItemPrice').value);
    const imageUrl = document.getElementById('editItemImage').value;
    
    if (!itemId || !name || isNaN(price)) {
        alert('Please fill in all required fields!');
        return;
    }
    
    const itemIndex = currentAdminRestaurant.menuItems.findIndex(i => i.id == itemId);
    if (itemIndex === -1) return;
    
    currentAdminRestaurant.menuItems[itemIndex].name = name;
    currentAdminRestaurant.menuItems[itemIndex].price = price;
    if (imageUrl) {
        currentAdminRestaurant.menuItems[itemIndex].image = imageUrl;
    }
    
    showNotification('Item updated successfully!');
    loadAdminMenu();
    populateEditDropdown();
    
    // If viewing this restaurant, update menu
    if (currentRestaurant && currentRestaurant.id === currentAdminRestaurant.id) {
        showRestaurantMenu(currentRestaurant.id);
    }
}

function deleteMenuItem() {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    const itemId = document.getElementById('editItemSelect').value;
    const itemIndex = currentAdminRestaurant.menuItems.findIndex(i => i.id == itemId);
    
    if (itemIndex === -1) return;
    
    currentAdminRestaurant.menuItems.splice(itemIndex, 1);
    
    showNotification('Item deleted successfully!');
    document.getElementById('editItemSelect').value = '';
    document.getElementById('editItemForm').style.display = 'none';
    loadAdminMenu();
    populateEditDropdown();
    
    // If viewing this restaurant, update menu
    if (currentRestaurant && currentRestaurant.id === currentAdminRestaurant.id) {
        showRestaurantMenu(currentRestaurant.id);
    }
}

// DATABASE SCHEMA FOR FUTURE INTEGRATION
/*
For MySQL:
CREATE TABLE restaurants (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL  -- In real app, store hashed passwords
);

CREATE TABLE menu_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    restaurant_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

For Firebase/Supabase:
Collection/Table: restaurants
- id (string/uuid)
- name (string)
- password (string) -- hashed in production

Collection/Table: menu_items
- id (string/uuid)
- restaurant_id (string/reference)
- name (string)
- price (number)
- image_url (string)
*/

// admin.js - Main Admin Page (Super Admin)

// Load database from localStorage or use default
let database = {
    restaurants: [
        {
            id: 1,
            name: "Pizza Palace",
            password: "palace",
            imageUrl: "https://via.placeholder.com/300x200?text=Pizza+Palace",
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
            imageUrl: "https://via.placeholder.com/300x200?text=Burger+Barn",
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
            imageUrl: "https://via.placeholder.com/300x200?text=Sushi+Spot",
            menuItems: [
                { id: 7, name: "California Roll", price: 299, image: "https://via.placeholder.com/300x200?text=California+Roll" },
                { id: 8, name: "Spicy Tuna Roll", price: 379, image: "https://via.placeholder.com/300x200?text=Spicy+Tuna" },
                { id: 9, name: "Dragon Roll", price: 499, image: "https://via.placeholder.com/300x200?text=Dragon+Roll" }
            ]
        }
    ]
};

// Load from localStorage if available
if (localStorage.getItem('tastybitesDatabase')) {
    database = JSON.parse(localStorage.getItem('tastybitesDatabase'));
}

// DOM Elements
const adminRestaurantsContainer = document.getElementById('adminRestaurantsContainer');
const showAddRestaurantForm = document.getElementById('showAddRestaurantForm');
const addRestaurantForm = document.getElementById('addRestaurantForm');
const newRestaurantForm = document.getElementById('newRestaurantForm');
const cancelAddRestaurant = document.getElementById('cancelAddRestaurant');
const editRestaurantForm = document.getElementById('editRestaurantForm');
const updateRestaurantForm = document.getElementById('updateRestaurantForm');
const cancelEditRestaurant = document.getElementById('cancelEditRestaurant');
const refreshData = document.getElementById('refreshData');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadAdminRestaurants();
    setupAdminEventListeners();
});

// Setup Event Listeners
function setupAdminEventListeners() {
    // Show Add Restaurant Form
    showAddRestaurantForm.addEventListener('click', function() {
        addRestaurantForm.style.display = 'block';
    });
    
    // Cancel Add Restaurant
    cancelAddRestaurant.addEventListener('click', function() {
        addRestaurantForm.style.display = 'none';
        newRestaurantForm.reset();
    });
    
    // Add New Restaurant
    newRestaurantForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('newRestaurantName').value;
        const password = document.getElementById('newRestaurantPassword').value;
        const imageUrl = document.getElementById('newRestaurantImageUrl').value || "https://via.placeholder.com/300x200?text=" + encodeURIComponent(name);
        
        if (!name || !password) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // Generate new ID
        const newId = Math.max(...database.restaurants.map(r => r.id), 0) + 1;
        
        // Create new restaurant
        const newRestaurant = {
            id: newId,
            name: name,
            password: password,
            imageUrl: imageUrl,
            menuItems: []
        };
        
        // Add to database
        database.restaurants.push(newRestaurant);
        
        // Save to localStorage
        saveDatabase();
        
        // Reset form
        newRestaurantForm.reset();
        addRestaurantForm.style.display = 'none';
        
        // Refresh display
        loadAdminRestaurants();
        
        alert('Restaurant added successfully!');
    });
    
    // Cancel Edit Restaurant
    cancelEditRestaurant.addEventListener('click', function() {
        editRestaurantForm.style.display = 'none';
        updateRestaurantForm.reset();
    });
    
    // Update Restaurant
    updateRestaurantForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const id = parseInt(document.getElementById('editRestaurantId').value);
        const name = document.getElementById('editRestaurantName').value;
        const password = document.getElementById('editRestaurantPassword').value;
        const imageUrl = document.getElementById('editRestaurantImageUrl').value;
        
        if (!name || !password) {
            alert('Please fill in all required fields!');
            return;
        }
        
        // Find restaurant
        const restaurantIndex = database.restaurants.findIndex(r => r.id === id);
        if (restaurantIndex === -1) {
            alert('Restaurant not found!');
            return;
        }
        
        // Update restaurant
        database.restaurants[restaurantIndex].name = name;
        database.restaurants[restaurantIndex].password = password;
        if (imageUrl) {
            database.restaurants[restaurantIndex].imageUrl = imageUrl;
        }
        
        // Save to localStorage
        saveDatabase();
        
        // Reset form
        updateRestaurantForm.reset();
        editRestaurantForm.style.display = 'none';
        
        // Refresh display
        loadAdminRestaurants();
        
        alert('Restaurant updated successfully!');
    });
    
    // Refresh Data
    refreshData.addEventListener('click', function() {
        if (localStorage.getItem('tastybitesDatabase')) {
            database = JSON.parse(localStorage.getItem('tastybitesDatabase'));
            loadAdminRestaurants();
            alert('Data refreshed from localStorage!');
        } else {
            alert('No saved data found in localStorage.');
        }
    });
}

// Load Restaurants for Admin View
function loadAdminRestaurants() {
    adminRestaurantsContainer.innerHTML = '';
    
    database.restaurants.forEach(restaurant => {
        const restaurantDiv = document.createElement('div');
        restaurantDiv.className = 'restaurant-card admin';
        
        let menuItemsHtml = '';
        if (restaurant.menuItems.length > 0) {
            menuItemsHtml = restaurant.menuItems.map(item => `
                <div class="menu-item admin">
                    <div>
                        <strong>${item.name}</strong> - ₹${item.price.toFixed(2)}
                    </div>
                    <div class="item-actions">
                        <button class="edit-item-btn" data-restaurant-id="${restaurant.id}" data-item-id="${item.id}">Edit</button>
                        <button class="delete-item-btn" data-restaurant-id="${restaurant.id}" data-item-id="${item.id}">Delete</button>
                    </div>
                </div>
            `).join('');
        } else {
            menuItemsHtml = '<p>No menu items yet.</p>';
        }
        
        restaurantDiv.innerHTML = `
            <div class="restaurant-header">
                <div>
                    <h3>${restaurant.name}</h3>
                    <p>ID: ${restaurant.id} | Password: ${restaurant.password}</p>
                    <p><img src="${restaurant.imageUrl}" alt="${restaurant.name}" style="max-width: 100px; height: auto; border-radius: 5px;"></p>
                </div>
                <div class="restaurant-actions">
                    <button class="edit-restaurant-btn" data-id="${restaurant.id}">Edit Restaurant</button>
                    <button class="delete-restaurant-btn" data-id="${restaurant.id}">Delete Restaurant</button>
                    <button class="add-item-btn" data-id="${restaurant.id}">➕ Add Item</button>
                </div>
            </div>
            <div class="menu-items-section">
                <h4>Menu Items (${restaurant.menuItems.length})</h4>
                ${menuItemsHtml}
            </div>
        `;
        
        adminRestaurantsContainer.appendChild(restaurantDiv);
    });
    
    // Add event listeners for restaurant actions
    document.querySelectorAll('.edit-restaurant-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            editRestaurant(id);
        });
    });
    
    document.querySelectorAll('.delete-restaurant-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            deleteRestaurant(id);
        });
    });
    
    document.querySelectorAll('.add-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = parseInt(this.getAttribute('data-id'));
            addItemToRestaurant(id);
        });
    });
    
    // Add event listeners for item actions
    document.querySelectorAll('.edit-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const restaurantId = parseInt(this.getAttribute('data-restaurant-id'));
            const itemId = parseInt(this.getAttribute('data-item-id'));
            editMenuItem(restaurantId, itemId);
        });
    });
    
    document.querySelectorAll('.delete-item-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const restaurantId = parseInt(this.getAttribute('data-restaurant-id'));
            const itemId = parseInt(this.getAttribute('data-item-id'));
            deleteMenuItem(restaurantId, itemId);
        });
    });
}

// Edit Restaurant
function editRestaurant(id) {
    const restaurant = database.restaurants.find(r => r.id === id);
    if (!restaurant) return;
    
    // Populate form
    document.getElementById('editRestaurantId').value = restaurant.id;
    document.getElementById('editRestaurantName').value = restaurant.name;
    document.getElementById('editRestaurantPassword').value = restaurant.password;
    document.getElementById('editRestaurantImageUrl').value = restaurant.imageUrl;
    
    // Show form
    editRestaurantForm.style.display = 'block';
}

// Delete Restaurant
function deleteRestaurant(id) {
    if (!confirm('Are you sure you want to delete this restaurant and all its menu items?')) {
        return;
    }
    
    // Remove restaurant
    database.restaurants = database.restaurants.filter(r => r.id !== id);
    
    // Save to localStorage
    saveDatabase();
    
    // Refresh display
    loadAdminRestaurants();
    
    alert('Restaurant deleted successfully!');
}

// Add Item to Restaurant
function addItemToRestaurant(restaurantId) {
    const restaurant = database.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;
    
    // Create prompt-like form
    const itemName = prompt('Enter item name:');
    if (!itemName) return;
    
    const itemPriceStr = prompt('Enter item price (₹):');
    const itemPrice = parseFloat(itemPriceStr);
    if (isNaN(itemPrice)) {
        alert('Invalid price!');
        return;
    }
    
    const itemImageUrl = prompt('Enter image URL (optional):') || "https://via.placeholder.com/300x200?text=" + encodeURIComponent(itemName);
    
    // Generate new ID
    const newId = Math.max(...restaurant.menuItems.map(item => item.id), 0) + 1;
    
    // Create new item
    const newItem = {
        id: newId,
        name: itemName,
        price: itemPrice,
        image: itemImageUrl
    };
    
    // Add to restaurant
    restaurant.menuItems.push(newItem);
    
    // Save to localStorage
    saveDatabase();
    
    // Refresh display
    loadAdminRestaurants();
    
    alert('Item added successfully!');
}

// Edit Menu Item
function editMenuItem(restaurantId, itemId) {
    const restaurant = database.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;
    
    const item = restaurant.menuItems.find(i => i.id === itemId);
    if (!item) return;
    
    // Create prompt-like form
    const itemName = prompt('Edit item name:', item.name);
    if (itemName === null) return; // Cancelled
    
    const itemPriceStr = prompt('Edit item price (₹):', item.price);
    const itemPrice = parseFloat(itemPriceStr);
    if (isNaN(itemPrice)) {
        alert('Invalid price!');
        return;
    }
    
    const itemImageUrl = prompt('Edit image URL (optional):', item.image);
    
    // Update item
    item.name = itemName;
    item.price = itemPrice;
    if (itemImageUrl) {
        item.image = itemImageUrl;
    }
    
    // Save to localStorage
    saveDatabase();
    
    // Refresh display
    loadAdminRestaurants();
    
    alert('Item updated successfully!');
}

// Delete Menu Item
function deleteMenuItem(restaurantId, itemId) {
    if (!confirm('Are you sure you want to delete this item?')) {
        return;
    }
    
    const restaurant = database.restaurants.find(r => r.id === restaurantId);
    if (!restaurant) return;
    
    // Remove item
    restaurant.menuItems = restaurant.menuItems.filter(i => i.id !== itemId);
    
    // Save to localStorage
    saveDatabase();
    
    // Refresh display
    loadAdminRestaurants();
    
    alert('Item deleted successfully!');
}

// Save Database to localStorage
function saveDatabase() {
    localStorage.setItem('tastybitesDatabase', JSON.stringify(database));
}

// Show notification
function showNotification(message) {
    alert(message); // Simple alert for admin page
}

// --- DATA STORE ---
// បញ្ចូលរូបភាពគំរូ (Placeholder Images) សម្រាប់អាវទាំង ៣
// អ្នកអាចជំនួស URL ទាំងនេះដោយរូបភាពពិតរបស់អ្នក។
let products = [
    { 
        id: 1, 
        title: "អាវយឺតអង្គរវត្ត", 
        price: 15.00, 
        category: "angkor", 
        stock: 10, 
        image: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=500&fit=crop&crop=center&q=80" 
    },
    { 
        id: 2, 
        title: "អាវយឺតខ្មែរបុរាណ", 
        price: 18.00, 
        category: "traditional", 
        stock: 5, 
        image: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=500&fit=crop&crop=center&q=80" 
    },
    { 
        id: 3, 
        title: "អាវយឺត Minimalist", 
        price: 12.00, 
        category: "minimalist", 
        stock: 20, 
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=500&fit=crop&crop=center&q=80" 
    }
];

let cart = [];
let currentUser = null;
let selectedProduct = null;
let selectedSize = null;
let isEditingProfile = false;

// Chat State
let hasPurchased = false;
let chatMessages = [];

// --- DOM ELEMENTS ---
const loginModal = document.getElementById('login-modal');
const adminModal = document.getElementById('admin-modal');
const productModal = document.getElementById('product-modal');

const emptyState = document.getElementById('empty-state');
const productGrid = document.getElementById('product-grid');
const productCount = document.getElementById('product-count');
const passwordInput = document.getElementById('admin-password');
const loginError = document.getElementById('login-error');
const cartBadge = document.getElementById('cart-badge');

const SECRET_PASSWORD = "201404";

// --- PAGE NAVIGATION ---
function showPage(pageId) {
    document.querySelectorAll('.page-section').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById('page-' + pageId).classList.add('active');

    // Update Desktop Nav
    document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
    if (pageId === 'store') document.getElementById('nav-home').classList.add('active');
    if (pageId === 'about') document.getElementById('nav-about').classList.add('active');
    if (pageId === 'pricing') document.getElementById('nav-pricing').classList.add('active');

    // Update Bottom Nav (Mobile)
    document.querySelectorAll('.bottom-nav a').forEach(a => a.classList.remove('active'));
    if (pageId === 'store') document.getElementById('bottom-nav-home').classList.add('active');
    if (pageId === 'about') document.getElementById('bottom-nav-about').classList.add('active');
    if (pageId === 'pricing') document.getElementById('bottom-nav-pricing').classList.add('active');

    // Render specific pages when navigated to
    if (pageId === 'account') renderAccountPage();
    if (pageId === 'cart') renderCartPage();
    if (pageId === 'chat') renderChatPage();

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// --- CATEGORY FILTERING ---
function filterCategory(category, element) {
    document.querySelectorAll('.pill').forEach(pill => pill.classList.remove('active'));
    element.classList.add('active');

    if (category === 'all') {
        renderProducts(products);
    } else {
        const filtered = products.filter(p => p.category === category);
        renderProducts(filtered);
    }
}

// --- RENDER PRODUCTS ---
function renderProducts(itemsToRender) {
    if (itemsToRender.length === 0) {
        emptyState.style.display = 'block';
        productGrid.style.display = 'none';
        productCount.innerText = '0 ITEMS';
        return;
    }

    emptyState.style.display = 'none';
    productGrid.style.display = 'grid';
    productCount.innerText = `${itemsToRender.length} ITEM${itemsToRender.length > 1 ? 'S' : ''}`;

    productGrid.innerHTML = itemsToRender.map(product => `
        <div class="product-card" onclick="openProductModal(${product.id})">
            <img src="${product.image}" alt="${product.title}" class="product-image">
            <div class="product-info">
                <div class="product-title">${product.title}</div>
                <div class="product-price">$${parseFloat(product.price).toFixed(2)}</div>
            </div>
        </div>
    `).join('');
}

// --- LOGIN FUNCTIONS (Admin) ---
function openLogin() {
    loginModal.style.display = 'flex';
    passwordInput.value = '';
    loginError.style.display = 'none';
    setTimeout(() => passwordInput.focus(), 100);
}

function closeLogin() {
    loginModal.style.display = 'none';
}

function verifyPassword() {
    if (passwordInput.value === SECRET_PASSWORD) {
        closeLogin();
        openAdmin();
    } else {
        loginError.style.display = 'block';
        passwordInput.classList.add('shake');
        passwordInput.value = '';
        setTimeout(() => { passwordInput.classList.remove('shake'); }, 400);
    }
}

// --- ADMIN FUNCTIONS ---
function openAdmin() {
    adminModal.style.display = 'flex';
    setTimeout(() => { document.getElementById('input-title').focus(); }, 100);
}

function closeAdmin() {
    adminModal.style.display = 'none';
    document.getElementById('input-title').value = '';
    document.getElementById('input-price').value = '';
    document.getElementById('input-stock').value = '';
    document.getElementById('input-image').value = '';
    document.getElementById('image-preview').style.display = 'none';
    document.getElementById('upload-text').style.display = 'block';
}

function previewImage(event) {
    const reader = new FileReader();
    reader.onload = function () {
        const output = document.getElementById('image-preview');
        output.src = reader.result;
        output.style.display = 'block';
        document.getElementById('upload-text').style.display = 'none';
    };
    reader.readAsDataURL(event.target.files[0]);
}

function saveProduct() {
    const title = document.getElementById('input-title').value || 'Untitled Khmer Shirt';
    const price = document.getElementById('input-price').value || '0.00';
    const category = document.getElementById('input-category').value;
    const stock = parseInt(document.getElementById('input-stock').value) || 0;
    const imageInput = document.getElementById('input-image');

    let imageUrl = 'https://via.placeholder.com/300x400/140E1F/D4AF37?text=KHMER-SHIRT';

    if (imageInput.files && imageInput.files[0]) {
        imageUrl = document.getElementById('image-preview').src;
    }

    products.push({
        id: Date.now(),
        title: title,
        price: price,
        category: category,
        stock: stock,
        image: imageUrl
    });

    filterCategory(document.querySelector('.pill.active').dataset.category, document.querySelector('.pill.active'));
    closeAdmin();
    showPage('store');
}

// --- PRODUCT DETAIL MODAL ---
function openProductModal(productId) {
    selectedProduct = products.find(p => p.id === productId);
    if (!selectedProduct) return;

    selectedSize = null;
    document.getElementById('modal-product-image').src = selectedProduct.image;
    document.getElementById('modal-product-title').innerText = selectedProduct.title;
    document.getElementById('modal-product-price').innerText = `$${parseFloat(selectedProduct.price).toFixed(2)}`;
    document.getElementById('modal-product-stock').innerText = selectedProduct.stock;

    document.querySelectorAll('#modal-size-options .size-btn').forEach(btn => {
        btn.classList.remove('selected');
        btn.disabled = false;
    });

    productModal.style.display = 'flex';
}

function closeProductModal() {
    productModal.style.display = 'none';
}

function selectSize(btn) {
    document.querySelectorAll('#modal-size-options .size-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    selectedSize = btn.innerText;
}

function addToCartFromModal() {
    if (!currentUser) {
        alert('សូមបង្កើតគណនីជាមុនសិន ដើម្បីអាចទិញបាន!');
        closeProductModal();
        showPage('account');
        return;
    }

    if (!selectedSize) {
        alert('សូមជ្រើសរើសទំហំ (Size) ជាមុនសិន!');
        return;
    }

    if (selectedProduct.stock <= 0) {
        alert('ទំនិញនេះអស់ស្តុកហើយ!');
        return;
    }

    const existingItem = cart.find(item => item.id === selectedProduct.id && item.size === selectedSize);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            ...selectedProduct,
            size: selectedSize,
            quantity: 1
        });
    }

    selectedProduct.stock -= 1;

    updateCartBadge();
    closeProductModal();
    alert('បានដាក់ចូលកន្ត្រកដោយជោគជ័យ!');
}

// --- CART FUNCTIONS ---
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (totalItems > 0) {
        cartBadge.style.display = 'flex';
        cartBadge.innerText = totalItems;
    } else {
        cartBadge.style.display = 'none';
    }
}

function renderCartPage() {
    const container = document.getElementById('cart-container');

    if (cart.length === 0) {
        container.innerHTML = `
            <div style="width: 100%; text-align: center; padding: 60px 20px;">
                <div style="font-size: 60px; margin-bottom: 20px;">🛒</div>
                <h3 style="color: var(--text-light); font-family: 'Kantumruy Pro', sans-serif; margin-bottom: 12px;">កន្ត្រករបស់អ្នកទទេ</h3>
                <p style="color: var(--text-muted); margin-bottom: 24px;">សូមចូលទៅកាន់ផ្ទាំងផលិតផលដើម្បីជ្រើសរើសអាវដែលអ្នកចូលចិត្ត</p>
                <button class="btn btn-save" onclick="showPage('store')">ត្រឡប់ទៅផ្ទាំងផលិតផល</button>
            </div>
        `;
        return;
    }

    let total = 0;
    let itemsHtml = cart.map((item, index) => {
        total += item.price * item.quantity;
        return `
            <div class="cart-item-large">
                <img src="${item.image}" alt="${item.title}">
                <div class="cart-item-large-info">
                    <h4>${item.title}</h4>
                    <p>$${parseFloat(item.price).toFixed(2)}</p>
                    <small>ទំហំ: ${item.size} | ចំនួន: ${item.quantity}</small>
                </div>
                <button class="icon-btn" style="color: var(--error-red); font-size: 24px;" onclick="removeFromCartPage(${index})">✕</button>
            </div>
        `;
    }).join('');

    container.innerHTML = `
        <div class="cart-items-list">
            ${itemsHtml}
        </div>
        <div class="cart-summary">
            <h3>សង្ខេបការបញ្ជាទិញ</h3>
            <div class="summary-row">
                <span>ចំនួនទំនិញ</span>
                <span>${cart.reduce((sum, item) => sum + item.quantity, 0)} ដុំ</span>
            </div>
            <div class="summary-row">
                <span>តម្លៃសរុប</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <div class="summary-row total">
                <span>សរុបត្រូវបង់</span>
                <span>$${total.toFixed(2)}</span>
            </div>
            <button class="btn btn-save" style="width: 100%; margin-top: 24px;" onclick="checkoutCartPage()">ទូទាត់ប្រាក់</button>
        </div>
    `;
}

function removeFromCartPage(index) {
    cart.splice(index, 1);
    updateCartBadge();
    renderCartPage();
}

function checkoutCartPage() {
    if (cart.length === 0) {
        alert('កន្ត្រករបស់អ្នកទទេ!');
        return;
    }

    if (!currentUser) {
        alert('សូមបង្កើតគណនីជាមុនសិន ដើម្បីអាចទូទាត់ប្រាក់បាន!');
        showPage('account');
        return;
    }

    // Simulate successful payment
    cart = [];
    updateCartBadge();

    // Set purchase flag to true to unlock chat
    hasPurchased = true;
    chatMessages = [
        { sender: 'shop', text: 'សូមស្វាគមន៍! តើមានអ្វីឱ្យខ្ញុំជួយទេ? អ្នកអាចសួរព័ត៌មានអំពីការបញ្ជាទិញរបស់អ្នកបាន។' }
    ];

    alert('ការបញ្ជាទិញបានជោគជ័យ! សូមអរគុណ។ ឥឡូវនេះអ្នកអាចជជែកជាមួយម្ចាស់ហាងបានហើយ។');
    showPage('chat');
}

// --- ACCOUNT FUNCTIONS ---
function renderAccountPage() {
    const container = document.getElementById('account-container');

    if (currentUser) {
        if (isEditingProfile) {
            container.innerHTML = `
                <div class="account-avatar">
                    <div class="avatar-circle">👤</div>
                    <h2>កែប្រែព័ត៌មាន</h2>
                </div>
                <div class="form-group">
                    <label>ឈ្មោះពេញ</label>
                    <input type="text" id="edit-name" value="${currentUser.name}">
                </div>
                <div class="form-group">
                    <label>លេខទូរស័ព្ទ</label>
                    <input type="text" id="edit-phone" value="${currentUser.phone}">
                </div>
                <div class="form-group">
                    <label>ទីតាំង (Location)</label>
                    <input type="text" id="edit-location" value="${currentUser.location}">
                </div>
                <div style="display: flex; gap: 16px; margin-top: 24px; flex-wrap: wrap;">
                    <button class="btn btn-cancel" onclick="cancelEditProfile()" style="flex: 1; min-width: 120px;">បោះបង់</button>
                    <button class="btn btn-save" onclick="saveProfileChanges()" style="flex: 1; min-width: 120px;">រក្សាទុក</button>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="account-avatar">
                    <div class="avatar-circle">👤</div>
                    <h2>${currentUser.name}</h2>
                    <p>សមាជិក KHMER-SHIRT</p>
                </div>
                <div style="background: rgba(255,255,255,0.03); padding: 24px; border-radius: 4px; margin-bottom: 24px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <span style="color: var(--text-muted); font-size: 14px;">ឈ្មោះ:</span>
                        <span style="color: var(--text-light); font-size: 14px; font-weight: 600;">${currentUser.name}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                        <span style="color: var(--text-muted); font-size: 14px;">លេខទូរស័ព្ទ:</span>
                        <span style="color: var(--text-light); font-size: 14px; font-weight: 600;">${currentUser.phone}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span style="color: var(--text-muted); font-size: 14px;">ទីតាំង:</span>
                        <span style="color: var(--text-light); font-size: 14px; font-weight: 600;">${currentUser.location}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 16px; flex-wrap: wrap;">
                    <button class="btn btn-cancel" onclick="startEditProfile()" style="flex: 1; min-width: 120px;">កែប្រែព័ត៌មាន</button>
                    <button class="btn btn-save" onclick="logoutUser()" style="flex: 1; min-width: 120px; background: var(--error-red); border-color: var(--error-red);">ចាកចេញពីគណនី</button>
                </div>
            `;
        }
    } else {
        container.innerHTML = `
            <div class="account-avatar">
                <div class="avatar-circle">👤</div>
                <h2>បង្កើតគណនីថ្មី</h2>
                <p>ចុះឈ្មោះដើម្បីចាប់ផ្តើមទិញទំនិញ</p>
            </div>
            <div class="form-group">
                <label>ឈ្មោះពេញ</label>
                <input type="text" id="reg-name" placeholder="បញ្ចូលឈ្មោះរបស់អ្នក">
            </div>
            <div class="form-group">
                <label>លេខទូរស័ព្ទ</label>
                <input type="text" id="reg-phone" placeholder="បញ្ចូលលេខទូរស័ព្ទ">
            </div>
            <div class="form-group">
                <label>ទីតាំង (Location)</label>
                <input type="text" id="reg-location" placeholder="បញ្ចូលទីតាំងរបស់អ្នក">
            </div>
            <button class="btn btn-save" onclick="registerUser()" style="width: 100%; margin-top: 16px;">បង្កើតគណនី</button>
        `;
    }
}

function registerUser() {
    const name = document.getElementById('reg-name').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const location = document.getElementById('reg-location').value.trim();

    if (!name || !phone || !location) {
        alert('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់ជ្រុងជ្រោយ!');
        return;
    }

    currentUser = { name, phone, location };
    renderAccountPage();
    alert('គណនីរបស់អ្នកត្រូវបានបង្កើតដោយជោគជ័យ!');
}

function startEditProfile() {
    isEditingProfile = true;
    renderAccountPage();
}

function cancelEditProfile() {
    isEditingProfile = false;
    renderAccountPage();
}

function saveProfileChanges() {
    const name = document.getElementById('edit-name').value.trim();
    const phone = document.getElementById('edit-phone').value.trim();
    const location = document.getElementById('edit-location').value.trim();

    if (!name || !phone || !location) {
        alert('សូមបំពេញព័ត៌មានឱ្យបានគ្រប់ជ្រុងជ្រោយ!');
        return;
    }

    currentUser = { name, phone, location };
    isEditingProfile = false;
    renderAccountPage();
    alert('ព័ត៌មានរបស់អ្នកត្រូវបានកែប្រែដោយជោគជ័យ!');
}

function logoutUser() {
    currentUser = null;
    isEditingProfile = false;
    renderAccountPage();
    alert('អ្នកបានចាកចេញពីគណនី!');
}

// --- CHAT FUNCTIONS ---
function renderChatPage() {
    const chatBox = document.getElementById('chat-page-box');
    const inputContainer = document.getElementById('chat-page-input-container');

    if (!hasPurchased) {
        // No purchase yet - show empty state
        chatBox.innerHTML = `
            <div class="empty-chat-state">
                <span>💬</span>
                <h3>មិនមានការជជែកទេ</h3>
                <p>អ្នកត្រូវទិញទំនិញពីហាងជាមុនសិន ទើបអាចជជែកជាមួយម្ចាស់ហាងបាន។</p>
                <button class="btn btn-save" style="margin-top: 24px;" onclick="showPage('store')">ទៅទិញទំនិញឥឡូវនេះ</button>
            </div>
        `;
        inputContainer.style.display = 'none';
    } else {
        // Has purchased - show chat
        inputContainer.style.display = 'flex';

        if (chatMessages.length === 0) {
            chatMessages.push({ sender: 'shop', text: 'សូមស្វាគមន៍! តើមានអ្វីឱ្យខ្ញុំជួយទេ?' });
        }

        chatBox.innerHTML = chatMessages.map(msg => `
            <div class="chat-message ${msg.sender}">${msg.text}</div>
        `).join('');

        chatBox.scrollTop = chatBox.scrollHeight;
    }
}

function sendMessageFromPage() {
    if (!hasPurchased) return;

    const input = document.getElementById('chat-page-input');
    const message = input.value.trim();
    if (!message) return;

    // Add user message
    chatMessages.push({ sender: 'user', text: message });
    input.value = '';
    renderChatPage();

    // Simulate shop reply after 1 second
    setTimeout(() => {
        chatMessages.push({ sender: 'shop', text: 'សូមអរគុណសម្រាប់សារ! យើងនឹងឆ្លើយតបឆាប់ៗនេះ។' });
        renderChatPage();
    }, 1000);
}

// --- PURCHASE / PRICING FUNCTIONS ---
function buyPlan(planName, planPrice) {
    alert(`អ្នកបានជ្រើសរើសកញ្ចប់ ${planName} តម្លៃ ${planPrice}`);
}

// --- INITIAL RENDER ---
renderProducts(products);

// --- GLOBAL WINDOW CLICK ---
window.onclick = function (event) {
    if (event.target == loginModal) closeLogin();
    if (event.target == adminModal) closeAdmin();
    if (event.target == productModal) closeProductModal();
}
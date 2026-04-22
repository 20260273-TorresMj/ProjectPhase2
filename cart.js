/* ==================== CART.JS with Shipping Information ==================== */
let cart = JSON.parse(localStorage.getItem('wimpyCart')) || [];

function saveCart() {
    localStorage.setItem('wimpyCart', JSON.stringify(cart));
    updateCartUI();
}

function formatPrice(amount) {
    return '₱' + amount.toLocaleString();
}

function updateCartUI() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountElem = document.getElementById('cart-count');
    if (cartCountElem) cartCountElem.innerText = count;
    
    const cartItemsDiv = document.getElementById('cartItemsList');
    const totalSpan = document.getElementById('cartTotal');
    if (!cartItemsDiv) return;
    
    let total = 0;
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<div class="empty-cart">Your cart is empty.</div>';
        if (totalSpan) totalSpan.innerText = 'Total: ₱0.00';
        return;
    }
    cartItemsDiv.innerHTML = cart.map(item => {
        total += item.price * item.quantity;
        return `<div class="cart-item"><img src="${item.img}" class="cart-item-img"><div><strong>${item.name}</strong><br>${formatPrice(item.price)} x ${item.quantity}<br><button class="remove-item" data-id="${item.id}" style="background:none; border:none; cursor:pointer; margin-top:4px; font-size:0.75rem;">Remove</button></div></div>`;
    }).join('');
    if (totalSpan) totalSpan.innerText = `Total: ${formatPrice(total)}`;
    
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = parseInt(btn.dataset.id);
            cart = cart.filter(i => i.id !== id);
            saveCart();
        });
    });
}

window.addToCart = function(product) {
    const existing = cart.find(i => i.id === product.id);
    if (existing) existing.quantity++;
    else cart.push({ ...product, quantity: 1 });
    saveCart();
    showNotification(`${product.name} added — ${formatPrice(product.price)}`);
};

function showNotification(msg) {
    let notif = document.createElement('div');
    notif.innerText = msg;
    notif.style.position = 'fixed';
    notif.style.bottom = '24px';
    notif.style.left = '24px';
    notif.style.background = '#1A1A1A';
    notif.style.color = 'white';
    notif.style.padding = '10px 20px';
    notif.style.fontSize = '0.85rem';
    notif.style.zIndex = '3000';
    notif.style.borderRadius = '4px';
    document.body.appendChild(notif);
    setTimeout(() => notif.remove(), 2000);
}

// ========== SHIPPING INFORMATION MODAL ==========
function showShippingModal() {
    // Remove existing modal if any
    const existingModal = document.getElementById('shippingModal');
    if (existingModal) existingModal.remove();
    
    // Calculate total
    const subtotal = cart.reduce((t, i) => t + (i.price * i.quantity), 0);
    const shippingCost = 150; // Flat rate shipping in PHP
    const total = subtotal + shippingCost;
    
    // Create modal HTML
    const modalHTML = `
        <div id="shippingModal" class="shipping-modal-overlay">
            <div class="shipping-modal">
                <div class="shipping-modal-header">
                    <h3>Shipping Information</h3>
                    <button class="close-modal-btn" id="closeModalBtn">&times;</button>
                </div>
                <form id="shippingForm">
                    <div class="form-row-shipping">
                        <div class="form-group-shipping">
                            <label>Full Name *</label>
                            <input type="text" id="shippingFullName" required placeholder="Juan Dela Cruz">
                        </div>
                        <div class="form-group-shipping">
                            <label>Email Address *</label>
                            <input type="email" id="shippingEmail" required placeholder="juan@example.com">
                        </div>
                    </div>
                    <div class="form-group-shipping">
                        <label>Phone Number *</label>
                        <input type="tel" id="shippingPhone" required placeholder="+63 912 345 6789">
                    </div>
                    <div class="form-group-shipping">
                        <label>Street Address *</label>
                        <input type="text" id="shippingAddress" required placeholder="Unit/Floor, Building, Street">
                    </div>
                    <div class="form-row-shipping">
                        <div class="form-group-shipping">
                            <label>City *</label>
                            <input type="text" id="shippingCity" required placeholder="Makati City">
                        </div>
                        <div class="form-group-shipping">
                            <label>Province *</label>
                            <input type="text" id="shippingProvince" required placeholder="Metro Manila">
                        </div>
                    </div>
                    <div class="form-row-shipping">
                        <div class="form-group-shipping">
                            <label>Postal Code *</label>
                            <input type="text" id="shippingPostal" required placeholder="1200">
                        </div>
                        <div class="form-group-shipping">
                            <label>Country *</label>
                            <input type="text" id="shippingCountry" required value="Philippines" readonly style="background:#f5f5f5;">
                        </div>
                    </div>
                    
                    <div class="shipping-methods">
                        <label class="shipping-label">Shipping Method *</label>
                        <div class="shipping-options">
                            <label class="shipping-option">
                                <input type="radio" name="shippingMethod" value="Standard" data-cost="150" checked>
                                <div class="shipping-details">
                                    <strong>Standard Delivery</strong>
                                    <span>3-5 business days</span>
                                    <span class="shipping-cost">₱150</span>
                                </div>
                            </label>
                            <label class="shipping-option">
                                <input type="radio" name="shippingMethod" value="Express" data-cost="350">
                                <div class="shipping-details">
                                    <strong>Express Delivery</strong>
                                    <span>1-2 business days</span>
                                    <span class="shipping-cost">₱350</span>
                                </div>
                            </label>
                            <label class="shipping-option">
                                <input type="radio" name="shippingMethod" value="Same Day" data-cost="550">
                                <div class="shipping-details">
                                    <strong>Same Day Delivery</strong>
                                    <span>Within Metro Manila</span>
                                    <span class="shipping-cost">₱550</span>
                                </div>
                            </label>
                        </div>
                    </div>
                    
                    <div class="order-summary">
                        <h4>Order Summary</h4>
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>${formatPrice(subtotal)}</span>
                        </div>
                        <div class="summary-row" id="shippingSummaryRow">
                            <span>Shipping:</span>
                            <span id="shippingCostDisplay">${formatPrice(150)}</span>
                        </div>
                        <div class="summary-row total-row">
                            <span>Total:</span>
                            <span id="grandTotalDisplay">${formatPrice(total)}</span>
                        </div>
                    </div>
                    
                    <button type="submit" class="place-order-btn">Place Order ✓</button>
                </form>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    const modal = document.getElementById('shippingModal');
    const closeBtn = document.getElementById('closeModalBtn');
    const form = document.getElementById('shippingForm');
    const shippingRadios = document.querySelectorAll('input[name="shippingMethod"]');
    const shippingCostDisplay = document.getElementById('shippingCostDisplay');
    const grandTotalDisplay = document.getElementById('grandTotalDisplay');
    
    // Update shipping cost and total when radio changes
    shippingRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const cost = parseInt(this.dataset.cost);
            const newTotal = subtotal + cost;
            shippingCostDisplay.innerText = formatPrice(cost);
            grandTotalDisplay.innerText = formatPrice(newTotal);
        });
    });
    
    function closeModal() {
        modal.remove();
    }
    
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get shipping details
        const fullName = document.getElementById('shippingFullName').value.trim();
        const email = document.getElementById('shippingEmail').value.trim();
        const phone = document.getElementById('shippingPhone').value.trim();
        const address = document.getElementById('shippingAddress').value.trim();
        const city = document.getElementById('shippingCity').value.trim();
        const province = document.getElementById('shippingProvince').value.trim();
        const postal = document.getElementById('shippingPostal').value.trim();
        const country = document.getElementById('shippingCountry').value;
        const selectedShipping = document.querySelector('input[name="shippingMethod"]:checked');
        const shippingMethod = selectedShipping ? selectedShipping.value : 'Standard';
        const shippingCost = selectedShipping ? parseInt(selectedShipping.dataset.cost) : 150;
        
        // Validate all required fields
        if (!fullName || !email || !phone || !address || !city || !province || !postal) {
            alert('Please fill in all required fields.');
            return;
        }
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        // Validate phone (basic)
        if (phone.length < 10) {
            alert('Please enter a valid phone number.');
            return;
        }
        
        // Calculate totals
        const subtotalAmount = cart.reduce((t, i) => t + (i.price * i.quantity), 0);
        const totalAmount = subtotalAmount + shippingCost;
        
        // Prepare order summary
        const orderItems = cart.map(item => `${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity)}`).join('\n');
        const shippingAddressText = `${address}, ${city}, ${province}, ${postal}, ${country}`;
        
        // Show order confirmation
        alert(`🎉 ORDER CONFIRMED!\n\nThank you ${fullName}!\n\n━━━━━━━━━━━━━━━━━━━━\n📦 ORDER DETAILS:\n${orderItems}\n\n━━━━━━━━━━━━━━━━━━━━\n🚚 SHIPPING:\nMethod: ${shippingMethod}\nAddress: ${shippingAddressText}\nPhone: ${phone}\nEmail: ${email}\n\n━━━━━━━━━━━━━━━━━━━━\n💰 PAYMENT SUMMARY:\nSubtotal: ${formatPrice(subtotalAmount)}\nShipping: ${formatPrice(shippingCost)}\nTOTAL: ${formatPrice(totalAmount)}\n\n━━━━━━━━━━━━━━━━━━━━\n📧 A confirmation email has been sent to ${email}\nThank you for shopping at Wimpy Kidz!`);
        
        // Clear cart and close modal
        cart = [];
        saveCart();
        closeModal();
        
        // Close cart sidebar if open
        const cartSidebar = document.getElementById('cartSidebar');
        const overlay = document.getElementById('cartOverlay');
        if (cartSidebar && cartSidebar.classList.contains('active')) {
            cartSidebar.classList.remove('active');
            if (overlay) overlay.classList.remove('active');
        }
    });
}

// Cart sidebar controls with updated checkout
document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cart-btn');
    const cartSidebar = document.getElementById('cartSidebar');
    const overlay = document.getElementById('cartOverlay');
    const closeBtn = document.getElementById('closeCartBtn');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    function openCart() { if(cartSidebar && overlay) { cartSidebar.classList.add('active'); overlay.classList.add('active'); } }
    function closeCart() { if(cartSidebar && overlay) { cartSidebar.classList.remove('active'); overlay.classList.remove('active'); } }
    
    if(cartBtn) cartBtn.addEventListener('click', openCart);
    if(closeBtn) closeBtn.addEventListener('click', closeCart);
    if(overlay) overlay.addEventListener('click', closeCart);
    if(checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if(cart.length === 0) {
                alert('Your cart is empty. Add some items before checking out.');
            } else { 
                closeCart(); // Close the cart sidebar first
                setTimeout(() => {
                    showShippingModal(); // Show shipping information modal
                }, 200);
            }
        });
    }
    updateCartUI();
});
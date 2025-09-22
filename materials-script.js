// Materials Page JavaScript Functionality

// Sample product data
const productsData = [
    {
        id: 1,
        name: "HDPE Film Grade Natural",
        supplier: "Reliance Industries",
        description: "High quality natural film grade granules suitable for various packaging applications.",
        price: 85000,
        unit: "MT",
        image: "images/hdpe-natural.svg",
        category: "Polymers",
        grade: "Film Grade",
        color: "Natural",
        verified: true,
        minOrder: 1
    },
    {
        id: 2,
        name: "HDPE Injection Molding White",
        supplier: "GAIL (India) Ltd",
        description: "Prime quality white HDPE for injection molding applications with excellent flow properties.",
        price: 92000,
        unit: "MT",
        image: "images/hdpe-white.svg",
        category: "Polymers",
        grade: "Injection Molding",
        color: "White",
        verified: true,
        minOrder: 1
    },
    {
        id: 3,
        name: "HDPE Blow Molding Black",
        supplier: "Haldia Petrochemicals",
        description: "UV stabilized black HDPE granules for blow molding applications like drums and containers.",
        price: 88500,
        unit: "MT",
        image: "images/hdpe-black.svg",
        category: "Polymers",
        grade: "Blow Molding",
        color: "Black",
        verified: true,
        minOrder: 1
    },
    {
        id: 4,
        name: "HDPE Pipe Grade Natural",
        supplier: "Indian Oil Corporation",
        description: "High density polyethylene suitable for pipe manufacturing with excellent stress crack resistance.",
        price: 87000,
        unit: "MT",
        image: "images/hdpe-pipe.svg",
        category: "Polymers",
        grade: "Pipe Grade",
        color: "Natural",
        verified: true,
        minOrder: 2
    },
    {
        id: 5,
        name: "HDPE Rotomolding Grade",
        supplier: "ONGC Petro Additions",
        description: "Specialized grade for rotational molding applications with superior impact strength.",
        price: 94000,
        unit: "MT",
        image: "images/hdpe-roto.svg",
        category: "Polymers",
        grade: "Rotomolding",
        color: "Natural",
        verified: true,
        minOrder: 1
    },
    {
        id: 6,
        name: "HDPE Extrusion Grade Blue",
        supplier: "Brahmaputra Cracker",
        description: "Blue colored HDPE for extrusion applications including sheets and profiles.",
        price: 89500,
        unit: "MT",
        image: "images/hdpe-blue.svg",
        category: "Polymers",
        grade: "Extrusion",
        color: "Blue",
        verified: false,
        minOrder: 1
    },
    {
        id: 7,
        name: "PP Natural Grade",
        supplier: "Reliance Industries",
        description: "High quality natural polypropylene granules for various molding applications.",
        price: 78000,
        unit: "MT",
        image: "images/pp-natural.svg",
        category: "Polymers",
        grade: "Injection Molding",
        color: "Natural",
        verified: true,
        minOrder: 1
    },
    {
        id: 8,
        name: "PP Black Grade",
        supplier: "GAIL (India) Ltd",
        description: "UV stabilized black polypropylene granules with excellent mechanical properties.",
        price: 82000,
        unit: "MT",
        image: "images/pp-black.svg",
        category: "Polymers",
        grade: "Injection Molding",
        color: "Black",
        verified: true,
        minOrder: 1
    }
];

// Global variables
let filteredProducts = [...productsData];
let currentPage = 1;
const productsPerPage = 6;
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// DOM elements
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const productsGrid = document.getElementById('products-grid');
const resultsCount = document.getElementById('results-count');
const pagination = document.getElementById('pagination');
const applyFiltersBtn = document.getElementById('apply-filters');
const minPriceInput = document.getElementById('min-price');
const maxPriceInput = document.getElementById('max-price');

// Initialize the page
document.addEventListener('DOMContentLoaded', function() {
    initializeFilters();
    renderProducts();
    setupEventListeners();
    updateCartCount();
});

// Setup event listeners
function setupEventListeners() {
    // Search functionality
    searchInput.addEventListener('input', debounce(handleSearch, 300));
    
    // Sort functionality
    sortSelect.addEventListener('change', handleSort);
    
    // Filter functionality
    applyFiltersBtn.addEventListener('click', applyFilters);
    
    // Price range inputs
    minPriceInput.addEventListener('input', debounce(applyFilters, 500));
    maxPriceInput.addEventListener('input', debounce(applyFilters, 500));
    
    // Filter checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', applyFilters);
    });
}

// Initialize filter options
function initializeFilters() {
    // Get unique values for filters
    const categories = [...new Set(productsData.map(p => p.category))];
    const grades = [...new Set(productsData.map(p => p.grade))];
    const colors = [...new Set(productsData.map(p => p.color))];
    
    // Populate filter options (assuming they're already in HTML)
    // This would be expanded based on the actual filter structure
}

// Search functionality
function handleSearch() {
    const searchTerm = searchInput.value.toLowerCase().trim();
    
    if (searchTerm === '') {
        filteredProducts = [...productsData];
    } else {
        filteredProducts = productsData.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.supplier.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.grade.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderProducts();
}

// Sort functionality
function handleSort() {
    const sortValue = sortSelect.value;
    
    switch(sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'supplier':
            filteredProducts.sort((a, b) => a.supplier.localeCompare(b.supplier));
            break;
        default: // relevance
            filteredProducts = [...productsData].filter(product => 
                filteredProducts.some(fp => fp.id === product.id)
            );
    }
    
    currentPage = 1;
    renderProducts();
}

// Apply filters
function applyFilters() {
    const selectedCategories = getSelectedFilters('category');
    const selectedGrades = getSelectedFilters('grade');
    const selectedColors = getSelectedFilters('color');
    const minPrice = parseFloat(minPriceInput.value) || 0;
    const maxPrice = parseFloat(maxPriceInput.value) || Infinity;
    
    filteredProducts = productsData.filter(product => {
        const categoryMatch = selectedCategories.length === 0 || selectedCategories.includes(product.category);
        const gradeMatch = selectedGrades.length === 0 || selectedGrades.includes(product.grade);
        const colorMatch = selectedColors.length === 0 || selectedColors.includes(product.color);
        const priceMatch = product.price >= minPrice && product.price <= maxPrice;
        
        return categoryMatch && gradeMatch && colorMatch && priceMatch;
    });
    
    // Apply search if there's a search term
    const searchTerm = searchInput.value.toLowerCase().trim();
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.supplier.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }
    
    currentPage = 1;
    renderProducts();
}

// Get selected filter values
function getSelectedFilters(filterType) {
    const checkboxes = document.querySelectorAll(`input[name="${filterType}"]:checked`);
    return Array.from(checkboxes).map(cb => cb.value);
}

// Render products
function renderProducts() {
    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, endIndex);
    
    // Update results count
    resultsCount.textContent = `Showing ${startIndex + 1}-${Math.min(endIndex, filteredProducts.length)} of ${filteredProducts.length} results`;
    
    // Clear products grid
    productsGrid.innerHTML = '';
    
    // Render products
    currentProducts.forEach((product, index) => {
        const productCard = createProductCard(product, index);
        productsGrid.appendChild(productCard);
    });
    
    // Render pagination
    renderPagination();
    
    // Add loading animation
    productsGrid.classList.add('loading');
    setTimeout(() => {
        productsGrid.classList.remove('loading');
    }, 300);
}

// Create product card
function createProductCard(product, index) {
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.animationDelay = `${index * 0.1}s`;
    
    card.innerHTML = `
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.svg'">
            ${product.verified ? '<div class="verified-badge"><i class="fas fa-check-circle"></i> Verified Seller</div>' : ''}
        </div>
        <div class="product-info">
            <h3 class="product-title">${product.name}</h3>
            <p class="product-supplier">${product.supplier}</p>
            <p class="product-description">${product.description}</p>
            <div class="product-pricing">
                <span class="product-price">₹${formatPrice(product.price)}</span>
                <span class="price-unit">/${product.unit}</span>
            </div>
            <div class="product-quantity">
                <label for="quantity-${product.id}">Quantity (${product.unit})</label>
                <input type="number" id="quantity-${product.id}" class="quantity-input" 
                       min="${product.minOrder}" value="${product.minOrder}" step="1">
            </div>
            <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
                <i class="fas fa-shopping-cart"></i> Add to Cart
            </button>
        </div>
    `;
    
    return card;
}

// Format price with commas
function formatPrice(price) {
    return price.toLocaleString('en-IN');
}

// Add to cart functionality
function addToCart(productId) {
    const product = productsData.find(p => p.id === productId);
    const quantityInput = document.getElementById(`quantity-${productId}`);
    const quantity = parseInt(quantityInput.value);
    
    if (quantity < product.minOrder) {
        showNotification(`Minimum order quantity is ${product.minOrder} ${product.unit}`, 'error');
        return;
    }
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: productId,
            name: product.name,
            supplier: product.supplier,
            price: product.price,
            unit: product.unit,
            quantity: quantity,
            image: product.image
        });
    }
    
    // Save to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update cart count
    updateCartCount();
    
    // Show notification
    showNotification(`${product.name} added to cart!`, 'success');
    
    // Reset quantity input
    quantityInput.value = product.minOrder;
}

// Update cart count in header
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartIcon = document.querySelector('.user-menu i.fa-shopping-cart');
    
    if (cartIcon) {
        // Remove existing badge
        const existingBadge = cartIcon.parentNode.querySelector('.cart-badge');
        if (existingBadge) {
            existingBadge.remove();
        }
        
        // Add new badge if cart has items
        if (cartCount > 0) {
            const badge = document.createElement('span');
            badge.className = 'cart-badge';
            badge.textContent = cartCount;
            badge.style.cssText = `
                position: absolute;
                top: -8px;
                right: -8px;
                background: #ef4444;
                color: white;
                border-radius: 50%;
                width: 20px;
                height: 20px;
                font-size: 12px;
                display: flex;
                align-items: center;
                justify-content: center;
                font-weight: bold;
            `;
            cartIcon.parentNode.style.position = 'relative';
            cartIcon.parentNode.appendChild(badge);
        }
    }
}

// Show notification
function showNotification(message, type = 'success') {
    // Remove existing notification
    const existingNotification = document.querySelector('.cart-notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.style.background = type === 'success' ? '#10b981' : '#ef4444';
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Render pagination
function renderPagination() {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    pagination.innerHTML = '';
    
    if (totalPages <= 1) return;
    
    // Previous button
    const prevBtn = document.createElement('button');
    prevBtn.className = 'pagination-btn';
    prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        const firstBtn = document.createElement('button');
        firstBtn.className = 'pagination-btn';
        firstBtn.textContent = '1';
        firstBtn.onclick = () => changePage(1);
        pagination.appendChild(firstBtn);
        
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pagination.appendChild(pageBtn);
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.className = 'pagination-dots';
            dots.textContent = '...';
            pagination.appendChild(dots);
        }
        
        const lastBtn = document.createElement('button');
        lastBtn.className = 'pagination-btn';
        lastBtn.textContent = totalPages;
        lastBtn.onclick = () => changePage(totalPages);
        pagination.appendChild(lastBtn);
    }
    
    // Next button
    const nextBtn = document.createElement('button');
    nextBtn.className = 'pagination-btn';
    nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

// Change page
function changePage(page) {
    const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderProducts();
    
    // Scroll to top of products section
    document.querySelector('.products-section').scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
    });
}

// Debounce function for search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mobile filter toggle
function toggleMobileFilters() {
    const sidebar = document.querySelector('.filters-sidebar');
    sidebar.classList.toggle('mobile-open');
}

// Clear all filters
function clearAllFilters() {
    // Reset checkboxes
    document.querySelectorAll('.filter-option input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
    
    // Reset price inputs
    minPriceInput.value = '';
    maxPriceInput.value = '';
    
    // Reset search
    searchInput.value = '';
    
    // Reset sort
    sortSelect.value = 'relevance';
    
    // Apply filters
    filteredProducts = [...productsData];
    currentPage = 1;
    renderProducts();
}

// Export cart data (for potential cart page)
function getCartData() {
    return cart;
}

// Clear cart
function clearCart() {
    cart = [];
    localStorage.removeItem('cart');
    updateCartCount();
    showNotification('Cart cleared!', 'success');
}

// Initialize mobile responsiveness
function initializeMobileFeatures() {
    // Add mobile filter toggle button if needed
    if (window.innerWidth <= 768) {
        const filterToggle = document.createElement('button');
        filterToggle.className = 'mobile-filter-toggle';
        filterToggle.innerHTML = '<i class="fas fa-filter"></i> Filters';
        filterToggle.onclick = toggleMobileFilters;
        
        const productsHeader = document.querySelector('.products-header');
        productsHeader.appendChild(filterToggle);
    }
}

// Handle window resize
window.addEventListener('resize', debounce(() => {
    if (window.innerWidth > 768) {
        const sidebar = document.querySelector('.filters-sidebar');
        sidebar.classList.remove('mobile-open');
    }
}, 250));

// Add CSS for mobile features
const mobileStyles = `
    .mobile-filter-toggle {
        display: none;
        background: #2563eb;
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 8px;
        cursor: pointer;
        font-weight: 600;
        gap: 0.5rem;
        align-items: center;
    }
    
    .cart-badge {
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ef4444;
        color: white;
        border-radius: 50%;
        width: 20px;
        height: 20px;
        font-size: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
    }
    
    @media (max-width: 768px) {
        .mobile-filter-toggle {
            display: flex;
        }
        
        .filters-sidebar {
            position: fixed;
            top: 0;
            left: -100%;
            width: 80%;
            height: 100vh;
            z-index: 1000;
            transition: left 0.3s ease;
            overflow-y: auto;
        }
        
        .filters-sidebar.mobile-open {
            left: 0;
        }
        
        .filters-sidebar.mobile-open::before {
            content: '';
            position: fixed;
            top: 0;
            right: 0;
            width: 20%;
            height: 100vh;
            background: rgba(0, 0, 0, 0.5);
            z-index: -1;
        }
    }
`;

// Add mobile styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = mobileStyles;
document.head.appendChild(styleSheet);
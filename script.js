// B2B Plastics Interactive Features

// DOM Elements
const searchInputs = document.querySelectorAll('.search-input');
const searchBtns = document.querySelectorAll('.search-btn');
const navLinks = document.querySelectorAll('.nav-link');
const serviceCards = document.querySelectorAll('.service-card');
const forumPosts = document.querySelectorAll('.forum-post');

// Search Functionality
function handleSearch(searchInput) {
    const query = searchInput.value.trim();
    if (query) {
        console.log('Searching for:', query);
        // In a real application, this would make an API call
        showSearchResults(query);
    }
}

function showSearchResults(query) {
    // Simulate search results
    const results = [
        'Injection Molding Machine - 50 Ton',
        'Plastic Raw Materials - PP Granules',
        'Skilled Machine Operator',
        'Mould Design Services'
    ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
    
    if (results.length > 0) {
        alert(`Found ${results.length} results for "${query}":\n\n${results.join('\n')}`);
    } else {
        alert(`No results found for "${query}". Try different keywords.`);
    }
}

// Add event listeners to search inputs and buttons
searchInputs.forEach((input, index) => {
    const searchBtn = searchBtns[index];
    
    // Search on button click
    if (searchBtn) {
        searchBtn.addEventListener('click', () => handleSearch(input));
    }
    
    // Search on Enter key press
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(input);
        }
    });
    
    // Add search suggestions on input
    input.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query.length > 2) {
            showSearchSuggestions(query, input);
        } else {
            hideSearchSuggestions();
        }
    });
});

// Search Suggestions
function showSearchSuggestions(query, inputElement) {
    const suggestions = [
        'Injection Molding Machine',
        'Blow Molding Equipment',
        'Plastic Raw Materials',
        'PP Granules',
        'ABS Plastic',
        'Machine Operator',
        'Quality Control Inspector',
        'Mould Designer',
        'Production Manager',
        'Maintenance Technician'
    ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
    
    // Remove existing suggestions
    hideSearchSuggestions();
    
    if (suggestions.length > 0) {
        const suggestionsList = document.createElement('div');
        suggestionsList.className = 'search-suggestions';
        suggestionsList.style.cssText = `
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            max-height: 200px;
            overflow-y: auto;
        `;
        
        suggestions.slice(0, 5).forEach(suggestion => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'suggestion-item';
            suggestionItem.textContent = suggestion;
            suggestionItem.style.cssText = `
                padding: 0.75rem 1rem;
                cursor: pointer;
                border-bottom: 1px solid #f1f5f9;
                transition: background-color 0.2s ease;
            `;
            
            suggestionItem.addEventListener('mouseenter', () => {
                suggestionItem.style.backgroundColor = '#f8fafc';
            });
            
            suggestionItem.addEventListener('mouseleave', () => {
                suggestionItem.style.backgroundColor = 'white';
            });
            
            suggestionItem.addEventListener('click', () => {
                inputElement.value = suggestion;
                hideSearchSuggestions();
                handleSearch(inputElement);
            });
            
            suggestionsList.appendChild(suggestionItem);
        });
        
        // Position suggestions relative to input
        const searchBox = inputElement.closest('.search-box');
        if (searchBox) {
            searchBox.style.position = 'relative';
            searchBox.appendChild(suggestionsList);
        }
    }
}

function hideSearchSuggestions() {
    const existingSuggestions = document.querySelectorAll('.search-suggestions');
    existingSuggestions.forEach(suggestions => suggestions.remove());
}

// Navigation Functionality
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        // Only prevent default for links without href or with # href
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('#')) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            link.classList.add('active');
            
            // Simulate navigation for placeholder links
            const linkText = link.textContent;
            console.log('Navigating to:', linkText);
        }
        // For actual page links (like machinery.html, materials.html), allow normal navigation
    });
});

// Service Card Interactions
serviceCards.forEach(card => {
    card.addEventListener('click', () => {
        const serviceName = card.querySelector('h3').textContent;
        showServiceDetails(serviceName);
    });
    
    // Add hover effect
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-8px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

function showServiceDetails(serviceName) {
    // Special handling for Material service - redirect to external page
    if (serviceName === 'Material') {
        window.open('https://www.trae.ai/account-setting?user_id=754517586172061798&username=WYNS', '_blank');
        return;
    }
    
    const serviceInfo = {
        'Manpower': 'Connect with skilled professionals including machine operators, quality control inspectors, production managers, and technical experts.',
        'Machineries': 'Discover a wide range of plastic manufacturing equipment including injection molding machines, blow molding equipment, and extrusion lines.',
        'Mould Design and Makers': 'Connect with experienced mould designers and manufacturers for custom tooling solutions.'
    };
    
    const info = serviceInfo[serviceName] || 'Service information not available.';
    showModal(serviceName, info);
}

// Forum Post Interactions
forumPosts.forEach(post => {
    post.addEventListener('click', () => {
        const postTitle = post.querySelector('.post-text').textContent;
        showForumPost(postTitle);
    });
});

function showForumPost(postTitle) {
    showModal('Forum Post', `You clicked on: "${postTitle}"\n\nThis would open the full forum discussion in a real application.`);
}

// Modal System
function showModal(title, content) {
    // Remove existing modal
    const existingModal = document.querySelector('.custom-modal');
    if (existingModal) {
        existingModal.remove();
    }
    
    const modal = document.createElement('div');
    modal.className = 'custom-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.style.cssText = `
        background: white;
        padding: 2rem;
        border-radius: 12px;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow-y: auto;
        position: relative;
        animation: slideIn 0.3s ease;
    `;
    
    modalContent.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #1e293b; font-size: 1.5rem;">${title}</h3>
        <p style="color: #64748b; line-height: 1.6; margin-bottom: 2rem;">${content}</p>
        <button class="close-modal-btn" style="
            background: #4CAF50;
            color: white;
            border: none;
            padding: 0.75rem 1.5rem;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.3s ease;
        ">Close</button>
    `;
    
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // Close modal functionality
    const closeBtn = modal.querySelector('.close-modal-btn');
    closeBtn.addEventListener('click', () => modal.remove());
    
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = '#45A049';
    });
    
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = '#4CAF50';
    });
    
    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
    
    // Close on Escape key
    document.addEventListener('keydown', function escapeHandler(e) {
        if (e.key === 'Escape') {
            modal.remove();
            document.removeEventListener('keydown', escapeHandler);
        }
    });
}

// Notification System
function showNotification(message) {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 1500;
        animation: slideInRight 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 3000);
}

// Button Interactions
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('start-discussion')) {
        e.preventDefault();
        showModal('Start New Discussion', 'This would open a form to create a new forum discussion in a real application.');
    }
    
    if (e.target.classList.contains('btn-primary') && e.target.textContent === 'Post Requirement') {
        e.preventDefault();
        showModal('Post Requirement', 'This would open a form to post your business requirements in a real application.');
    }
    
    if (e.target.classList.contains('btn-secondary') && e.target.textContent === 'Login') {
        e.preventDefault();
        showModal('Login', 'This would open the login form in a real application.');
    }
});

// Smooth Scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideIn {
        from { 
            opacity: 0;
            transform: translateY(-20px);
        }
        to { 
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @keyframes slideInRight {
        from { 
            opacity: 0;
            transform: translateX(100%);
        }
        to { 
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from { 
            opacity: 1;
            transform: translateX(0);
        }
        to { 
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .nav-link.active {
        color: #4CAF50 !important;
        font-weight: 600;
    }
`;
document.head.appendChild(style);

// Initialize page
document.addEventListener('DOMContentLoaded', () => {
    console.log('B2B Plastics page loaded successfully!');
    // Removed welcome notification popup
    
    // Hide suggestions when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            hideSearchSuggestions();
        }
    });
});

// Handle window resize for responsive behavior
window.addEventListener('resize', () => {
    hideSearchSuggestions();
});

console.log('B2B Plastics JavaScript loaded successfully!');
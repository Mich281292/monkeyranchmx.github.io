// Theme toggle functionality
const themeToggle = document.getElementById('themeToggle');
const htmlElement = document.documentElement;
const body = document.body;
const header = document.querySelector('header');

// Check for saved theme preference or system preference
const savedTheme = localStorage.getItem('theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

// Initialize theme
if (savedTheme) {
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.textContent = '☀️';
    }
} else if (prefersDark) {
    body.classList.add('dark-mode');
    themeToggle.textContent = '☀️';
}

// Handle theme toggle
themeToggle.addEventListener('click', function() {
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
});

// Smooth scrolling for navigation links
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

// CTA Button click handler
const ctaButton = document.querySelector('.cta-button');
if (ctaButton) {
    ctaButton.addEventListener('click', function() {
        const servicesSection = document.querySelector('#services');
        if (servicesSection) {
            servicesSection.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
}

// Contact form submission
const contactForm = document.querySelector('#contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const nombre = this.querySelector('input[placeholder="Tu nombre"]').value.trim();
    const email = this.querySelector('input[placeholder="Tu email"]').value.trim();
    const mensaje = this.querySelector('textarea[placeholder="Tu mensaje"]').value.trim();
    const inputs = this.querySelectorAll('input, textarea');
    
    // Client-side validation
    let isValid = true;
    inputs.forEach(input => {
        if (!input.value.trim()) {
            isValid = false;
            input.style.borderColor = '#ff6b6b';
        } else {
            input.style.borderColor = 'var(--border-color)';
        }
    });
    
    if (!isValid) {
        alert('Por favor, completa todos los campos del formulario.');
        return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un email válido.');
        return;
    }

    // Submit to backend
    const submitBtn = this.querySelector('.submit-btn');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    fetch('https://monkey-ranch-api.onrender.com/api/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nombre, email, mensaje })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            this.reset();
            inputs.forEach(input => {
                input.style.borderColor = 'var(--border-color)';
            });
        } else {
            alert('Error: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Error al enviar el mensaje. Por favor, intenta de nuevo.');
    })
    .finally(() => {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    });
    });
}

// Add scroll animation for service cards
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.service-card').forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(card);
});

// Shrink header and straighten logo on scroll
if (header) {
    const toggleHeaderCompact = () => {
        if (window.scrollY > 40) {
            header.classList.add('header-compact');
        } else {
            header.classList.remove('header-compact');
        }
    };

    toggleHeaderCompact();
    window.addEventListener('scroll', toggleHeaderCompact, { passive: true });
}

// Contact Bar Toggle Functionality
const contactBar = document.getElementById('contactBar');
const contactTab = document.getElementById('contactTab');
const closeContactBtn = document.getElementById('closeContact');
const callBtn = document.getElementById('callBtn');

if (contactTab && contactBar) {
    // Open contact bar
    contactTab.addEventListener('click', function() {
        contactBar.style.display = 'flex';
        contactTab.classList.remove('show');
    });
    
    // Close contact bar
    if (closeContactBtn) {
        closeContactBtn.addEventListener('click', function() {
            contactBar.style.display = 'none';
            contactTab.classList.add('show');
        });
    }
    
    // Phone button action
    if (callBtn) {
        callBtn.addEventListener('click', function() {
            window.location.href = 'tel:+525542121718';
        });
    }
}

console.log('Monkey Ranch website loaded successfully!');

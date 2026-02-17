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

// Mobile Menu Toggle
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navLinks = document.getElementById('navLinks');

if (mobileMenuToggle && navLinks) {
    mobileMenuToggle.addEventListener('click', function() {
        navLinks.classList.toggle('active');
        mobileMenuToggle.classList.toggle('active');
        
        // Prevent body scrolling when menu is open
        if (navLinks.classList.contains('active')) {
            body.style.overflow = 'hidden';
        } else {
            body.style.overflow = '';
        }
    });

    // Close menu when clicking on a link
    const navLinksItems = navLinks.querySelectorAll('a');
    navLinksItems.forEach(link => {
        link.addEventListener('click', function() {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            body.style.overflow = '';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        const isClickInsideMenu = navLinks.contains(event.target);
        const isClickOnToggle = mobileMenuToggle.contains(event.target);
        
        if (!isClickInsideMenu && !isClickOnToggle && navLinks.classList.contains('active')) {
            navLinks.classList.remove('active');
            mobileMenuToggle.classList.remove('active');
            body.style.overflow = '';
        }
    });
}

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
    
    const nombreInput = this.querySelector('input[placeholder="Tu nombre"]');
    const emailInput = this.querySelector('input[placeholder="Tu email"]');
    const telefonoInput = this.querySelector('input[placeholder="Tu teléfono"]');
    const mensajeInput = this.querySelector('textarea[placeholder="Tu mensaje"]');
    
    const nombre = nombreInput.value.trim();
    const email = emailInput.value.trim();
    const telefono = telefonoInput.value.trim();
    const mensaje = mensajeInput.value.trim();
    
    // Client-side validation - only check the 4 required fields
    if (!nombre || !email || !telefono || !mensaje) {
        alert('Por favor, completa todos los campos del formulario.');
        // Mark empty fields with red border
        [nombreInput, emailInput, telefonoInput, mensajeInput].forEach(input => {
            if (!input.value.trim()) {
                input.style.borderColor = '#ff6b6b';
            }
        });
        return;
    } else {
        // Reset border colors
        [nombreInput, emailInput, telefonoInput, mensajeInput].forEach(input => {
            input.style.borderColor = 'var(--border-color)';
        });
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
        body: JSON.stringify({ nombre, email, telefono, mensaje })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            this.reset();
            [nombreInput, emailInput, telefonoInput, mensajeInput].forEach(input => {
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

// VIP Form submission
const vipForm = document.querySelector('#vipForm');
if (vipForm) {
    vipForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nombreInput = this.querySelector('input[placeholder="Tu nombre"]');
        const emailInput = this.querySelector('input[placeholder="Tu correo"]');
        const whatsappInput = this.querySelector('input[placeholder="Tu WhatsApp"]');
        const boletosSelect = this.querySelector('#boletosSelect');
        const nombre = nombreInput.value.trim();
        const email = emailInput.value.trim();
        const whatsapp = whatsappInput.value.trim();
        const boletos = boletosSelect.value;
        
        // Client-side validation
        let isValid = true;
        const fields = [
            { element: nombreInput, value: nombre },
            { element: emailInput, value: email },
            { element: whatsappInput, value: whatsapp },
            { element: boletosSelect, value: boletos }
        ];

        fields.forEach(field => {
            if (!field.value) {
                isValid = false;
                field.element.style.borderColor = '#ff6b6b';
            } else {
                field.element.style.borderColor = 'var(--border-color)';
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

        fetch('https://monkey-ranch-api.onrender.com/api/vip', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nombre, email, whatsapp, boletos })
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
            alert('Error al enviar el formulario. Por favor, intenta de nuevo.');
        })
        .finally(() => {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        });
    });
}

// Flyer section background on scroll
const heroSection = document.querySelector('.hero');
const flyerSection = document.querySelector('.flyer-section');

if (heroSection && flyerSection) {
    window.addEventListener('scroll', function() {
        const heroRect = heroSection.getBoundingClientRect();
        const flyerRect = flyerSection.getBoundingClientRect();
        
        // Cuando flyer llega al 50% del hero
        const heroMidpoint = heroRect.top + (heroRect.height * 0.5);
        
        if (flyerRect.top <= heroMidpoint) {
            flyerSection.classList.add('dark-background');
        } else {
            flyerSection.classList.remove('dark-background');
        }
    });
}

// VIP Carousel functionality
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const vipCards = document.querySelectorAll('.vip-card');
let currentCardIndex = 0;

function updateCarousel() {
    vipCards.forEach((card, index) => {
        card.classList.remove('active');
        if (index === currentCardIndex) {
            card.classList.add('active');
        }
    });
}

function nextCard() {
    currentCardIndex = (currentCardIndex + 1) % vipCards.length;
    updateCarousel();
}

function prevCard() {
    currentCardIndex = (currentCardIndex - 1 + vipCards.length) % vipCards.length;
    updateCarousel();
}

if (prevBtn && nextBtn) {
    prevBtn.addEventListener('click', prevCard);
    nextBtn.addEventListener('click', nextCard);
    
    // Auto-change cards every 6 seconds
    setInterval(nextCard, 6000);
}

// VIP Form show/hide functionality
const vipFormElement = document.getElementById('vipForm');
const comprarBtns = document.querySelectorAll('.vip-card .cta-button');

comprarBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
        e.preventDefault();
        vipFormElement.classList.add('show');
        // Scroll to form
        vipFormElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});

console.log('Monkey Ranch website loaded successfully!');

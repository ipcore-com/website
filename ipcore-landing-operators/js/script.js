// IPcore Landing Page - JavaScript Funcional
// Incluye navegación suave y formulario con validación

document.addEventListener('DOMContentLoaded', function() {
    // Navegación suave
    initSmoothNavigation();
    
    // Formulario de contacto
    initContactForm();
});

// Navegación suave
function initSmoothNavigation() {
    // Manejar enlaces con href="#..."
    const navLinks = document.querySelectorAll('a[href^="#"]');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Manejar botones con data-scroll-to
    const scrollButtons = document.querySelectorAll('[data-scroll-to]');

    scrollButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();

            const targetId = this.getAttribute('data-scroll-to');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const targetPosition = targetSection.offsetTop - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// Formulario de contacto
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = form.querySelector('.form-submit-btn');
    const statusDiv = document.getElementById('formStatus');
    
    // Validación en tiempo real
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
    
    // Envío del formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm()) {
            submitForm();
        }
    });
    
    function validateField(e) {
        const field = e.target;
        const fieldGroup = field.closest('.form-group');
        
        // Limpiar errores previos
        fieldGroup.classList.remove('error');
        
        // Validar campo
        if (field.hasAttribute('required') && !field.value.trim()) {
            showFieldError(fieldGroup, 'Este campo es obligatorio');
            return false;
        }
        
        if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
            showFieldError(fieldGroup, 'Por favor, introduce un email válido');
            return false;
        }
        
        // Campo válido
        fieldGroup.classList.add('success');
        return true;
    }
    
    function clearFieldError(e) {
        const fieldGroup = e.target.closest('.form-group');
        fieldGroup.classList.remove('error');
    }
    
    function showFieldError(fieldGroup, message) {
        fieldGroup.classList.add('error');
        
        // Remover mensaje de error previo
        const existingError = fieldGroup.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Agregar nuevo mensaje de error
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        fieldGroup.appendChild(errorDiv);
    }
    
    function validateForm() {
        let isValid = true;
        
        // Validar campos requeridos
        inputs.forEach(input => {
            if (!validateField({ target: input })) {
                isValid = false;
            }
        });
        
        return isValid;
    }
    
    async function submitForm() {
        // Cambiar estado del botón
        const originalText = submitBtn.querySelector('.btn-text').textContent;
        submitBtn.querySelector('.btn-text').textContent = 'Enviando...';
        submitBtn.disabled = true;

        try {
            // Envío real a Formspree
            const formData = new FormData(form);
            const response = await fetch(form.action, {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                showStatus('success', '¡Mensaje enviado correctamente! Nos pondremos en contacto contigo pronto.', true);
                form.reset();

                // Limpiar estados de validación
                form.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('success', 'error');
                });
            } else {
                const data = await response.json();
                if (data.errors) {
                    showStatus('error', 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
                } else {
                    showStatus('error', 'Error al enviar el mensaje. Por favor, inténtalo de nuevo.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showStatus('error', 'Error de conexión. Por favor, verifica tu conexión a internet e inténtalo de nuevo.');
        } finally {
            // Restaurar botón
            submitBtn.querySelector('.btn-text').textContent = originalText;
            submitBtn.disabled = false;
        }
    }
    
    function showStatus(type, message, permanent = false) {
        statusDiv.className = `form-status ${type}`;
        statusDiv.textContent = message;
        statusDiv.style.display = 'block';

        // Solo ocultar después de 5 segundos si no es permanente
        if (!permanent) {
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 5000);
        }
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}


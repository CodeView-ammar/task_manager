/**
 * Main JavaScript file for the Daily Task Manager application
 */

// Set current year in the footer
document.addEventListener('DOMContentLoaded', function() {
    const currentYear = new Date().getFullYear();
    const footerYear = document.getElementById('current-year');
    if (footerYear) {
        footerYear.textContent = currentYear;
    }
    
    // Initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // Initialize popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
    
    // Add Arabic calendar support for datetime inputs
    const datetimeInputs = document.querySelectorAll('input[type="datetime-local"]');
    datetimeInputs.forEach(input => {
        input.setAttribute('lang', 'ar');
    });
    
    // Handle form errors display
    const showFormError = (form, message) => {
        let errorElement = form.querySelector('.error-message');
        
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'alert alert-danger mt-3 error-message';
            form.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    };
    
    // Clear form errors
    const clearFormError = (form) => {
        const errorElement = form.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    };
    
    // Submit form with AJAX and handle response
    const ajaxSubmit = (form, url, method, successCallback) => {
        clearFormError(form);
        
        const formData = new FormData(form);
        const data = {};
        
        formData.forEach((value, key) => {
            if (key !== 'csrfmiddlewaretoken') {
                data[key] = value;
            }
        });
        
        fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': formData.get('csrfmiddlewaretoken')
            },
            body: JSON.stringify(data),
            credentials: 'same-origin'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(data => Promise.reject(data));
            }
            return response.json();
        })
        .then(data => {
            if (typeof successCallback === 'function') {
                successCallback(data);
            }
        })
        .catch(error => {
            console.error('Form submission error:', error);
            let errorMessage = '';
            
            if (typeof error === 'object') {
                // If error is an object with field-specific errors
                const errorMessages = [];
                for (const [field, fieldErrors] of Object.entries(error)) {
                    if (Array.isArray(fieldErrors)) {
                        errorMessages.push(`${field}: ${fieldErrors.join(', ')}`);
                    } else {
                        errorMessages.push(`${field}: ${fieldErrors}`);
                    }
                }
                errorMessage = errorMessages.join('<br>');
            } else {
                errorMessage = error.toString();
            }
            
            showFormError(form, errorMessage);
        });
    };
    
    // Optional: Expose global utility functions
    window.taskManagerUtils = {
        showFormError,
        clearFormError,
        ajaxSubmit
    };
});
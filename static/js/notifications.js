// Notifications handler for daily tasks application

// DOM Elements
let notificationDropdown;
let notificationIndicator;
let notificationContainer;
let emptyNotification;

const NOTIFICATION_CHECK_INTERVAL = 60000; // Check for notifications every minute

// Function to check for new notifications
async function checkNotifications() {
    try {
        const response = await fetch('/api/notifications/');
        
        if (!response.ok) {
            if (response.status === 401) {
                // User is not authenticated
                console.log('User not authenticated');
                return;
            }
            throw new Error(`Failed to fetch notifications: ${response.status}`);
        }
        
        const notifications = await response.json();
        
        // Process and display each notification
        notifications.forEach(notification => {
            displayNotification(notification);
        });
        
    } catch (error) {
        console.error('Error checking notifications:', error);
    }
}

// Function to display a notification
function displayNotification(notification) {
    // Always add to dropdown
    addNotificationToDropdown(notification);
    
    // Check if browser supports notifications
    if (!('Notification' in window)) {
        console.log('This browser does not support desktop notifications');
        // Fall back to displaying an in-app notification
        showInAppNotification(notification);
        return;
    }
    
    // Check if we already have permission
    if (Notification.permission === 'granted') {
        createBrowserNotification(notification);
    } 
    // Otherwise, we need to ask the user for permission
    else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                createBrowserNotification(notification);
            } else {
                // Fall back to in-app notification
                showInAppNotification(notification);
            }
        });
    } else {
        // Permission denied, fall back to in-app notification
        showInAppNotification(notification);
    }
}

// Create a browser notification
function createBrowserNotification(notification) {
    const notificationOptions = {
        body: notification.description || 'Click to view details',
        icon: '/static/images/notification-icon.png', // Use your app icon
        dir: 'rtl', // For RTL languages
    };
    
    const notificationInstance = new Notification(notification.title, notificationOptions);
    
    // Handle notification click
    notificationInstance.onclick = function() {
        // Redirect to the relevant task sheet
        window.open(`/task-sheet/${getDateFromISOString(notification.datetime)}/`, '_blank');
        notificationInstance.close();
    };
}

// Display in-app notification for browsers that don't support notifications
// or when permission is denied
function showInAppNotification(notification) {
    // Create notification element
    const notificationEl = document.createElement('div');
    notificationEl.className = 'in-app-notification';
    notificationEl.innerHTML = `
        <div class="notification-header">
            <h4>${notification.title}</h4>
            <button class="close-btn">&times;</button>
        </div>
        <div class="notification-body">
            <p>${notification.description || ''}</p>
            <p class="notification-time">${formatDateTime(notification.datetime)}</p>
        </div>
    `;
    
    // Add to notification container (create if doesn't exist)
    let notificationContainer = document.getElementById('notification-container');
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    notificationContainer.appendChild(notificationEl);
    
    // Handle close button click
    const closeBtn = notificationEl.querySelector('.close-btn');
    closeBtn.addEventListener('click', () => {
        notificationContainer.removeChild(notificationEl);
    });
    
    // Auto-remove after 10 seconds
    setTimeout(() => {
        if (notificationEl.parentNode === notificationContainer) {
            notificationContainer.removeChild(notificationEl);
        }
    }, 10000);
    
    // Handle notification click
    notificationEl.addEventListener('click', (e) => {
        if (e.target !== closeBtn) {
            window.location.href = `/task-sheet/${getDateFromISOString(notification.datetime)}/`;
        }
    });
}

// Helper function to format date time in a user-friendly format
function formatDateTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleString();
}

// Helper function to extract date part from ISO string
function getDateFromISOString(isoString) {
    const date = new Date(isoString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
}

// Add notification to dropdown menu
function addNotificationToDropdown(notification) {
    // Make notification indicator visible
    notificationIndicator.classList.remove('d-none');
    
    // Hide empty notification message if it exists
    if (emptyNotification) {
        emptyNotification.classList.add('d-none');
    }
    
    // Create notification item
    const notificationItem = document.createElement('div');
    notificationItem.className = 'dropdown-item notification-item';
    notificationItem.dataset.id = notification.id;
    
    // Format the notification content
    notificationItem.innerHTML = `
        <div class="d-flex align-items-center">
            <div class="mr-3">
                <i class="fas fa-bell text-primary"></i>
            </div>
            <div class="small w-100">
                <div class="fw-bold">${notification.title}</div>
                <div>${notification.description || ''}</div>
                <div class="text-muted text-start">${formatDateTime(notification.datetime)}</div>
            </div>
        </div>
    `;
    
    // Add click event to redirect to task sheet
    notificationItem.addEventListener('click', () => {
        window.location.href = `/task-sheet/${getDateFromISOString(notification.datetime)}/`;
    });
    
    // Add to container
    notificationContainer.prepend(notificationItem);
    
    // Limit number of notifications in dropdown (keep most recent 5)
    const items = notificationContainer.querySelectorAll('.notification-item');
    if (items.length > 5) {
        for (let i = 5; i < items.length; i++) {
            notificationContainer.removeChild(items[i]);
        }
    }
}

// Initialize the notifications
function initNotifications() {
    // Get DOM elements
    notificationDropdown = document.getElementById('notificationDropdown');
    notificationIndicator = document.querySelector('.notification-indicator');
    notificationContainer = document.querySelector('.notification-container');
    emptyNotification = document.querySelector('.empty-notification');
    
    // Initial check for notifications
    checkNotifications();
    
    // Set up periodic checks
    setInterval(checkNotifications, NOTIFICATION_CHECK_INTERVAL);
}

// Start checking for notifications when the page loads
document.addEventListener('DOMContentLoaded', initNotifications);

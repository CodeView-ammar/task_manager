from datetime import datetime, timedelta
from django.utils import timezone
from .models import Reminder

def check_reminders():
    """Check for reminders that need to send notifications"""
    now = timezone.now()
    
    # Find reminders that are due to send notifications
    reminders = Reminder.objects.filter(
        notification_sent=False,
        completed=False
    )
    
    notifications_to_send = []
    
    for reminder in reminders:
        # Calculate when the notification should be sent based on notify_before
        minutes_before = int(reminder.notify_before)
        notification_time = reminder.datetime - timedelta(minutes=minutes_before)
        
        # If it's time to send the notification
        if now >= notification_time:
            notifications_to_send.append(reminder)
            reminder.notification_sent = True
            reminder.save()
    
    return notifications_to_send

def send_notification(reminder):
    """Send notification to the user"""
    # In a real application, this would send an email, push notification, or SMS
    # For this example, we'll just print to console
    print(f"NOTIFICATION: {reminder.title} - {reminder.datetime}")
    
    # You can implement various notification methods here:
    # - Email notifications
    # - Browser push notifications
    # - Mobile app notifications
    
    # Example for browser notifications (to be used in the frontend JavaScript):
    # We'll create a JSON structure that can be sent to the client
    notification_data = {
        'id': reminder.id,
        'title': reminder.title,
        'description': reminder.description or '',
        'datetime': reminder.datetime.isoformat(),
        'task_sheet_id': reminder.task_sheet_id,
        'priority_id': reminder.priority_id,
        'todo_id': reminder.todo_id,
    }
    
    return notification_data

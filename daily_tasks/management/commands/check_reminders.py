import time
from django.core.management.base import BaseCommand
from daily_tasks.notifications import check_reminders, send_notification

class Command(BaseCommand):
    help = 'Check for reminders that need to send notifications'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--interval',
            type=int,
            default=60,
            help='Check interval in seconds'
        )
        
        parser.add_argument(
            '--oneshot',
            action='store_true',
            help='Run once and exit'
        )
    
    def handle(self, *args, **options):
        interval = options['interval']
        oneshot = options['oneshot']
        
        self.stdout.write(self.style.SUCCESS(f'Starting reminder check service'))
        
        try:
            while True:
                # Get reminders that need notifications
                pending_reminders = check_reminders()
                
                # Process notifications
                for reminder in pending_reminders:
                    notification_data = send_notification(reminder)
                    self.stdout.write(
                        self.style.SUCCESS(
                            f'Notification sent: {notification_data["title"]} at {notification_data["datetime"]}'
                        )
                    )
                
                if oneshot:
                    break
                
                # Wait for the next interval
                time.sleep(interval)
                
        except KeyboardInterrupt:
            self.stdout.write(self.style.WARNING('\nStopping reminder check service'))

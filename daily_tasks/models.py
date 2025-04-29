from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class TaskSheet(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_sheets')
    date = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['user', 'date']
    
    def __str__(self):
        return f"{self.user.username}'s tasks for {self.date}"

class Priority(models.Model):
    task_sheet = models.ForeignKey(TaskSheet, on_delete=models.CASCADE, related_name='priorities')
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    order = models.SmallIntegerField(default=0)
    
    class Meta:
        verbose_name_plural = 'Priorities'
        ordering = ['order']
    
    def __str__(self):
        return self.title

class Todo(models.Model):
    task_sheet = models.ForeignKey(TaskSheet, on_delete=models.CASCADE, related_name='todos')
    priority = models.ForeignKey('Priority', on_delete=models.SET_NULL, related_name='related_todos', null=True, blank=True)
    title = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    order = models.SmallIntegerField(default=0)
    
    class Meta:
        ordering = ['order']
    
    def __str__(self):
        return self.title

class Note(models.Model):
    task_sheet = models.ForeignKey(TaskSheet, on_delete=models.CASCADE, related_name='notes')
    priority = models.ForeignKey('Priority', on_delete=models.SET_NULL, related_name='related_notes', null=True, blank=True)
    todo = models.ForeignKey('Todo', on_delete=models.SET_NULL, related_name='related_notes', null=True, blank=True)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Note for {self.task_sheet}"

class Learning(models.Model):
    task_sheet = models.ForeignKey(TaskSheet, on_delete=models.CASCADE, related_name='learnings')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Learning for {self.task_sheet}"

class Reminder(models.Model):
    NOTIFICATION_CHOICES = [
        ('5', '5 دقائق'),
        ('15', '15 دقيقة'),
        ('30', '30 دقيقة'),
        ('60', 'ساعة واحدة'),
        ('1440', 'يوم واحد'),
    ]
    
    task_sheet = models.ForeignKey(TaskSheet, on_delete=models.CASCADE, related_name='reminders')
    priority = models.ForeignKey('Priority', on_delete=models.SET_NULL, related_name='related_reminders', null=True, blank=True)
    todo = models.ForeignKey('Todo', on_delete=models.SET_NULL, related_name='related_reminders', null=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    datetime = models.DateTimeField()
    notify_before = models.CharField(max_length=10, choices=NOTIFICATION_CHOICES, default='15') # Minutes before
    notification_sent = models.BooleanField(default=False)
    completed = models.BooleanField(default=False)
    
    def __str__(self):
        return self.title
        
    class Meta:
        ordering = ['datetime']

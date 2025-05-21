from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TaskSheet, Priority, Todo, Note, Learning, Reminder, DailyTask

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']

class PrioritySerializer(serializers.ModelSerializer):
    class Meta:
        model = Priority
        fields = ['id', 'title', 'completed', 'order']
        read_only_fields = ['id']

class TodoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Todo
        fields = ['id', 'title', 'completed', 'order', 'priority']
        read_only_fields = ['id']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'content', 'created_at', 'priority', 'todo']
        read_only_fields = ['id', 'created_at']

class LearningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learning
        fields = ['id', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'title', 'description', 'datetime', 'notify_before', 'notification_sent', 'completed', 'priority', 'todo']
        read_only_fields = ['id', 'notification_sent']

class TaskSheetSerializer(serializers.ModelSerializer):
    priorities = PrioritySerializer(many=True, read_only=True)
    todos = TodoSerializer(many=True, read_only=True)
    notes = NoteSerializer(many=True, read_only=True)
    learnings = LearningSerializer(many=True, read_only=True)
    reminders = ReminderSerializer(many=True, read_only=True)
    
    class Meta:
        model = TaskSheet
        fields = ['id', 'user', 'date', 'priorities', 'todos', 'notes', 'learnings', 'reminders', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class UserRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    password_confirm = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm', 'first_name', 'last_name']
        
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(**validated_data)
        return user

class DailyTaskSerializer(serializers.ModelSerializer):
    priority_label = serializers.SerializerMethodField()
    status_label = serializers.SerializerMethodField()
    task_time_display = serializers.SerializerMethodField()
    
    class Meta:
        model = DailyTask
        fields = ['id', 'name', 'priority', 'priority_label', 'task_time', 'task_time_display', 
                  'description', 'status', 'status_label', 'task_date', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_priority_label(self, obj):
        return dict(DailyTask.PRIORITY_CHOICES).get(obj.priority)
    
    def get_status_label(self, obj):
        return dict(DailyTask.STATUS_CHOICES).get(obj.status)
    
    def get_task_time_display(self, obj):
        return obj.task_time.strftime('%H:%M') if obj.task_time else ''

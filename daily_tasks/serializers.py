from rest_framework import serializers
from django.contrib.auth.models import User
from .models import TaskSheet, Priority, Todo, Note, Learning, Reminder

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
        fields = ['id', 'title', 'completed', 'order']
        read_only_fields = ['id']

class NoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Note
        fields = ['id', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class LearningSerializer(serializers.ModelSerializer):
    class Meta:
        model = Learning
        fields = ['id', 'content', 'created_at']
        read_only_fields = ['id', 'created_at']

class ReminderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reminder
        fields = ['id', 'title', 'datetime', 'completed']
        read_only_fields = ['id']

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

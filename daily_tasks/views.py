from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from datetime import datetime

from .models import TaskSheet, Priority, Todo, Note, Learning, Reminder
from .serializers import (
    UserSerializer, TaskSheetSerializer, PrioritySerializer,
    TodoSerializer, NoteSerializer, LearningSerializer,
    ReminderSerializer, UserRegistrationSerializer
)

# HTML Template Views

def index(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'daily_tasks/index.html')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'daily_tasks/register.html')

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    return render(request, 'daily_tasks/login.html')

@login_required
def dashboard(request):
    today = datetime.now().date()
    return render(request, 'daily_tasks/dashboard.html', {'today': today})

@login_required
def task_sheet_view(request, date=None):
    if date:
        try:
            date_obj = datetime.strptime(date, "%Y-%m-%d").date()
        except ValueError:
            return redirect('dashboard')
    else:
        date_obj = datetime.now().date()
        
    return render(request, 'daily_tasks/task_sheet.html', {'date': date_obj})

@login_required
def history_view(request):
    return render(request, 'daily_tasks/history.html')

@login_required
def profile_view(request):
    return render(request, 'daily_tasks/profile.html')

# API Views

@api_view(['POST'])
def register_api(request):
    serializer = UserRegistrationSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        login(request, user)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    user = authenticate(username=username, password=password)
    if user:
        login(request, user)
        return Response(UserSerializer(user).data)
    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_api(request):
    logout(request)
    return Response(status=status.HTTP_200_OK)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_user_data(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_sheet_list_api(request):
    user = request.user
    
    if request.method == 'GET':
        task_sheets = TaskSheet.objects.filter(user=user)
        serializer = TaskSheetSerializer(task_sheets, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TaskSheetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def task_sheet_date_api(request, date):
    user = request.user
    
    try:
        date_obj = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        return Response({"error": "Invalid date format. Use YYYY-MM-DD."}, status=status.HTTP_400_BAD_REQUEST)
    
    task_sheet, created = TaskSheet.objects.get_or_create(user=user, date=date_obj)
    
    if request.method == 'GET':
        serializer = TaskSheetSerializer(task_sheet)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TaskSheetSerializer(task_sheet, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# Priority views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def priority_list_api(request, task_sheet_id):
    task_sheet = get_object_or_404(TaskSheet, id=task_sheet_id, user=request.user)
    
    if request.method == 'GET':
        priorities = Priority.objects.filter(task_sheet=task_sheet)
        serializer = PrioritySerializer(priorities, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = PrioritySerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task_sheet=task_sheet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def priority_detail_api(request, pk):
    priority = get_object_or_404(Priority, id=pk, task_sheet__user=request.user)
    
    if request.method == 'GET':
        serializer = PrioritySerializer(priority)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PrioritySerializer(priority, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        priority.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Todo views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def todo_list_api(request, task_sheet_id):
    task_sheet = get_object_or_404(TaskSheet, id=task_sheet_id, user=request.user)
    
    if request.method == 'GET':
        todos = Todo.objects.filter(task_sheet=task_sheet)
        serializer = TodoSerializer(todos, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = TodoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task_sheet=task_sheet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def todo_detail_api(request, pk):
    todo = get_object_or_404(Todo, id=pk, task_sheet__user=request.user)
    
    if request.method == 'GET':
        serializer = TodoSerializer(todo)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = TodoSerializer(todo, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        todo.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Note views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def note_list_api(request, task_sheet_id):
    task_sheet = get_object_or_404(TaskSheet, id=task_sheet_id, user=request.user)
    
    if request.method == 'GET':
        notes = Note.objects.filter(task_sheet=task_sheet)
        serializer = NoteSerializer(notes, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = NoteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task_sheet=task_sheet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def note_detail_api(request, pk):
    note = get_object_or_404(Note, id=pk, task_sheet__user=request.user)
    
    if request.method == 'GET':
        serializer = NoteSerializer(note)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = NoteSerializer(note, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        note.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Learning views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def learning_list_api(request, task_sheet_id):
    task_sheet = get_object_or_404(TaskSheet, id=task_sheet_id, user=request.user)
    
    if request.method == 'GET':
        learnings = Learning.objects.filter(task_sheet=task_sheet)
        serializer = LearningSerializer(learnings, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = LearningSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task_sheet=task_sheet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def learning_detail_api(request, pk):
    learning = get_object_or_404(Learning, id=pk, task_sheet__user=request.user)
    
    if request.method == 'GET':
        serializer = LearningSerializer(learning)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = LearningSerializer(learning, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        learning.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# Reminder views
@api_view(['GET', 'POST'])
@permission_classes([IsAuthenticated])
def reminder_list_api(request, task_sheet_id):
    task_sheet = get_object_or_404(TaskSheet, id=task_sheet_id, user=request.user)
    
    if request.method == 'GET':
        reminders = Reminder.objects.filter(task_sheet=task_sheet)
        serializer = ReminderSerializer(reminders, many=True)
        return Response(serializer.data)
    
    elif request.method == 'POST':
        serializer = ReminderSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task_sheet=task_sheet)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PUT', 'DELETE'])
@permission_classes([IsAuthenticated])
def reminder_detail_api(request, pk):
    reminder = get_object_or_404(Reminder, id=pk, task_sheet__user=request.user)
    
    if request.method == 'GET':
        serializer = ReminderSerializer(reminder)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = ReminderSerializer(reminder, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    elif request.method == 'DELETE':
        reminder.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

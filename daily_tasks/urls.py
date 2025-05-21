from django.urls import path
from . import views

urlpatterns = [
    # HTML Template URLs
    path('', views.index, name='index'),
    path('register/', views.register_view, name='register'),
    path('login/', views.login_view, name='login'),
    path('dashboard/', views.dashboard, name='dashboard'),
    path('task-sheet/', views.task_sheet_view, name='task_sheet'),
    path('task-sheet/<str:date>/', views.task_sheet_view, name='task_sheet_date'),
    path('history/', views.history_view, name='history'),
    path('profile/', views.profile_view, name='profile'),
    
    # API URLs
    path('api/register/', views.register_api, name='api_register'),
    path('api/login/', views.login_api, name='api_login'),
    path('api/logout/', views.logout_api, name='api_logout'),
    path('api/user/', views.get_user_data, name='api_user_data'),
     
    # TaskSheet API
    path('api/task-sheets/', views.task_sheet_list_api, name='api_task_sheet_list'),
    path('api/task-sheets/<str:date>/', views.task_sheet_date_api, name='api_task_sheet_date'),
    
    # Priority API
    path('api/task-sheets/<int:task_sheet_id>/priorities/', views.priority_list_api, name='api_priority_list'),
    path('api/priorities/<int:pk>/', views.priority_detail_api, name='api_priority_detail'),
    
    # Todo API
    path('api/task-sheets/<int:task_sheet_id>/todos/', views.todo_list_api, name='api_todo_list'),
    path('api/todos/<int:pk>/', views.todo_detail_api, name='api_todo_detail'),
    
    # Note API
    path('api/task-sheets/<int:task_sheet_id>/notes/', views.note_list_api, name='api_note_list'),
    path('api/notes/<int:pk>/', views.note_detail_api, name='api_note_detail'),
    
    # Learning API
    path('api/task-sheets/<int:task_sheet_id>/learnings/', views.learning_list_api, name='api_learning_list'),
    path('api/learnings/<int:pk>/', views.learning_detail_api, name='api_learning_detail'),
    
    # Reminder API
    path('api/task-sheets/<int:task_sheet_id>/reminders/', views.reminder_list_api, name='api_reminder_list'),
    path('api/reminders/<int:pk>/', views.reminder_detail_api, name='api_reminder_detail'),
    
    # Daily Tasks API
    path('api/daily-tasks/', views.daily_tasks_api, name='api_daily_tasks'),
    path('api/daily-tasks/<int:pk>/', views.daily_task_detail_api, name='api_daily_task_detail'),
    path('api/daily-tasks/<int:pk>/status/', views.daily_task_status_api, name='api_daily_task_status'),
    
    # Notifications API
    path('api/notifications/', views.notifications_api, name='api_notifications'),
    
    # Daily Tasks HTML Pages
    path('daily-tasks/', views.daily_task_list, name='daily_task_list'),
    path('daily-tasks/create/', views.daily_task_create, name='daily_task_create'),
    path('daily-tasks/<int:pk>/update-status/', views.daily_task_update_status, name='daily_task_update_status'),
]
from django.contrib import admin
from .models import TaskSheet, Priority, Todo, Note, Learning, Reminder

@admin.register(TaskSheet)
class TaskSheetAdmin(admin.ModelAdmin):
    list_display = ('user', 'date', 'created_at', 'updated_at')
    list_filter = ('user', 'date')
    search_fields = ('user__username', 'date')

@admin.register(Priority)
class PriorityAdmin(admin.ModelAdmin):
    list_display = ('title', 'task_sheet', 'completed', 'order')
    list_filter = ('completed', 'task_sheet__date')
    search_fields = ('title', 'task_sheet__user__username')

@admin.register(Todo)
class TodoAdmin(admin.ModelAdmin):
    list_display = ('title', 'task_sheet', 'completed', 'order')
    list_filter = ('completed', 'task_sheet__date')
    search_fields = ('title', 'task_sheet__user__username')

@admin.register(Note)
class NoteAdmin(admin.ModelAdmin):
    list_display = ('task_sheet', 'content_preview', 'created_at')
    list_filter = ('task_sheet__date',)
    search_fields = ('content', 'task_sheet__user__username')
    
    def content_preview(self, obj):
        return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'

@admin.register(Learning)
class LearningAdmin(admin.ModelAdmin):
    list_display = ('task_sheet', 'content_preview', 'created_at')
    list_filter = ('task_sheet__date',)
    search_fields = ('content', 'task_sheet__user__username')
    
    def content_preview(self, obj):
        return f"{obj.content[:50]}..." if len(obj.content) > 50 else obj.content
    content_preview.short_description = 'Content'

@admin.register(Reminder)
class ReminderAdmin(admin.ModelAdmin):
    list_display = ('title', 'task_sheet', 'datetime', 'completed')
    list_filter = ('completed', 'datetime', 'task_sheet__date')
    search_fields = ('title', 'task_sheet__user__username')
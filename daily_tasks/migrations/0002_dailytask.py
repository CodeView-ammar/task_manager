from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('auth', '0012_alter_user_first_name_max_length'),
        ('daily_tasks', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='DailyTask',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, verbose_name='اسم المهمة')),
                ('priority', models.CharField(choices=[('low', 'منخفضة'), ('medium', 'متوسطة'), ('high', 'عالية')], default='medium', max_length=10, verbose_name='الأولوية')),
                ('task_time', models.TimeField(verbose_name='وقت المهمة')),
                ('description', models.TextField(verbose_name='وصف المهمة')),
                ('status', models.CharField(choices=[('pending', 'قيد الانتظار'), ('accepted', 'مقبولة'), ('rejected', 'مرفوضة')], default='pending', max_length=10, verbose_name='الحالة')),
                ('task_date', models.DateField(verbose_name='تاريخ المهمة')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='daily_tasks', to='auth.user')),
            ],
            options={
                'verbose_name': 'المهمة اليومية',
                'verbose_name_plural': 'المهام اليومية',
                'ordering': ['task_date', 'task_time'],
            },
        ),
    ]
from typing import Any
from django.contrib import admin
from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import redirect
from .models import *
from django.db import connections , models 
from .scripts import query_table , delete_table , delete_logs
from django.urls import path
import pandas as pd
from django.urls import reverse
# Register your models here.
admin.site.disable_action('delete_selected')

admin.site.register(SystemsInfo)
admin.site.register(LogsContent)
admin.site.register(LogsInfo)

class TasksInfoAdmin(admin.ModelAdmin):
    actions = ['Delete']
    def get_queryset(self, request):
        admin_user = request.user
        if admin_user.is_superuser:
            return super().get_queryset(request)
        else:
            queryset = super().get_queryset(request)
            queryset = queryset.filter(post_user=admin_user.username)
            return queryset
    def Delete(self, request, queryset):
        count = len(queryset)
        for task in queryset:
            table_name = task.perfy_matrix
            connection = connections["PerfyMatrix"]
            data = query_table(connection,table_name)
            if "log_id" in data.columns:
                for id in data["log_id"].unique():
                    delete_logs(log_id=int(id)) 
            delete_table(connection,table_name)
        queryset.delete()
        self.message_user(request, f'Your custom action was applied to {count} object(s). with {request.method} ')
    Delete.short_description = 'Delete Whole Task'


admin.site.register(TasksInfo, TasksInfoAdmin)
class VirtualModel(models.Model):
    class Meta:
        abstract = True
        managed = False


# class YourModelAdmin(admin.ModelAdmin):

#     @staff_member_required
#     def your_custom_button(self, obj):
#         # 获取自定义按钮的URL
#         url = reverse('admin:admin_custom_button')
#         return f'<a href="{url}" class="button">访问自定义网站</a>'
#     your_custom_button.short_description = '自定义按钮'
#     def get_urls(self):
#         urls = super().get_urls()
#         custom_urls = [
#             path('manage/', self.admin_site.admin_view(self.your_custom_button), name='admin_custom_button'),
#         ]
#         return custom_urls + urls

# class ManageModel(VirtualModel):
#     id = models.AutoField(primary_key=True)
#     class Meta:
#         managed = False

# admin.site.register(ManageModel, YourModelAdmin)
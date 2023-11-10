"""
This module contains Django models for the database tables used in the Perfy application.

- SystemsInfo: Represents information about different systems.
- TasksInfo: Stores information about tasks performed in the application.
- LogsInfo: Contains information about logs.
- LogsContent: Stores content related to logs.
- Comment: Represents user comments on tasks.

Each model defines its own fields and relationships with other models to provide structured data storage and retrieval.
"""

from django.db import models

class SystemsInfo(models.Model):
    HOSTNAME = models.CharField(max_length=255)
    INTERFACE = models.CharField(max_length=255)
    SERVER_TYPE = models.CharField(max_length=255)
    SERVER = models.CharField(max_length=255)
    BIOS = models.CharField(max_length=255)
    CPU = models.TextField(max_length=None)
    MEMORY = models.CharField(max_length=255)
    HCA = models.CharField(max_length=255)
    HCA_FW = models.CharField(max_length=255)
    KERNEL = models.CharField(max_length=255)
    ILOM = models.CharField(max_length=255)
    IMAGE = models.CharField(max_length=255)
    OS = models.CharField(max_length=255)
    INTERFACE_INFO = models.TextField(max_length=None)

    class Meta:
        db_table = 'Systems_Info'
    def __str__(self):
        return f"{self.HOSTNAME}:{self.INTERFACE}"

class TasksInfo(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    task_category = models.CharField(max_length=255)
    task_name = models.CharField(max_length=255)
    task_system = models.CharField(max_length=1000)
    perfy_matrix = models.CharField(max_length=1000)
    html_template = models.CharField(max_length=1000)
    index_columns = models.TextField(max_length=None)
    best_values = models.TextField(max_length=None)
    post_user = models.TextField(max_length=None)

    class Meta:
        db_table = 'Tasks_Info'
    
    def __str__(self):
        return self.task_name
        
class LogsInfo(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    perfy_matrix = models.TextField(max_length=None)
    logs = models.TextField(max_length=None)
    marked = models.BooleanField(default=False)

    class Meta:
        db_table = 'Logs_Info'

    def __str__(self):
        return f"{self.perfy_matrix}__{str(self.id)}"
        
class LogsContent(models.Model):
    log_id = models.BigIntegerField()
    log_name = models.TextField(max_length=None)
    log_content = models.TextField(max_length=None)

    class Meta:
        db_table = 'Logs_Content'
    def __str__(self):
        return f"{self.log_id}________{self.log_name}"
    
    
class Comment(models.Model):
    task_id = models.IntegerField()
    post_user = models.TextField(max_length=None)
    comment = models.TextField(max_length=None)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'Comment'
        
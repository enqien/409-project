from django.shortcuts import render
import os
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse , JsonResponse
from django.db import connections
import pandas as pd
from bs4 import BeautifulSoup
import json
from django.conf import settings
import os , sys
from . import pandasArray_to_html
from ..models import Comment


 
def display_matrix(request,t_id,table_name,systems,template_name,index_columns,columns_to_display : list = "all"):
    """
    Displays a matrix of data from the specified table in the PerfyMatrix database.

    Parameters:
    - request: The HTTP request object.
    - t_id: The ID of the task.
    - table_name: The name of the table containing the data.
    - systems: A dictionary containing system information.
    - template_name: The name of the template to render.
    - index_columns: A list of columns to use as the index.
    - columns_to_display: A list of columns to display (default: "all" to display all columns).

    Returns:
    - request: The HTTP request object.
    - template_name: The name of the template.
    - data: A dictionary containing the data to be rendered in the template.
    """
    
    # Get the base URLsuch as http://nsn160-58:8000/
    base_url = request.build_absolute_uri('/')
    
    # Get the data from the database
    current_db = connections['PerfyMatrix']
    sql = f"SELECT * FROM `{table_name}`"
    df = pd.read_sql(sql, current_db)
    
    # Remove 'log_id' column if present and store its values separately
    log_id = list(df["log_id"]) if "log_id" in df else None
    df.drop("log_id",inplace=True,axis=1) if "log_id" in df.columns else None
    
    # Set the index columns
    df = df.set_index(index_columns)
    
    # Determine the columns to display
    all_feature_columns = df.columns.to_list()
    feature_columns = df.columns.to_list() if columns_to_display == "all" else columns_to_display
    df = df[feature_columns]
    
    # Convert DataFrame to HTML table
    data = pandasArray_to_html(df=df,columns=index_columns + feature_columns,log_id = log_id,base_url = base_url)
    
    # Retrieve system information from the database
    system_db = connections['default']
    systems_info = {}
    with system_db.cursor() as cursor:      
        for sys_name in systems:
            hostname , ifname = systems[sys_name]
            sql = f"SELECT * FROM Systems_Info where HOSTNAME = '{hostname}' and  INTERFACE = '{ifname}' "
            cursor.execute(sql)  # Replace 'your_table_name' with the actual name of your table
            systems_columns = [col[0] for col in cursor.description]
            system_info = cursor.fetchall()
            system_info = list(system_info[0])
            sys_result = {}
            for sys_col , sys_info in zip(systems_columns,system_info):
                sys_result[sys_col] = sys_info
            systems_info[sys_name] = sys_result
    
    # Retrieve comments associated with the task
    comments = Comment.objects.filter(task_id=t_id)
    
    # Prepare the data to be rendered in the template
    data = {
        "t_id" : t_id,
        "table_name" : table_name,
        "data" : data,
        "columns" : index_columns + feature_columns,
        "systems_info" : systems_info,
        "index_columns" : index_columns,
        "all_feature_columns" : all_feature_columns,
        "comments" : comments,
    }
    
    return request, template_name, data

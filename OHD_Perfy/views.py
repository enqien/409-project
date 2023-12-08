from django.shortcuts import render, redirect
import os , sys , json ,re, pymysql
from django.views.decorators.csrf import csrf_exempt
from .models import TasksInfo , SystemsInfo , LogsContent , LogsInfo , Comment
from django.shortcuts import get_object_or_404
from django.http import HttpResponse , JsonResponse , HttpResponseBadRequest
from django.contrib.admin.views.decorators import staff_member_required
from django.db import connections
from django.contrib.auth.models import User
import pandas as pd
from bs4 import BeautifulSoup
import numpy as np
from django.conf import settings
from .scripts.Readers import CSV_Reader , JSON_Reader
from .scripts.views import display_matrix
from .scripts import query_table, delete_table , delete_logs , pandasArray_to_html
from .utils import post_verification
from django.contrib.auth.hashers import check_password, make_password
from django.contrib.auth import login, logout


# Create your views here.

@csrf_exempt
@post_verification
def post_csv_data(request):
    """
    input json key : table_name , index_cols , feture_columns = {feature : "min" or "max" for find the best value}
    """ 
    csv_file = request.FILES['csv_file']
    df = pd.read_csv(csv_file,encoding="utf-8")
    connection = connections['PerfyMatrix']
    table_name , index_cols , feature_cols = request.POST.get("table_name") , request.POST.get("index_cols").split(",") , json.loads(request.POST.get("feature_cols"))
    
    # save csv to LOGS/table_name/result.csv
    path = os.path.join(settings.BASE_DIR,"LOGS",table_name)
    if not os.path.exists(path):
        os.makedirs(path)
    print(os.path.join(path,"result.csv"))
    df.to_csv(os.path.join(path,"result.csv"),index=None)

    # update it into the database
    csv_reader = CSV_Reader(database_connection=connection,data_frame=df,table_name=table_name,index_cols=index_cols)
    csv_reader.run()

    # get the best values
    maxvals = {}
    for col in feature_cols:
        best_value = df[col].max() if feature_cols[col] == "max" else df[col].min()
        row_with_best_value = df.loc[df[col] == best_value,index_cols].iloc[0]
        maxvals[col] = {"val" : best_value , "best_method":feature_cols[col],"attribute":{key : str(val) for key, val in row_with_best_value.to_dict().items()}}     
    response = {
        "response_code" : 200,
        "maxvals" : maxvals
    }
    response = json.dumps(response)   
    return HttpResponse(response)


@csrf_exempt
def post_logs(table_name:str,log_content:dict):
    """
    Handles the posting of logs to the server.

    Args:
        table_name (str): The name of the table to store the logs.
        log_content (dict): Dictionary containing log names as keys and log content as values.

    Returns:
        int: The ID of the newly created LogsInfo entry in the database.

    """
    log_names = ",".join(list(log_content.keys()))
    new_log_info = LogsInfo(perfy_matrix = table_name, logs=log_names)
    new_log_info.save()
    log_id = new_log_info.id
    for name , content in log_content.items():
        new_log_content = LogsContent(log_id=log_id,log_name = name,log_content = content)
        new_log_content.save()
    return log_id

@csrf_exempt
def post_dict_data(request):
    """
    Processes and stores JSON data received via POST request.

    Input JSON keys:
        - table_name: Name of the table.
        - index_cols: Comma-separated index column names.
        - feature_cols: Dictionary with feature column names as keys and "min" or "max" as values. Example: {feature : "min" or "max" for find the best value}
        - data: Dictionary with column names and corresponding values. Example: {column_name : value}
        - log_content: Dictionary with log names and content. Example: {log_name:content}

    Returns:
        - JSON response with response code and maxvals.

    """
    # Extract data from the request
    connection = connections['PerfyMatrix']
    table_name , index_cols , feature_cols = request.POST.get("table_name") , request.POST.get("index_cols").split(",") , json.loads(request.POST.get("feature_cols"))
    data , log_content = json.loads(request.POST.get("data")) , json.loads(request.POST.get("log_content"))
    
    # Post log content if available
    if log_content:
        log_id = post_logs(table_name = table_name , log_content=log_content)
        data["log_id"] = log_id
    # Update data into the database
    json_reader = JSON_Reader(database_connection=connection,json=data,table_name=table_name,index_cols=index_cols)
    json_reader.run()

    # Retrieve the best values
    maxvals = {}
    
    connection = connections['PerfyMatrix']
    query = f"SELECT * FROM {table_name}"
    df = pd.read_sql(query, connection)
    for col in feature_cols:
        best_value = df[col].max() if feature_cols[col] == "max" else df[col].min()
        row_with_best_value = df.loc[df[col] == best_value,index_cols].iloc[0]
        maxvals[col] = {"val" : best_value , "best_method":feature_cols[col],"attribute":{key : str(val) for key, val in row_with_best_value.to_dict().items()}}     
    # Prepare and return the JSON response
    response = {
        "response_code" : 200,
        "maxvals" : maxvals
    }
    response = json.dumps(response)   
    return HttpResponse(response)
    
    
@csrf_exempt
@post_verification
def post_data(request):
    if request.method == 'POST' and request.FILES.get('csv_file'):
        return post_csv_data(request=request)
    elif request.method == 'POST' and request.POST.get("data"):
        return post_dict_data(request=request)
    return HttpResponse('Please use `POST` or No CSV file or No data key found.')

@csrf_exempt
@post_verification
def insert_info(request,info_type):
    """
    Inserts information into the specified table (SystemsInfo or TasksInfo).

    Args:
        - request: HTTP request object.
        - info_type: Type of information to be inserted (SystemsInfo or TasksInfo).

    Returns:
        - HTTP response with the inserted data.

    """
    # Check the info_type parameter
    if info_type not in ["SystemsInfo","TasksInfo"]:
        return HttpResponseBadRequest(f'You are using {info_type}. please use `TasksInfo` or `SystemsInfo`')
    
    # Check the HTTP method
    if request.method != "POST":
        return HttpResponseBadRequest('Only acceopt POST method.')
    
    # Extract data from the POST request
    post_data = request.POST.dict()
    
    # Save the data based on the info_type
    if info_type == "TasksInfo":
        try:
            # Check if the task_name already exists
            new_data = TasksInfo.objects.get(task_name=post_data["task_name"])
            
             # Check the post_user if provided
            if "post_user" not in post_data or post_data["post_user"] != new_data.post_user:
                return HttpResponseBadRequest(f"post_user is {post_data['post_user']}, but the task is belong to {new_data.post_user}")
            
            # Update the best_values field
            new_data.best_values = post_data["best_values"]
        except:
            new_data = TasksInfo(**post_data)
    elif info_type == "SystemsInfo":
        new_data = SystemsInfo(**post_data)
        
    # Save the new_data object to the database
    new_data.save()

    return HttpResponse(str(post_data))

@csrf_exempt
@post_verification
def query_info(request, info_type):
    """
    Queries information from the specified table (SystemsInfo or TasksInfo).

    Args:
        - request: HTTP request object.
        - info_type: Type of information to be queried (SystemsInfo or TasksInfo).

    Returns:
        - HTTP response with the queried data.

    """
    # Check the info_type parameter
    if info_type not in ["SystemsInfo", "TasksInfo"]:
        return HttpResponseBadRequest(f'You are using {info_type}. Please use `TasksInfo` or `SystemsInfo`')

    # Check the HTTP method
    if request.method == "GET":
        if info_type not in ["SystemsInfo"]:
            return HttpResponse('Only accept GET method for SystemsInfo.')

        # Extract the host and ifname from the GET parameters
        host = request.GET.get('host')
        ifname = request.GET.get('ifname')

        # Check if host and ifname are provided
        if not host or not ifname:
            return HttpResponse(f'Check your host and ifname, host = {host}, ifname = {ifname}')

        # Perform the query and retrieve the data
        query_data = eval(info_type).objects.filter(HOSTNAME=host)

        # Construct the response string
        response = '\n'.join([str(i.__dict__) for i in query_data])

        return HttpResponse(response)

    if request.method != "POST":
        return HttpResponseBadRequest('Only accept POST method.')

    # Extract data from the POST request
    post_data = request.POST.dict()

    # Perform the query and retrieve the data
    query_data = eval(info_type).objects.filter(**post_data)

    # Construct the response string
    response = '\n'.join([str(i.__dict__) for i in query_data])

    return HttpResponse(response)

@csrf_exempt
@post_verification
def delete_info(request, info_type):
    """
    Deletes information from the specified table (TasksInfo, LogsInfo, or SystemsInfo).

    Args:
        - request: HTTP request object.
        - info_type: Type of information to be deleted (TasksInfo, LogsInfo, or SystemsInfo).

    Returns:
        - HTTP response indicating the result of the deletion.

    """
    # Check the info_type parameter
    if info_type not in ["TasksInfo", "SystemsInfo", "LogsInfo"]:
        return HttpResponseBadRequest(f'You are using {info_type}. Please use `TasksInfo`, `LogsInfo`, or `SystemsInfo`')

    # Check the HTTP method
    if request.method != "POST":
        return HttpResponseBadRequest('Only accept POST method.')

    # Extract data from the POST request
    post_data = request.POST.dict()

    # Handle deletion of LogsInfo separately
    if info_type == "LogsInfo":
        log_id = post_data["log_id"] if "log_id" in post_data else None
        return delete_logs(request, log_id)

    # Perform the query to get the data to be deleted
    query_data = eval(info_type).objects.filter(**post_data)

    # Delete the queried data
    query_data.delete()

    return HttpResponse("Delete Successfully")


def display_home(request):
    """
    Renders the home page with the necessary data.

    Args:
        - request: HTTP request object.

    Returns:
        - Rendered home.html template with the required data.

    """
    # Set the template name for rendering
    template_name = 'home.html'

    # Get distinct task categories from TasksInfo table
    tab_names = TasksInfo.objects.values('task_category').distinct()

    # Initialize tabs_info dictionary
    tabs_info = {}

    # Iterate over each tab name
    for tab in tab_names:
        # Initialize data list for the current tab
        tabs_info[tab["task_category"]] = {"data": []}

        # Fetch matrix list for the current tab, ordered by created_at in descending order
        matrix_list = TasksInfo.objects.filter(task_category=tab["task_category"]).order_by("-created_at")

        # Initialize best_value_at_all_time dictionary
        best_value_at_all_time = {}

        # Iterate over each matrix in the matrix list
        for matrix in matrix_list:
            # Convert matrix object to dictionary
            tab_info = matrix.__dict__

            # Convert best_values string to dictionary
            tab_info["best_values"] = json.loads(tab_info["best_values"].replace("\'", "\""))

            # Update best_value_at_all_time dictionary
            for feature_col in tab_info["best_values"]:
                if feature_col not in best_value_at_all_time:
                    best_value_at_all_time[feature_col] = tab_info["best_values"][feature_col]
                    best_value_at_all_time[feature_col]["id"] = tab_info["id"]
                    continue
                if (
                    best_value_at_all_time[feature_col]["best_method"] == "max"
                    and tab_info["best_values"][feature_col]["val"] > best_value_at_all_time[feature_col]["val"]
                ):
                    best_value_at_all_time[feature_col] = tab_info["best_values"][feature_col]
                    best_value_at_all_time[feature_col]["id"] = tab_info["id"]
                elif (
                    best_value_at_all_time[feature_col]["best_method"] == "min"
                    and tab_info["best_values"][feature_col]["val"] < best_value_at_all_time[feature_col]["val"]
                ):
                    best_value_at_all_time[feature_col] = tab_info["best_values"][feature_col]
                    best_value_at_all_time[feature_col]["id"] = tab_info["id"]

            # Append the current tab_info to the data list of the current tab
            tabs_info[tab["task_category"]]["data"].append(tab_info.copy())

        # Update tabs_info dictionary with best_value_at_all_time and delta calculations
        tabs_info[tab["task_category"]]["best_value_at_all_time"] = best_value_at_all_time.copy()
        for tab_info in tabs_info[tab["task_category"]]["data"]:
            for feature_col in tab_info["best_values"]:
                tab_info["best_values"][feature_col]["best_value_at_all_time"] = {
                    "val": best_value_at_all_time[feature_col]["val"],
                    "id": best_value_at_all_time[feature_col]["id"],
                }
                tab_info["best_values"][feature_col]["delta"] = (
                    tab_info["best_values"][feature_col]["val"] - best_value_at_all_time[feature_col]["val"]
                ) / (best_value_at_all_time[feature_col]["val"] + 0.000001)
                if tab_info["best_values"][feature_col]["delta"] < 0.1:
                    tag = "delta green"
                else:
                    tag = "delta red"
                tab_info["best_values"][feature_col]["delta"] = {
                    "val": "{:.2f}%".format(tab_info["best_values"][feature_col]["delta"]),
                    "tag": tag,
                }

    # Prepare the data to be passed to the template
    data = {"tabs_info": tabs_info}

    # Render the template with the data
    return render(request, template_name, data)

@csrf_exempt
def display_logs(request,log_id):
    """
    Displays the logs associated with a specific log_id.

    Args:
        - request: HTTP request object.
        - log_id: Log ID to display logs for.

    Returns:
        - Rendered logs.html template with the required data.

    """
    # Filter the LogsInfo objects by the given log_id
    log = LogsInfo.objects.filter(id=int(log_id))
    
    # If log does not exist, return a bad request response
    if not log.exists():
        return HttpResponseBadRequest("This log do not exists")
    
    # Get the first log object from the filtered queryset
    log = log[0]
    
    # Determine the log_mark value based on the marked status of the log
    log_mark = "Mark" if not log.marked else "Unmark" 
    
    # If the request method is POST, update the marked status of the log
    if request.method == "POST":
        log = LogsInfo.objects.filter(id=log_id)[0]
        log.marked = not log.marked
        log.save()
        return HttpResponse("Success")
    
    # Filter the LogsContent objects by the given log_id and order them by log_name
    logs = LogsContent.objects.filter(log_id=float(log_id)).order_by("log_name")
    
    # Set the template name for rendering
    template_name = "logs.html"
    
    # Prepare the data to be passed to the template
    data = {
        "log_id" : log_id,
        "logs" : logs,
        "log_mark" : log_mark,
    }
    
    # Render the template with the data
    return render(request, template_name,data)


def get_one_matrix(request,t_id : int):
    """
    Retrieves information for a specific matrix (task) and displays it in a table.

    Args:
        - request: HTTP request object.
        - t_id: ID of the matrix (task) to retrieve information for.

    Returns:
        - Rendered matrix using the display_matrix function.

    """
    # Filter the TasksInfo objects by the given t_id and get the first object
    matrix = TasksInfo.objects.filter(id=t_id)[0]
    
    # Split the task_system string into a dictionary of system names and their corresponding values
    systems = {}
    for system in matrix.task_system.split(","):
        name , system = system.split("=")
        system = system.split(":")
        systems[name] = system
        
    # Get the index columns of the data
    index_columns = matrix.index_columns.split(",")
    
    # Get the columns to display in the table from the GET parameters or use "all" by default
    columns_to_display = request.GET.getlist('column') if request.GET.getlist('column') else "all"
    
    # Call the display_matrix function to render the matrix
    return display_matrix(
        request,
        t_id = t_id,
        table_name=matrix.perfy_matrix,
        systems = systems,
        template_name=matrix.html_template,
        index_columns=index_columns,
        columns_to_display = columns_to_display,
    )

def render_two_matrix(request,t_id:list):
    """
    Renders a comparison of two matrices (tasks) in a table.

    Args:
        - request: HTTP request object.
        - t_id: List of IDs of the matrices (tasks) to compare.

    Returns:
        - Rendered comparison table using the compare.html template.

    """
    template_name = "compare.html"
    
    # Check if the matrices belong to the same task category
    matrixs = [TasksInfo.objects.filter(id=int(id))[0] for id in t_id]
    task_category = set([mat.task_category for mat in matrixs])
    
    if len(task_category) > 1:
        return HttpResponse(f"You are comparing different tasks in {task_category}")
    else:
        task_category = list(task_category)[0]
    
    #  Check if the matrices have the same index columns
    index_columns = set(matrixs[0].index_columns.split(","))
    for mat in matrixs:
        if set(mat.index_columns.split(",")) != index_columns:
            return HttpResponse(f"The Compared Tasks have different index_columns with `{index_columns}` and `{ set(mat.index_columns.split(','))}`")
    

    # Get the index columns of the data
    index_columns = matrixs[0].index_columns.split(",")
    
    # Prepare variables for data storage
    systems_info = {}
    dfs = []

    # Retrieve data for each matrix
    for id in t_id:
        _ , _ , data = get_one_matrix(request,id)
        all_feature_columns = data["all_feature_columns"]
        systems_info[id + "." + data["table_name"]] = data["systems_info"]
        df = pd.read_html(data["data"])[0]
        df.set_index(index_columns,inplace=True)
        columns_to_display = df.columns
        df.columns = [id + "_" + column for column in df.columns]
        dfs.append(df)
        
    # Concatenate DataFrames horizontally and check whether there will be a non-unique multi-index
    try:
        dfs = pd.concat(dfs, axis=1, join='inner', ignore_index=False)
    except:
        return HttpResponseBadRequest("Two tables merge FAIL : cannot handle a non-unique multi-index! Check whether one of the tables have the same index")
    
    if dfs.empty:
        return HttpResponseBadRequest("Two tables don't have the same index to concat. Please check the tables that you want to concat.")
    # Prepare columns for the table
    all_columns = []
    for column in columns_to_display:
        column_li = []
        for i in dfs.columns:
            if i.endswith(column):
                column_li.append(i)
        delta_col_name = f"delta_{column}"
        all_columns.extend(column_li) ; all_columns.append(delta_col_name)
        dfs[delta_col_name] = dfs.apply(lambda row: f"{np.divide((row[column_li[1]] - row[column_li[0]]),row[column_li[0]],where=row[column_li[0]]!=0) * 100:.2f}%", axis=1) 
    dfs = dfs[all_columns]
    dfs = pandasArray_to_html(dfs,columns = index_columns + all_columns)
    
    
    # Add delta class for <td> elements with percentage
    dfs = BeautifulSoup(dfs, 'html.parser')

    # Find all td elements containing %
    td_elements = dfs.find_all('td', text=lambda text: text.endswith('%'))

    # Add class attribute to the selected td elements
    for td in td_elements:
        if float(td.text.strip("%")) >= 0:
            td['class'] = 'delta positive'
        else:
            td['class'] = 'delta negative'
    dfs = str(dfs)

    
    data = {
        "t_id" : "&".join(t_id),
        "systems_info" : systems_info,
        "data" : dfs,
        "all_feature_columns" : all_feature_columns,
    }
    return render(request,template_name,data)
    
    
def render_matrix(request,t_id : str):
    """
    Renders the matrix view based on the provided t_id.

    Args:
        - request: HTTP request object.
        - t_id: String containing the matrix IDs separated by "&".

    Returns:
        - Rendered matrix view using the appropriate template.

    """
    t_id = t_id.split("&")
    for id in t_id:
        if bool(re.search(r'\D', id)):
            return HttpResponseBadRequest(f"id = `{id}` is not a number. Please check!")
        if len(TasksInfo.objects.filter(id=int(id))) == 0:
            return HttpResponseBadRequest(f"id = `{id}` does not exists. Please check!")
    if len(set(t_id)) == 1:
        # Single matrix view
        t_id = int(t_id[0])
        request , template , data = get_one_matrix(request,t_id)
        return render(request , template , data)
    elif len(set(t_id)) == 2:
        # Two matrixes comparison view
        return render_two_matrix(request,t_id)
    else:
        # Invalid t_id
        return HttpResponse(f"t_id is {t_id}.Only acceopt 2 matrixs compare")

@csrf_exempt
@staff_member_required
def submit_comment(request,t_id):
    admin_user = request.user
    data = json.loads(request.body)
    if data.get("type") == "submit":
        post_data = {
            "task_id" : t_id,
            "post_user" : admin_user.username,
            "comment" : data.get("comment")
        }
        new_data = Comment(**post_data)
        new_data.save()
    elif data.get("type") == "delete":
        commentID = data.get("commentID")
        comment = Comment.objects.filter(id=commentID)[0]
        if not admin_user.is_superuser and comment.post_user != admin_user.username:
            return HttpResponseBadRequest("This Comment is not belong to you")
        comment.delete()
    else:
        return HttpResponseBadRequest
    return HttpResponse(f"Success") 


@csrf_exempt
@staff_member_required
def manage(request):
    """
    Manages the tasks and logs based on the provided request.

    Args:
        - request: HTTP request object.

    Returns:
        - HTTP response indicating the success or failure of the operation.

    """
    admin_user = request.user
    
    # POST request for managing tasks and logs
    if request.method == "POST":
        data = json.loads(request.body)
        task_name = data.get('task_name')
        log_id = data.get('log_id')
        task = TasksInfo.objects.filter(task_name = task_name)
        table_name = task[0].perfy_matrix
        post_user = task[0].post_user
        task_id = task[0].id
        if not admin_user.is_superuser and post_user != admin_user.username:
            return HttpResponseBadRequest("This table is not belong to you")
        connection = connections["PerfyMatrix"]
        data = query_table(connection,table_name)
        if "log_id" not in data:
            return HttpResponseBadRequest("There is no log_id in this table")
        if not log_id:
            # Delete all logs and table
            for id in data["log_id"].unique():
                delete_logs(log_id=int(id)) 
            
            delete_table(connection,table_name)
            task.delete()
            
            comments = Comment.objects.filter(task_id = task_id)
            comments.delete()
        else:
            # Delete specific log entry
            delete_logs(log_id=int(log_id)) 
            
            with connection.cursor() as cursor:
                sql = f"DELETE FROM `{table_name}` WHERE `log_id` = {log_id}"
                cursor.execute(sql)
                connection.commit()
        return HttpResponse("SUCCESS")
    else:
        # GET request for retrieving tasks
        if admin_user.is_superuser:
            objects = TasksInfo.objects.all()
        else:
            objects = TasksInfo.objects.filter(post_user = admin_user)
        data = {
            "tasks" : objects
        }
    return render(request,"manage.html",data)

@csrf_exempt
@staff_member_required
def manage_matrix(request,t_id):
    """
    Manages a specific matrix based on the provided request.

    Args:
        - request: HTTP request object.
        - t_id: Task ID.

    Returns:
        - HTTP response containing the modified matrix.

    """
    if request.method == "POST":
        # POST request, call the general manage function to handle the request
        return manage(request)
    
    _, _, data = get_one_matrix(request,t_id)
    task_name = TasksInfo.objects.filter(id=t_id)[0].task_name 
    table_name = TasksInfo.objects.filter(id=t_id)[0].perfy_matrix ; connection = connections["PerfyMatrix"]
    df = query_table(connection,table_name)
    log_ids = [int(i) for i in df['log_id'].tolist()]
    
    soup = BeautifulSoup(data["data"], 'html.parser')
    rows = soup.find_all('tr')
    
    for row,log_id in zip(rows[1:] ,log_ids):
        # Add a delete link for each log entry
        a_element = soup.new_tag('a', href='#', onclick=f"Delete('{t_id}','{task_name}','{log_id}')")
        a_element.string = 'delete'
        delete_th = soup.new_tag('th')
        delete_th.append(a_element)
        row.append(delete_th)
        
    data = {
        "data" : str(soup)
    }
    
    return render(request,'manage_matrix.html',data)

# Login view
def login_view(request):
    error_message = None
    if request.method == 'POST':
        username = request.POST['username']
        raw_password = request.POST['password']

        db_config = settings.DATABASES['default']
        connection = pymysql.connect(
            host=db_config['HOST'],
            user=db_config['USER'],
            password=db_config['PASSWORD'],
            database=db_config['NAME'],
            cursorclass=pymysql.cursors.DictCursor
        )
        try:
            with connection.cursor() as cursor:
                # Query to check if a user with the given username and password exists
                sql = "SELECT password FROM auth_user WHERE username = %s"
                cursor.execute(sql, (username,))
                result = cursor.fetchone()
                correctPassword = check_password(raw_password, result['password'])
                if result and correctPassword:
                    user, created = User.objects.get_or_create(username=username)
                    login(request, user)
                    # return redirect('/')
                else:
                    error_message = "Invalid username or password"
        finally:
            connection.close()
    return render(request, 'login.html', {'error_message': error_message})


def logout_view(request):
    logout(request)
    return redirect('login')  # Redirects to the login page after logout


# Signup view
def signup_view(request):
    error_message = None
    if request.method == 'POST':
        username = request.POST['username']
        password = request.POST['password']
        confirm_password = request.POST['confirm_password']
        email = request.POST.get('email', '')  # Email is optional
        # Check if the password is strong
        if not isStrongPassword(password):
            error_message = "Password is not strong enough!"
        elif password != confirm_password:
            error_message = "Two passwords are different!"
        else:
            # Hash the password
            hashed_password = make_password(password)

            db_config = settings.DATABASES['default']
            connection = pymysql.connect(
                host=db_config['HOST'],
                user=db_config['USER'],
                password=db_config['PASSWORD'],
                database=db_config['NAME'],
                cursorclass=pymysql.cursors.DictCursor
            )
            try:
                with connection.cursor() as cursor:
                    # Query to check if a user with the given username and password exists
                    sql = "SELECT id FROM auth_user WHERE username = %s"
                    cursor.execute(sql, (username,))
                    result = cursor.fetchone()
                    if result:
                        error_message = "Username already exists!"
                    else:
                        #write into table auth_user, seting username and password(with hashing)
                        #also set is_superuser:0, and is_staff:1
                        insert_sql = """
                            INSERT INTO auth_user (username, password, email, is_superuser, 
                            is_staff, first_name, last_name, is_active, date_joined)
                            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW())
                        """
                        cursor.execute(insert_sql, (username, hashed_password, email, 0, 1, '', '', 1))
                        connection.commit()

                        user, created = User.objects.get_or_create(username=username)
                        user.is_superuser = False
                        user.is_staff = True
                        user.save()
                        login(request, user)
                        # return redirect('/')
            finally:
                connection.close()
    return render(request, 'signup.html', {'error_message': error_message})


def isStrongPassword(password):
    # Check the password length
    if len(password) < 8:
        return False
    # Initialize criteria variables
    has_upper = has_lower = has_digit = has_special = False
    # Define the set of special characters
    special_characters = "!@#$%^&*(),.?\":{}|<>"
    # Check each character of the password
    for char in password:
        if char.isupper():
            has_upper = True
        elif char.islower():
            has_lower = True
        elif char.isdigit():
            has_digit = True
        elif char in special_characters:
            has_special = True
        # If all criteria are met, no need to continue checking
        if has_upper and has_lower and has_digit and has_special:
            return True
    # If the loop ends without all criteria being met
    return False

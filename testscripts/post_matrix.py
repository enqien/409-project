
import os
import sys
import json
import requests
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from utils import parse_LOGS, parse_system_info , print_and_save , run_server , print_arguments
from datetime import datetime
import socket
import pytz


def post_matrix(function,params:dict,config:dict):
    """
    Executes a matrix post process for a given function with specified parameters and configuration.

    Args:
        function: The function to be called in the matrix post process.
        params (dict): A dictionary containing the parameters to be passed to the function.
        config (dict): A dictionary containing the configuration values used in the matrix post process.

    Returns:
        str: The path of the log directory where the matrix post process logs are saved.

    Example:
        config = {
            "BASE_URL": "http://example.com",
            "task_category": "category",
            "task_name": "task",
            "template": "template.html",
            "index_columns": ["col1", "col2"],
            "feature_columns": {"feat1": "min", "feat2": "max"}, # the key is the feature of the table , and the value is the best_value method of the column
            "user_name": "username",
            "user_password": "password"
        }
        params = {
            "param1": "value1",
            "param2": "value2"
        }

        def my_function(param1, param2):
            # Function implementation...

        post_matrix(my_function, params, config)
    """
    BASE_URL, task_category, task_name, template, index_columns, feature_columns = config["BASE_URL"] , config["task_category"] , config["task_name"] , config["template"] if "template" in config else "matrix.html" , config["index_columns"] , config["feature_columns"]
    user = {"user_name" : config["user_name"] , "user_password" : config["user_password"]}
    # 1. run the command to get the logs folder
    PERFY_HOME = os.environ.get('PERFY_HOME')
    curr_time = datetime.now() ; T = curr_time.strftime("%s")
    LOG = f"LOG_{task_category}"
    LOG_PATH = os.path.join(PERFY_HOME, "LOGS", LOG, f"{LOG}_{T}")
    os.makedirs(LOG_PATH)
    result_log = os.path.join(LOG_PATH,"result.log")
    print_and_save(f"Running Command at Host >>>>>>>>>>   {socket.gethostname()}",result_log)
    print_and_save(f"Running TIME at >>>>>>>>>>   {datetime.now().astimezone(pytz.timezone('US/Pacific')).strftime('%Y-%m-%d %H:%M:%S')}",result_log)
    print_and_save(f"Making LOG PATH >>>>>>>>>>   {LOG_PATH}",result_log)
    print_and_save(f"Config >>>>>>>>>>    ",result_log)
    [print_and_save(f"       {key} : {value}", result_log) if key != "user_password" else print_and_save(f"       {key} : ********", result_log) for key, value in config.items()]
    print_and_save(f"End Config >>>>>>>>>>   \n\n\n",result_log)
    params["LOG_PATH"] = LOG_PATH
    
    # 2.1 get the system.info , metadata.cfg and config.info
    run_server(run_path=os.getcwd(),save_path=LOG_PATH)

    # 2.2 parse system info
    systems, task_system = parse_system_info(os.path.join(LOG_PATH, "system.info"))
    
    # 2.3 load request session (do not trust env proxy)

    session = requests.Session()
    session.trust_env = False

    # 2.3 upload systems info to DataBase: PerfyInfo.Systems_Info
    for system in systems:
        url = os.path.join(BASE_URL, "query_SystemsInfo")
        response = session.post(url, data={"HOSTNAME": system["HOSTNAME"], "INTERFACE": system["INTERFACE"],**user},timeout=15)
        if response.status_code != 200:
            print_and_save(f"Query system info by posting into `{url}` Failed with the response `{response.text}`",result_log)
            raise ValueError(f"Query system info by posting into `{url}` Failed with the response `{response.text}`")
        if response.text == "":
            url = os.path.join(BASE_URL, "post_SystemsInfo")
            response = session.post(url, data={**system,**user},timeout=15)
            print_and_save(f"ADD NEW SYSTEM `{system['HOSTNAME']}:{system['INTERFACE']}` to `{url}`, Get Code {response.status_code}" ,result_log)
        else:
            print_and_save(f"SYSTEM `{system['HOSTNAME']}:{system['INTERFACE']}` Already In The Database at {url}",result_log)

    # 3.1 run task and create @Modify Here
    function = print_arguments(function,result_log)
    data = function(**params)
    
    
    # 3.2 check the data
    if not isinstance(data, dict):
        print_and_save(f"Check your `function` return. The return data must be a dictionary. Your type is {type(data)}",result_log)
        raise ValueError(f"Check your `function` return. The return data must be a dictionary. Your type is {type(data)}")
    for column in index_columns + list(feature_columns.keys()):
        if column not in data:
            data[column] = None
    print_and_save(f"\nResult >>>>>>>>>>    ",result_log)
    [print_and_save(f"       {key} : {value}", result_log) for key, value in data.items()]
    print_and_save(f"End Result >>>>>>>>>>   \n\n",result_log)
    
    # 4. parse logs
    log_content = parse_LOGS(LOG_PATH)
    
    # 5. post the data into Database PerfyMatrix.task_name
    url = os.path.join(BASE_URL, "post_data")
    json_request = {
        "table_name": task_name,
        "index_cols": ",".join(index_columns),
        "feature_cols": json.dumps(feature_columns),
        "data": json.dumps(data),
        "log_content": json.dumps(log_content),
        **user
    }
    response = session.post(url,data=json_request,timeout=15)
    print_and_save(f"post data to {url} \nGET CODE {response.status_code}",result_log)
    best_values = json.dumps(json.loads(response.text)["maxvals"])

    # 6. post task
    url = os.path.join(BASE_URL, "post_TasksInfo")
    params = {'task_category': task_category, 'task_name': task_name, 'task_system': task_system, "perfy_matrix": task_name,
              "html_template": template, "index_columns": ",".join(index_columns), "best_values": best_values, "post_user" : user["user_name"],  **user}
    response = session.post(url, data=params,timeout=15)
    print_and_save(f"post task to {url} \nGET CODE {response.status_code}",result_log)
    print_and_save("SUCCESS!!!!",result_log) if response.status_code == 200 else print_and_save(f"Failed!!!! With error {response.text}",result_log)
    print_and_save(f"Total Running Time: {(datetime.now() - curr_time).seconds}s",result_log) if response.status_code == 200 else None
    return LOG_PATH



def debugger(function,params:dict,config:dict):
    """
    Executes a matrix post process for a given function with specified parameters and configuration.

    Args:
        function: The function to be called in the matrix post process.
        params (dict): A dictionary containing the parameters to be passed to the function.
        config (dict): A dictionary containing the configuration values used in the matrix post process.

    Returns:
        str: The path of the log directory where the matrix post process logs are saved.

    Example:
        config = {
            "BASE_URL": "http://example.com",
            "task_category": "category",
            "task_name": "task",
            "template": "template.html",
            "index_columns": ["col1", "col2"],
            "feature_columns": {"feat1": "min", "feat2": "max"}, # the key is the feature of the table , and the value is the best_value method of the column
            "user_name": "username",
            "user_password": "password"
        }
        params = {
            "param1": "value1",
            "param2": "value2"
        }

        def my_function(param1, param2):
            # Function implementation...

        post_matrix(my_function, params, config)
    """
    BASE_URL, task_category, task_name, template, index_columns, feature_columns = config["BASE_URL"] , config["task_category"] , config["task_name"] , config["template"] if "template" in config else "matrix.html" , config["index_columns"] , config["feature_columns"]
    user = {"user_name" : config["user_name"] , "user_password" : config["user_password"]}
    # 1. run the command to get the logs folder
    PERFY_HOME = os.environ.get('PERFY_HOME')
    curr_time = datetime.now() ; T = curr_time.strftime("%s")
    LOG = f"LOG_{task_category}"
    LOG_PATH = os.path.join(os.getcwd(), "Debugger_LOGS", LOG, f"{LOG}_{T}")
    os.makedirs(LOG_PATH)
    result_log = os.path.join(LOG_PATH,"result.log")
    print_and_save(f"Running Command at Host >>>>>>>>>>   {socket.gethostname()}",result_log)
    print_and_save(f"Running TIME at >>>>>>>>>>   {datetime.now().astimezone(pytz.timezone('US/Pacific')).strftime('%Y-%m-%d %H:%M:%S')}",result_log)
    print_and_save(f"Making LOG PATH >>>>>>>>>>   {LOG_PATH}",result_log)
    print_and_save(f"Config >>>>>>>>>>    ",result_log)
    [print_and_save(f"       {key} : {value}", result_log) if key != "user_password" else print_and_save(f"       {key} : ********", result_log) for key, value in config.items()]
    print_and_save(f"End Config >>>>>>>>>>   \n\n\n",result_log)
    params["LOG_PATH"] = LOG_PATH
    
    # 2.1 get the system.info , metadata.cfg and config.info
    run_server(run_path=os.getcwd(),save_path=LOG_PATH)

    # 2.2 parse system info
    systems, task_system = parse_system_info(os.path.join(LOG_PATH, "system.info"))
    
    # 2.3 load request session (do not trust env proxy)

    session = requests.Session()
    session.trust_env = False

    # 2.3 upload systems info to DataBase: PerfyInfo.Systems_Info
    for system in systems:
        url = os.path.join(BASE_URL, "query_SystemsInfo")
        response = session.post(url, data={"HOSTNAME": system["HOSTNAME"], "INTERFACE": system["INTERFACE"],**user},timeout=15)
        if response.status_code != 200:
            print_and_save(f"Query system info by posting into `{url}` Failed with the response `{response.text}`",result_log)
            raise ValueError(f"Query system info by posting into `{url}` Failed with the response `{response.text}`")
        if response.text == "":
            """Real Post was delete"""
            print_and_save(f"ADD NEW SYSTEM `{system['HOSTNAME']}:{system['INTERFACE']}` to `{url}`, Get Code {response.status_code}" ,result_log)
        else:
            print_and_save(f"SYSTEM `{system['HOSTNAME']}:{system['INTERFACE']}` Already In The Database at {url}",result_log)

    # 3. run task and create @Modify Here
    function = print_arguments(function,result_log)
    data = function(**params)
    if not isinstance(data, dict):
        print_and_save(f"Check your `function` return. The return data must be a dictionary. Your type is {type(data)}",result_log)
        raise ValueError(f"Check your `function` return. The return data must be a dictionary. Your type is {type(data)}")
    for column in index_columns + list(feature_columns.keys()):
        if column not in data:
            data[column] = None

    print_and_save(f"\nResult >>>>>>>>>>    ",result_log)
    [print_and_save(f"       {key} : {value}", result_log) for key, value in data.items()]
    print_and_save(f"End Result >>>>>>>>>>   \n\n",result_log)
    return LOG_PATH






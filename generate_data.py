BASE_URL = "http://127.0.0.1:8000/perfy/"
user_name = "june"
user_password = "******"
task_num = 20


import os
import sys
import json
import requests
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from utils import parse_system_info , print_and_save
from datetime import datetime
import socket
import pytz
import random
import string
from tqdm import tqdm

configs = [
    {
    "task_category": "iperf", # the tab name in the home_page
    "index_columns": ["PARALLEL", "LENGTH", "WINDOW", "BIDIRECTION"], # the index of the table
    "feature_columns": {"Bandwidth(Gbps)": "max"} # the key is the feature of the table , and the value is the best_value method of the column
    },
    {
    "task_category": "nccl", # the tab name in the home_page
    "index_columns": ["TYPE", "SIZE", "GPU_Num","Port_Num","QP", "Aggregation_Count"], # the index of the table
    "feature_columns": {"out_algbw(Gbps)": "max", "out_busbw(Gbps)":"max","in_algbw(Gbps)":"max","in_busbw(Gbps)":"max","avg_switch_in(Gbps)":"max","avg_switch_out(Gbps)":"min"}, # the key is the feature of the table , and the value is the best_value method of the column
    },
    {
    "task_category": "verb", # the tab name in the home_page
    "index_columns": ["TYPE","PORT","SIZE", "CLASS", "QP", "BIDIRECTION"], # the index of the table
    "feature_columns": {"BW(Gpbs)": "max", "Latency(usec)": "min","avg_switch_in(Gbps)":"max","avg_switch_out(Gbps)":"max"}, # the key is the feature of the table , and the value is the best_value method of the column
    },
]

def generate_random_string(length=10):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def post_matrix(systems,data,fake_log): 
    result_log = []
    print_and_save(f"Running Command at Host >>>>>>>>>>   {socket.gethostname()}",result_log)
    print_and_save(f"Running TIME at >>>>>>>>>>   {datetime.now().astimezone(pytz.timezone('US/Pacific')).strftime('%Y-%m-%d %H:%M:%S')}",result_log)
    print_and_save(f"Config >>>>>>>>>>    ",result_log)
    [print_and_save(f"       {key} : {value}", result_log) if key != "user_password" else print_and_save(f"       {key} : ********", result_log) for key, value in config.items()]
    print_and_save(f"End Config >>>>>>>>>>   \n\n\n",result_log)

    # parse system info

    task_system = parse_system_info(systems)

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
    log_content = {"result.log":"\n".join(result_log)}
    log_content = {**log_content, **fake_log}

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
    

for _ in tqdm(range(task_num)):
    
    config = random.choice(configs)
    task_category, task_name, template, index_columns, feature_columns = config["task_category"] , config["task_category"] + f"_{generate_random_string()}" , config["template"] if "template" in config else "matrix.html" , config["index_columns"] , config["feature_columns"]
    user = {"user_name" : user_name , "user_password" : user_password}

    systems = []
    for i in range(random.randint(2, 6)):
        systems.append(
            {
            'HOSTNAME': f'nsn{random.randint(150,160)}-{random.randint(58,61)}.us.com',
            'SERVER_TYPE': '',
            'SERVER': 'SERVER: ORACLE SERVER X9-2c',
            'BIOS': 'BIOS: 66090200',
            'CPU': 'Intel(R) Xeon(R) Platinum 8358 CPU @ 2.60GHz Intel(R) Xeon(R) Platinum 8358 CPU @ 2.60GHz',
            'MEMORY': '0x DIMM(s)',
            'HCA': 'LP ADAPTER, DUAL QSFP56 2X50 GbE 2x50G, ConnectX-6 DX, PCIE 4.0X16',
            'HCA_FW': '22.28.1602 22.36.1010',
            'KERNEL': '5.4.17-2136.307.3.1.el8uek.x86_64',
            'ILOM': 'Version: 5.1.1.91 r150981',
            'IMAGE': 'NA',
            'OS': 'Red Hat Enterprise Linux release 8.6 (Ootpa)',
            'INTERFACE': f'ens800f{random.randint(0,4)}np{random.randint(0,4)}',
            'INTERFACE_INFO': '...'
            }
        )
    if config["task_category"] == "iperf":
        for P in ["true","false"]:
            for L in [1,2,4,8,16]:
                for W in range(1,4,8):
                    for BIDIRECTION in ["True","False"]:
                            data = {"PARALLEL" : P , "LENGTH" : L , "WINDOW" : W , "BIDIRECTION" : BIDIRECTION , "Bandwidth(Gbps)" : random.uniform(100,150)}
                            fake_log = {}
                            log_num = random.randint(1, 10)
                            for i in range(random.randint(1, 10)):
                                fake_log[f"log_{i}.txt"] = f"This is Log {i}, it is a fake log"
                            post_matrix(systems,data,fake_log)
    elif config["task_category"] == "verb":
        for test_name in ["ib_read","ib_send","ib_write"]:
            for PORT , NUMA_NODES in zip([1,2],[0,[0,1]]):
                for size in ["8KB","16KB","32KB","62KB","1MB"]:
                    for QP in [1,2,4]:
                        for BIDIRECTION in ["True","False"]:
                            data = {"TYPE" : test_name,"PORT":PORT,"SIZE" : size,"CLASS" : 64, "BIDIRECTION" : BIDIRECTION,"QP":QP , "BW(Gpbs)" : random.uniform(100,150),"Latency(usec)":random.uniform(0,0.3),"avg_switch_in(Gbps)":random.uniform(100,150),"avg_switch_out(Gbps)":random.uniform(100,150)}
                            fake_log = {}
                            log_num = random.randint(1, 10)
                            for i in range(random.randint(1, 10)):
                                fake_log[f"log_{i}.txt"] = f"This is Log {i}, it is a fake log"
                            post_matrix(systems,data,fake_log)
    elif config["task_category"] == "nccl":
        for test_name in ["all_reduce_perf"]:
            for size , initial_itter_num in [("32KB",1000000),("512KB",300000),("8MB",50000),("64MB",10000)]:
                for gpu in [1,2,4]:
                    for QP in [1,4]:
                        for idx , agg_iters in enumerate([1,5,10]):
                            data = {
                                "TYPE" : test_name,
                                "SIZE":size,
                                "GPU_Num":gpu,
                                "Port_Num": gpu + random.randint(1,4),
                                "QP":QP,
                                "Aggregation_Count":agg_iters,
                                "out_algbw(Gbps)" : random.uniform(100,150),
                                "out_busbw(Gbps)" : random.uniform(100,150),
                                "in_algbw(Gbps)" : random.uniform(100,150),
                                "in_busbw(Gbps)" : random.uniform(100,150),
                                "avg_switch_in(Gbps)" : random.uniform(100,150),
                                "avg_switch_out(Gbps)" : random.uniform(100,150),
                            }      
                            fake_log = {}
                            log_num = random.randint(1, 10)
                            for i in range(random.randint(1, 10)):
                                fake_log[f"log_{i}.txt"] = f"This is Log {i}, it is a fake log"
                            post_matrix(systems,data,fake_log)
            
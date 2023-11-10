import os
import sys
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from testscripts import run_verb , post_matrix
import time



"-------------modify your config-----------"
config = {
    "BASE_URL": "http://nsn160-58:8000/perfy", # base URL
    "task_category": "verb", # the tab name in the home_page
    "task_name": "verb_test",  # the name that you want to display
    "index_columns": ["TYPE", "SERVERS", "CLIENTS","PORT","SIZE", "CLASS", "QP", "BIDIRECTION"], # the index of the table
    "feature_columns": {"BW(Gpbs)": "max", "Latency(usec)": "min","avg_switch_in(Gbps)":"max","avg_switch_out(Gbps)":"max"}, # the key is the feature of the table , and the value is the best_value method of the column
    "user_name" : "junewu",
    "user_password" : "*****",
}
"------------------------------------------"

base_params = {
    "SERVERS" : ["SERVER"],
    "CLIENTS" : ["CLIENT"],
    "CLASS" : 64,
    "VERB_PATH":"/root/ib-cuda",
    "Switch_Hostname":"10.134.160.53",
    "Switch_Password":"Pass1234"
}

# 1. read the JSON
import json
with open("./params.json", "r") as file:
    params = json.load(file)


# 2. parameter generation
params = []
for test_name in ["ib_read","ib_send","ib_write"]:
    for PORT , NUMA_NODES in zip([1,2],[0,[0,1]]):
        for size in ["8KB","16KB","32KB","62KB","1MB"]:
            for QP in [1,2,4]:
                for BIDIRECTION in [False,True]:
                    params.append({"TEST_NAME" : test_name,"PORT":PORT,"SIZE" : size,"CLASS" : 64, "BIDIRECTION" : BIDIRECTION,"QP":QP,"NUMA_NODES":NUMA_NODES})



# run without CUDA    
for idx , param in enumerate(params):
    print("="*100)
    print(f"{idx+1}/{len(params)} \n{param}")
    param = {**param, **base_params}
    config["task_name"] = f"{param['TEST_NAME']}_ens800f0np0_ens840f1np1"
    post_matrix(function=run_verb,params=param,config = config)


# run with CUDA
for idx , param in enumerate(params):
    print("="*100)
    print(f"{idx+1}/{len(params)} \n{param}")
    param = {**param, **base_params,"CUDA":["17:00.0","ca:00.0"]}
    config["task_name"] = f"{param['TEST_NAME']}_cuda_ens800f0np0_ens840f1np1"
    post_matrix(function=run_verb,params=param,config = config)
    
    

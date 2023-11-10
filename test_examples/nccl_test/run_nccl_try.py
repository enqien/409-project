import os, sys , json , time
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from testscripts import run_nccl , post_matrix , debugger
from utils import print_and_save



"-------------modify your config-----------"
config = {
    "BASE_URL": "http://nsn160-58:8000/perfy", # base URL
    "task_category": "nccl", # the tab name in the home_page
    "task_name": "NCCL_4PORT",  # the name that you want to display
    "index_columns": ["TYPE", "SIZE", "GPU_Num","Port_Num","QP", "Aggregation_Count"], # the index of the table
    "feature_columns": {"out_algbw(Gbps)": "max", "out_busbw(Gbps)":"max","in_algbw(Gbps)":"max","in_busbw(Gbps)":"max","avg_switch_in(Gbps)":"max","avg_switch_out(Gbps)":"min"}, # the key is the feature of the table , and the value is the best_value method of the column
    "user_name" : "junewu", # user
    "user_password" : "*******", # password
}
"------------------------------------------"


base_params = {
    "NCCL_HOME":"/root/nccl-bin",
    "MPI_HOME":"/usr/mpi/gcc/openmpi-4.1.5a1/bin/mpirun",
    "SERVERS":"SERVER",
    "CLIENTS":"CLIENT",
    "Switch_Hostname":"10.134.160.53",
    "Switch_Password":"Pass1234",
    "bind_to" : "numa",
    "NCCL_IB_TC": 41, 
    "NCCL_IB_SL": 0, # Defines the InfiniBand Service Level. The default value is 0. OCI suggested value: 0 or 5.
    # "NCCL_IB_QPS_PER_CONNECTION": 4, # Number of IB queue pairs to use for each connection between two ranks. Useful on multilevel fabrics, which need multiple queue pairs to have good routing entropy. Each message, regardless of its size, splits in N parts and sent on each queue pair. Increasing this number can cause a latency increase and a bandwidth reduction. Default value is 1. OCI suggested value is 4
    # "NCCL_IB_GID_INDEX": 3, # The NCCL_IB_GID_INDEX variable defines the Global ID index used in RoCE mode. See the InfiniBand show_gids command to set this value. The default value is 0. OCI suggested value: 3
    "PORT" : 4,
    
}

# 1. read params
import json
with open("./params2.json", "r") as file:
    params = json.load(file)

# 2. params generate
params = []
for test_name in ["all_reduce_perf"]:
    for size , initial_itter_num in [("32KB",1000000),("512KB",300000),("8MB",50000),("64MB",10000)]:
        for gpu in [1,2,4]:
            for QP in [1,4]:
                for idx , agg_iters in enumerate([1,5,10]):
                    params.append({"TEST_NAME" : test_name,"SIZE":size,"ITTER_NUM" : initial_itter_num // 2**idx ,"SERVER_GPU":gpu,"CLIENT_GPU":gpu,"agg_iters":agg_iters,"NCCL_IB_QPS_PER_CONNECTION":QP,"parallel":True})      
    
for idx , param in enumerate(params):
    print("="*100)
    print(f"{idx+1}/{len(params)} \n{param}")
    param = {**param, **base_params}
    post_matrix(function=run_nccl,params=param,config = config)

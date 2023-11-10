import os , sys , multiprocessing , time
from datetime import datetime
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from utils import print_and_save , watch_switch

def run_nccl(
    NCCL_HOME, # NCCL HOME PATH
    MPI_HOME, # mpi_home by running which mpirun to get
    TEST_NAME, # TEST_NAME: all_reduce_perf, alltoall_perf.
    SERVERS, # SERVERS: The server IP or hostname.
    CLIENTS, # CLIENTS: The client IP or hostname.
    SERVER_GPU, # SERVER_GPU: the number of GPU of server
    CLIENT_GPU, # CLIENT_GPU: the number of GPU of client
    SIZE, # SIZE: The size of the package.
    LOG_PATH,
    PORT = 1, # - PORT: How many ports it may run.
    Switch_Hostname: str = None,
    Switch_Password: str = None,
    ITTER_NUM = 1000, # ITTER_NUM: number of the itterations
    agg_iters = 1, # <aggregation count> number of operations to aggregate together in each iteration.
    parallel: bool = False, # -p,--parallel_init <0/1> use threads to initialize NCCL in parallel. Default : 0.
    operation = "sum", # -o,--op <sum/prod/min/max/avg/all> Specify which reduction operation to perform. Only relevant for reduction operations like Allreduce, Reduce or ReduceScatter. Default : Sum.
    bind_to: str = "none",
    # the following is the NCCL Config
    NCCL_IB_HCA : list = None, # he NCCL_IB_HCA variable specifies which RDMA interfaces to use for communication. Set on the shape basis to the RDMA interfaces. Consult the ibdev2netdev output to translate linux to mlx5_x interface names.
    NCCL_IB_TC: int = None, # NCCL_IB_TC Defines the InfiniBand traffic class field. The default value is 0 (if the param is None). OCI suggested value: 41 or 105.
    NCCL_IB_SL: int = None, # Defines the InfiniBand Service Level. The default value is 0. OCI suggested value: 0 or 5.
    NCCL_IB_QPS_PER_CONNECTION: int = None, # Number of IB queue pairs to use for each connection between two ranks. Useful on multilevel fabrics, which need multiple queue pairs to have good routing entropy. Each message, regardless of its size, splits in N parts and sent on each queue pair. Increasing this number can cause a latency increase and a bandwidth reduction. Default value is 1. OCI suggested value is 4
    NCCL_IB_GID_INDEX: int = None, # The NCCL_IB_GID_INDEX variable defines the Global ID index used in RoCE mode. See the InfiniBand show_gids command to set this value. The default value is 0. OCI suggested value: 3
    CUDA_DEVICE_ORDER: str = "PCI_BUS_ID",
):
    """
    Run the NCCL test with the given parameters and return the parsed NCCL data.
    
    Returns:
    - data: DICT, The parsed NCCL data.
    """

    # get the params
    params_dict = {}
    for param_name, param_value in locals().items():
        if param_name in ["NCCL_IB_HCA","NCCL_IB_TC", "NCCL_IB_SL", "NCCL_IB_QPS_PER_CONNECTION", "NCCL_IB_GID_INDEX","CUDA_DEVICE_ORDER"] and param_value:
            params_dict[param_name] = param_value
    
    SERVERS = [SERVERS] if type(SERVERS) != type([]) else SERVERS
    CLIENTS = [CLIENTS] if type(CLIENTS) != type([]) else CLIENTS
    
    metadata_path = os.path.join(LOG_PATH,'metadata.cfg')
    metadata = open(metadata_path, 'r').readlines()
    metadata = {item.replace("\n","").split("=")[0] : item.replace("\n","").split("=")[1] for item in metadata if len(item.split("=")) == 2}
    
    def init_vars(SERVER,CLIENT):
        # init_vars
        SUT = metadata[SERVER]
        S_DEV=metadata[f"{SERVER}_DEV"]
        S_IF=metadata[f"{SERVER}_NETDEV"]
        S_IP=metadata[f"{SERVER}_NETDEV_IP"]
        S_GID=metadata[f"{SERVER}_GID"]
        
        CNT=metadata[CLIENT]
        C_DEV=metadata[f"{CLIENT}_DEV"]
        C_IF=metadata[f"{CLIENT}_NETDEV"]
        C_IP=metadata[f"{CLIENT}_NETDEV_IP"]
        C_GID=metadata[f"{CLIENT}_GID"]
        return SUT , S_DEV , S_IF , S_IP , S_GID , CNT , C_DEV , C_IF , C_IP , C_GID

    
    # ======  PRE DATA COLLECTION
    def predata_collection(SERVERS,CLIENTS):
        # ======  PRE DATA COLLECTION
        for SERVER , CLIENT in zip(SERVERS,CLIENTS):
            for port in range(1,PORT+1):
                server = f"{SERVER}_Port{port}" ; client = f"{CLIENT}_Port{port}"
                SUT , S_DEV , S_IF , S_IP , S_GID , CNT , C_DEV , C_IF , C_IP , C_GID = init_vars(server,client)
                os.system(f'ssh root@{SUT} pkill mpirun')
                os.system(f'ssh root@{SUT} pkill {TEST_NAME}')
                os.system(f'ssh root@{SUT} rm -rf /tmp/counters_*')
                os.system(f'ssh root@{CNT} rm -rf /tmp/counters_*')
                os.system(f'ssh root@{CNT} "/root/nic-counters-new.sh > /tmp/counters_1 2>/dev/null"')
                os.system(f'ssh root@{SUT} "/root/nic-counters-new.sh > /tmp/counters_1 2>/dev/null"')
                os.system(f'ssh root@{CNT} "mstregdump {C_DEV} > /tmp/mstregdump-{C_DEV}-before"')
                os.system(f'ssh root@{SUT} "mstregdump {S_DEV} > /tmp/mstregdump-{S_DEV}-before"')
        time.sleep(10)

    predata_collection(SERVERS,CLIENTS)
    
    servers = set() ; clients = set() ; ibdevs = [] ; netdevs = []
    for SERVER , CLIENT in zip(SERVERS,CLIENTS):
        for port in range(1,PORT+1):
            server = f"{SERVER}_Port{port}" ; client = f"{CLIENT}_Port{port}"
            SUT , S_DEV , S_IF , S_IP , S_GID , CNT , C_DEV , C_IF , C_IP , C_GID = init_vars(server,client)
            servers.add(SUT) ; clients.add(CNT) ; ibdevs.append(S_DEV) ; netdevs.append(S_IF)
    servers = list(servers)[0] ; clients = list(clients)[0] ; ibdevs = ",".join(ibdevs) ; netdevs = ",".join(netdevs)
    result_log = os.path.join(LOG_PATH,"result.log")
    server_out_path = os.path.join(LOG_PATH,f"{servers}.out")
    
    
    # nccl_config
    params_dict["NCCL_IB_HCA"] = ibdevs if "NCCL_IB_HCA" not in params_dict else ",".join(params_dict["NCCL_IB_HCA"])
    params_dict["NCCL_SOCKET_IFNAME"] = netdevs
    params_dict["UCX_NET_DEVICES"] = netdevs
    nccl_config = " ".join([f"-x {key}={value}" for key , value in params_dict.items()])
    
    total_GPU = SERVER_GPU + CLIENT_GPU
    server_cmd = f"{MPI_HOME} --allow-run-as-root -tag-output  -np {total_GPU} -H {servers}:{SERVER_GPU},{clients}:{CLIENT_GPU} -bind-to {bind_to} -map-by slot -mca pml ucx -mca btl ^openib {nccl_config} {os.path.join(NCCL_HOME,TEST_NAME)} -g 1 -t 1 -m {agg_iters} -b {SIZE} -e {SIZE} -p {int(parallel)} -o {operation} -n {ITTER_NUM}"
    cmd = f"ssh root@{SUT} {server_cmd} | tee {server_out_path}"
    print_and_save(f"\n\n Running CMD ====> \n{cmd} \n\n",result_log)
    
    pool = multiprocessing.Pool()
    # apply_async
    test_result = pool.apply_async(run_cmd, (cmd,))
    if Switch_Hostname:
        swtich_result = pool.apply_async(watch_switch, (Switch_Hostname,Switch_Password,LOG_PATH,))
    # Close
    pool.close()
    # get result
    test_result = test_result.get()
    _ , switch_max_in_mbps , switch_max_out_mbps , port_num = swtich_result.get() if Switch_Hostname != None else (None,None,None,None)
    
    # Join
    pool.join()
    
    print_flag = False
    lines = []
    for line in test_result.split("\n"):
        if line.startswith("[1,0]<stdout>:#       size"):
            print_flag = True
        if print_flag:
            lines.append(line)
    out_algbw = float(lines[2].split()[-7]) * 8
    out_busbw = float(lines[2].split()[-6])  * 8
    in_algbw = float(lines[2].split()[-3])  * 8
    in_busbw = float(lines[2].split()[-2])  * 8
    
    
    data = {
        'TYPE' : TEST_NAME,
        'GPU_Num' : SERVER_GPU,
        'Port_Num' : int(port_num),
        'QP': int(NCCL_IB_QPS_PER_CONNECTION),
        'SIZE' : SIZE,
        'Aggregation_Count' : agg_iters,
        'out_algbw(Gbps)' : round(out_algbw,2),
        'out_busbw(Gbps)' : round(out_busbw,2),
        'in_algbw(Gbps)' : round(in_algbw,2),
        'in_busbw(Gbps)' : round(in_busbw,2),
        'avg_switch_in(Gbps)' : round(switch_max_in_mbps / 1000,2) if switch_max_in_mbps else None,
        'avg_switch_out(Gbps)' : round(switch_max_out_mbps / 1000,2) if switch_max_out_mbps else None,
        }
    return data

    
def run_cmd(cmd):
    output = os.popen(cmd).read()
    return output 
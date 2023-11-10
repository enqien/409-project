import os , sys , multiprocessing , time , signal
from datetime import datetime
import re
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from utils import print_and_save , watch_switch , convert_to_bytes , convert_bytes , is_port_available
from testscripts.iperf import run_iperf
import random


# get the variable



def run_verb(
    TEST_NAME, # - TEST_NAME: ib_read , ib_write , ib_send , ib_atomic.
    SERVERS, # - SERVERS: The server IP or hostname.
    CLIENTS, # - CLIENTS: The client IP or hostname.
    PORT, # - PORT: How many ports it running.
    SIZE: str, # - SIZE: The size of the package. # 32KB
    CLASS, # - CLASS: --tclass=<value>  Set the Traffic Class in GRH (if GRH is in use).
    BIDIRECTION, # - BIDIRECTION: -b Whether use bidirectional.
    QP = 1, # - QP: -q, --qp=<num of qp's>  Num of qp's(default 1).
    NUMA_NODES = 0, #  - NUMA_NODES: numactl -N {NUMA_NODE}.
    RUNTIME = 60, # - RUNTIME: -D {Time(seconds)}.
    VERB_PATH = "",
    CUDA = None, # - CUDA: list contains CUDA Bus ID such as ["17:00.0","ca:00.0"]
    Switch_Hostname = None,
    Switch_Password = None,
    LOG_PATH = None
):
    """
    Run the Verb test with the given parameters and return the log path and parsed iperf data.

    Returns:
    - data: DICT, The parsed Verb data.
    """
    SERVERS = [SERVERS] if type(SERVERS) != type([]) else SERVERS
    CLIENTS = [CLIENTS] if type(CLIENTS) != type([]) else CLIENTS
    NUMA_NODES = [NUMA_NODES] if type(NUMA_NODES) != type([]) else NUMA_NODES
    if PORT != len(NUMA_NODES):
        raise ValueError(f"SERVERS = {SERVERS} , CLIENTS = {CLIENTS} , Port = {PORT} ,  numactl_node = {NUMA_NODES}.Please make sure PORT == NUMA_NODES Length")
    SIZE = convert_to_bytes(SIZE)
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
    def predata_collection(SERVERS,CLIENTS):
        # ======  PRE DATA COLLECTION
        for SERVER , CLIENT in zip(SERVERS,CLIENTS):
            for port in range(1,PORT+1):
                server = f"{SERVER}_Port{port}" ; client = f"{CLIENT}_Port{port}"
                SUT , S_DEV , S_IF , S_IP , S_GID , CNT , C_DEV , C_IF , C_IP , C_GID = init_vars(server,client)
                os.system(f'ssh root@{SUT} pkill ib_*')
                os.system(f'ssh root@{SUT} rm -rf /tmp/counters_*')
                os.system(f'ssh root@{CNT} rm -rf /tmp/counters_*')
                os.system(f'ssh root@{CNT} "/root/nic-counters-new.sh > /tmp/counters_1 2>/dev/null"')
                os.system(f'ssh root@{SUT} "/root/nic-counters-new.sh > /tmp/counters_1 2>/dev/null"')
                os.system(f'ssh root@{CNT} "mstregdump {C_DEV} > /tmp/mstregdump-{C_DEV}-before"')
                os.system(f'ssh root@{SUT} "mstregdump {S_DEV} > /tmp/mstregdump-{S_DEV}-before"')
        time.sleep(10)
    def function_with_timeout(timeout):
        def decorator(func):
            def wrapper(*args, **kwargs):
                # Define the timeout handler function
                def timeout_handler(signum, frame):
                    raise TimeoutError("Function execution timed out")

                # Set the timeout signal handler
                signal.signal(signal.SIGALRM, timeout_handler)
                signal.alarm(timeout)  # Set the timeout duration

                try:
                    return func(*args, **kwargs)
                except TimeoutError:
                    print("Function execution timed out")
                    return wrapper(*args, **kwargs)  # Recursively call the function
                finally:
                    signal.alarm(0)  # Cancel the timeout setting
            
            return wrapper
        return decorator
    
    
    @function_with_timeout(timeout=200)
    def run_bw():
        """======= RUN BW ======="""
        predata_collection(SERVERS,CLIENTS)
        print_and_save("BW RUN \n",result_log)
        BASE_PORT = 20000 + random.randint(100,200)
        server_cmds = [] ; client_cmds = [] ; client_out_paths = []
        for SERVER , CLIENT in zip(SERVERS,CLIENTS):
            for idx in range(PORT):
                numactl_node = NUMA_NODES[idx] ; port = idx + 1 ; cuda = CUDA[idx] if CUDA else None
                server = f"{SERVER}_Port{port}" ; client = f"{CLIENT}_Port{port}"
                SUT , S_DEV , S_IF , S_IP , S_GID , CNT , C_DEV , C_IF , C_IP , C_GID = init_vars(server,client)
                while not is_port_available(host=SUT,port=BASE_PORT) or not is_port_available(host=CNT,port=BASE_PORT):
                    BASE_PORT += 1
                print(f"host = {SUT} , PORT = {BASE_PORT} , {is_port_available(host=SUT,port=BASE_PORT)}")
                print(f"host = {CNT} , PORT = {BASE_PORT} , {is_port_available(host=CNT,port=BASE_PORT)}")
                # START SERVER
                server_out_path = os.path.join(LOG_PATH,f"{S_IP}_bw.out")
                server_cmd = f"numactl -N {numactl_node} {bw} -x {S_GID} --tclass {CLASS} --report_gbits -F -D {RUNTIME} -s {SIZE} -d {S_DEV} -p {BASE_PORT} -q {QP} "
                if BIDIRECTION:
                    server_cmd += " -b"
                if cuda:
                    server_cmd += f" --use_cuda_bus_id={cuda}"
                server_cmds.append(f"ssh root@{SUT} {server_cmd} | tee {server_out_path}")
            
                # START CLIENT
                client_out_path = os.path.join(LOG_PATH,f"{C_IP}_bw.out")
                client_out_paths.append(client_out_path)
                client_cmd = f"numactl -N {numactl_node} {bw} {S_IP} -x {C_GID} --tclass {CLASS} --report_gbits -F -D {RUNTIME} -s {SIZE} -d {C_DEV} -p {BASE_PORT} -q {QP}"
                if BIDIRECTION:
                    client_cmd += " -b"
                if cuda:
                    client_cmd += f" --use_cuda_bus_id={cuda}"
                client_cmds.append(f"ssh root@{CNT} {client_cmd} | tee {client_out_path}")

                BASE_PORT += QP + random.randint(100,2000)
        
        # ======= RUN BW
        server_cmds = " & ".join(server_cmds) ; client_cmds = " & ".join(client_cmds)
        runing_cmd = f"{server_cmds} & sleep 5 && {client_cmds}"
        print_and_save(f"\n\n Running CMD ====> \n{runing_cmd} \n\n",result_log)
        
        # switch_max_in_mbps , switch_max_out_mbps , port_num = parallel_running(runing_cmd,Switch_Hostname,Switch_Password,LOG_PATH)
        pool = multiprocessing.Pool()
        # apply_async
        test_result = pool.apply_async(run_cmd, (runing_cmd,))
        if Switch_Hostname:
            swtich_result = pool.apply_async(watch_switch, (Switch_Hostname,Switch_Password,LOG_PATH,))
        # Close
        pool.close()
        # get result
        test_result = test_result.get()
        _ , switch_max_in_mbps , switch_max_out_mbps , port_num = swtich_result.get() if Switch_Hostname != None else (None,None,None,None)
        
        # ======= PARSE
        
        # ======= Calculate BW result
        bw_result = 0
        for path in client_out_paths:
            bw_log = open(path, 'r').read()
            bw_result += float(bw_log.split("---------------------------------------------------------------------------------------")[-2].split("\n")[-2].split()[-2])
        bw_result = round(bw_result,2)
        return bw_result , switch_max_in_mbps , switch_max_out_mbps , port_num
    
    
    @function_with_timeout(timeout=200)
    def run_lat():
        """======= RUN LAT ======="""

        predata_collection(SERVERS,CLIENTS)
        print_and_save("LAT RUN \n",result_log)
        
        BASE_PORT = 20000 + random.randint(100,200)
        server_cmds = [] ; client_cmds = [] ; client_out_paths = []
        for SERVER , CLIENT in zip(SERVERS,CLIENTS):
            for idx in range(PORT):
                numactl_node = NUMA_NODES[idx] ; port = idx + 1 ; cuda = CUDA[idx] if CUDA else None
                server = f"{SERVER}_Port{port}" ; client = f"{CLIENT}_Port{port}"
                SUT , S_DEV , S_IF , S_IP , S_GID , CNT , C_DEV , C_IF , C_IP , C_GID = init_vars(server,client)
                while not is_port_available(host=SUT,port=BASE_PORT) or not is_port_available(host=CNT,port=BASE_PORT):
                    BASE_PORT += 1
                print(f"host = {SUT} , PORT = {BASE_PORT} , {is_port_available(host=SUT,port=BASE_PORT)}")
                print(f"host = {CNT} , PORT = {BASE_PORT} , {is_port_available(host=CNT,port=BASE_PORT)}")
                # START SERVER
                server_out_path = os.path.join(LOG_PATH,f"{S_IP}_lat.out")
                server_cmd = f"numactl -N {numactl_node} {lat} -x {S_GID} --tclass {CLASS} --report_gbits -F -D {RUNTIME} -s {SIZE} -d {S_DEV} -p {BASE_PORT}"
                if cuda:
                    server_cmd += f" --use_cuda_bus_id={cuda}"
                server_cmds.append(f"ssh root@{SUT} {server_cmd} | tee {server_out_path}")
                
                # START CLIENT
                client_out_path = os.path.join(LOG_PATH,f"{C_IP}_lat.out")
                client_out_paths.append(client_out_path)
                client_cmd = f"numactl -N {numactl_node} {lat} {S_IP} -x {C_GID} --tclass {CLASS} --report_gbits -F -D {RUNTIME} -s {SIZE} -d {C_DEV} -p {BASE_PORT}"
                if cuda:
                    client_cmd += f" --use_cuda_bus_id={cuda}"
                client_cmds.append(f"ssh root@{CNT} {client_cmd} | tee {client_out_path}")
                
                BASE_PORT += QP + random.randint(100,2000)
        
        # ======= RUN LAT
        server_cmds = " & ".join(server_cmds) ; client_cmds = " & ".join(client_cmds)
        runing_cmd = f"{server_cmds} & sleep 5 && {client_cmds}"
        print_and_save(f"\n\n Running CMD ====> \n{runing_cmd} \n\n",result_log)
        output = os.popen(runing_cmd).read()
        
        # ======= PARSE
        
        # ======= Calculate LAT result
        lat_result = 0
        for path in client_out_paths:
            lat_log = open(path, 'r').read()
            lat_result += float(lat_log.split("---------------------------------------------------------------------------------------")[-2].split("\n")[-2].split()[-2])
        lat_result = round(lat_result,2)
        return lat_result

    
    
    bw = os.path.join(VERB_PATH,f"{TEST_NAME}_bw")
    lat = os.path.join(VERB_PATH,f"{TEST_NAME}_lat") 
    result_log = os.path.join(LOG_PATH,"result.log")
    bw_result , switch_max_in_mbps , switch_max_out_mbps , port_num = run_bw()
    
    if QP > 1 or BIDIRECTION == True: # only when QP = 1 and Unidirectional can run the lat
        print_and_save("Only when QP = 1 and Unidirectional can run the lat",result_log)
        lat_result = None
    else:
        lat_result = run_lat()
        
    
    data = {
        'TYPE' : TEST_NAME,
        'SERVERS' : len(SERVERS),
        'CLIENTS' : len(CLIENTS),
        'PORT' : int(port_num),
        'SIZE' : convert_bytes(SIZE),
        'CLASS' : CLASS,
        'QP' : QP,
        'BIDIRECTION' : str(BIDIRECTION),
        "BW(Gpbs)" : bw_result,
        "Latency(usec)" : lat_result,
        'avg_switch_in(Gbps)' : round(switch_max_in_mbps / 1000,2) if switch_max_in_mbps else None,
        'avg_switch_out(Gbps)' : round(switch_max_out_mbps / 1000,2) if switch_max_out_mbps else None,
        }
    return data

def run_cmd(cmd):
    output = os.popen(cmd).read()
    return output 

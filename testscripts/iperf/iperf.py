import os , sys
from datetime import datetime
import re
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from utils import print_and_save

def run_iperf(
    S:str, # SERVER
    C:str, # CLIENT
    PARALLEL:int,
    LENGTH:str,
    WINDOW:str,
    BIDIRECTION:bool,
    LOG_PATH:str
):
    """
    Run the Iperf test with the given parameters and return the parsed NCCL data.
    
    Returns:
    - data: DICT, The parsed Iperf data.
    """
    ROUNDTIME=10 # 10s per round
    
    #grab the server info
    metadata_path = os.path.join(LOG_PATH,'metadata.cfg')
    metadata = open(metadata_path, 'r').readlines()
    metadata = {item.replace("\n","").split("=")[0] : item.replace("\n","").split("=")[1] for item in metadata if len(item.split("=")) == 2}
    
    def init_vars(SERVER,CLIENT):
        # init_vars
        SUT = metadata[SERVER]
        S_IP=metadata[f"{SERVER}_NETDEV_IP"]
        
        CNT=metadata[CLIENT]
        C_IP=metadata[f"{CLIENT}_NETDEV_IP"]
        return SUT , S_IP , CNT , C_IP

    
    #Kill existing iperf tests
    SUT , S_IP , CNT , C_IP = init_vars(S,C)
    os.system(f'ssh root@{SUT} pkill iperf')
    os.system(f'ssh root@{SUT} pkill iperf3')
    os.system(f'ssh root@{CNT} pkill iperf')
    os.system(f'ssh root@{CNT} pkill iperf3')
    
    
    #start server
    result_log = os.path.join(LOG_PATH,"result.log")
    server_out_path = os.path.join(LOG_PATH,f"{S_IP}.out")
    server_cmd = f"iperf --bind {S_IP} -s -D"
    cmd = f"ssh root@{SUT} {server_cmd} | tee {server_out_path}"
    print_and_save(cmd,result_log)
    output = os.popen(cmd).read()
    
    #start client and output results
    client_out_path = os.path.join(LOG_PATH,f"{C_IP}.out")
    client_cmd = f"iperf --bind {C_IP} -c {S_IP} -P {PARALLEL} -l {LENGTH} -w {WINDOW} -t {ROUNDTIME}"
    if BIDIRECTION:
        client_cmd += " -d"
    cmd = f"ssh root@{CNT} {client_cmd} | tee {client_out_path}"
    print_and_save(cmd,result_log)
    output = os.popen(cmd).read()
    
    if int(PARALLEL) > 1:
        for line in output.split("\n"):
            if line.startswith("[SUM]"):
                bw = float(line.split()[-2])
    else:
        bw = 0
        for line in output.split("\n"):
            if line.endswith("Gbits/sec"):
                bw += float(line.split()[-2])
    data = {
         "PARALLEL":PARALLEL,
         "LENGTH": LENGTH,
         "WINDOW":WINDOW,
         "BIDIRECTION":str(BIDIRECTION),
         "Bandwidth(Gbps)":bw
    }
    return data
import os
from datetime import datetime
import sys
import re

# get the variable



def run_iperf(SERVER,CLIENT,PARALLEL,LENGTH,WINDOW,BIDIRECTION):
    """
    Run the iperf test with the given parameters and return the log path and parsed iperf data.

    Args:
    - SERVER: The server IP or hostname.
    - CLIENT: The client IP or hostname.
    - PARALLEL: Number of parallel streams.
    - LENGTH: Length of the test.
    - WINDOW: TCP window size.
    - BIDIRECTION: Whether to enable bidirectional testing.

    Returns:
    - LOG_PATH: STRING , The path to the log folder.
    - data: DICT, The parsed iperf data.
    """
    PERFY_HOME = os.environ.get('PERFY_HOME')
    IPERF_TEST = os.path.join(PERFY_HOME, "testscripts", "iperf", "iperf.sh")
    T = datetime.now().strftime("%s")
    LOG = "LOG_IPERF"
    LOG_PATH = os.path.join(PERFY_HOME, "LOGS", LOG, f"{T}__{LOG}")

    # run the command to get the logs folder
    print(f"Making LOG PATH >>>>>>>>>>{LOG_PATH}")
    os.makedirs(LOG_PATH)
    
    # get the system info
    command = f"bash {PERFY_HOME}/utils/server.sh {LOG_PATH}"
    os.system(command)
    
    # run iperf
    command = f"bash {IPERF_TEST} {SERVER} {CLIENT} {LOG_PATH} {PARALLEL} {LENGTH} {WINDOW} {BIDIRECTION} {LOG_PATH} | tee {os.path.join(LOG_PATH, 'results.log')}"
    os.system(command)
    
    # parse the iperf
    data = parse_iperf(file_name = os.path.join(LOG_PATH,"results.log"))
    
    return LOG_PATH , data  # {"LOG_PATH" : LOG_PATH,"data":data}

def parse_iperf(file_name):
    """Parse iperf result log."""
    f=open(file_name, 'r')
    for line in f.readlines():
        if re.match(">>>>.*=>.*$",line):
            lhs, val = line.split("=>")
            lhs = lhs.split()
            res = {
                'PARALLEL' : lhs[1].split(':')[1].strip(),
                'LENGTH' : lhs[2].split(':')[1].strip(),
                'WINDOW' : lhs[3].split(':')[1].strip(),
                'BIDIRECTION': lhs[4].split(':')[1].strip(),
                'Bandwidth(Gbps)' : val.strip() or "0"
                }
            return res
    return None
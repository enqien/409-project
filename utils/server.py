
import os
import sys
import json
import requests
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from utils import parse_LOGS, parse_system_info , print_and_save , get_system_info
import shutil



def get_netdev(host, port):
    """
    Retrieves the network device associated with the specified host and port using SSH command.

    Args:
        host (str): The hostname or IP address of the remote server.
        port (int): The port number associated with the network device.

    Returns:
        str: The network device name.

    Example:
        get_netdev('example.com', 1)  # Returns: 'mlx4_0'

    Note:
        This function establishes an SSH connection to the specified host and executes a command to retrieve
        the network device associated with the given port. The SSH command used is 'ibdev2netdev', which lists
        InfiniBand devices and their corresponding network devices. The output is then filtered and parsed
        to extract the network device name.

        The function assumes that SSH key-based authentication has been set up for the 'root' user on the
        remote server. It also relies on the 'os' module to execute the SSH command and retrieve the output.

        If the specified host or port is invalid, or if the SSH command fails to retrieve the network device,
        an appropriate error may be raised or an empty string may be returned.
    """
    command = f"ssh root@{host} ibdev2netdev | grep Up | grep mlx | head -2 | grep 'port {port}' | awk '{{print $(NF-1)}}'"
    netdev = os.popen(command).read().strip()
    return netdev
def netdev2ibdev(host,netdev):
    """
    Retrieves the InfiniBand device associated with the specified network device using SSH command.

    Args:
        host (str): The hostname or IP address of the remote server.
        netdev (str): The network device name.
        user (str, optional): The username used for the SSH connection. Defaults to 'root'.

    Returns:
        str: The InfiniBand device name.

    Example:
        netdev2ibdev('example.com', 'mlx4_0')  # Returns: 'ib0'
    """
    command = f"ssh root@{host} ibdev2netdev"
    output = os.popen(command).read().split("\n")
    for i in output:
        if netdev in i:
            return i.split()[0]
        
def get_ip(host,netdev):
    """
    Retrieves the IP address associated with the specified network device on a remote server using SSH command.

    Args:
        host (str): The hostname or IP address of the remote server.
        netdev (str): The network device name.
        user (str, optional): The username used for the SSH connection. Defaults to 'root'.

    Returns:
        str: The IP address associated with the network device.

    Example:
        get_ip('example.com', 'eth0')  # Returns: '192.168.1.100'
    """
    command = f"ssh root@{host} ifconfig {netdev} | grep 'inet ' | awk '{{print $2}}'"
    output = os.popen(command).read().strip()
    return output

def get_gid(host,ip):
    """
    Retrieves the GID (Global Identifier) associated with the specified IP address on a remote server using SSH command.

    Args:
        host (str): The hostname or IP address of the remote server.
        ip (str): The IP address for which to retrieve the GID.
        user (str, optional): The username used for the SSH connection. Defaults to 'root'.

    Returns:
        str: The GID (Global Identifier) associated with the IP address.

    Example:
        get_gid('example.com', '192.168.1.100')  # Returns: 3
    """
    command = f"ssh root@{host} show_gids | grep {ip} | grep 'v2' | awk '{{print $3}}'"
    output = os.popen(command).read().strip()
    return output

def get_metadata(svm,host,ifname = None):
    """
    Retrieves metadata information for a specified SVM (Storage Virtual Machine) and host.

    Args:
        svm (str): The name of the SVM.
        host (str): The hostname or IP address of the host.
        ifname (str, optional): The network device name. If not provided, it will be obtained using the
            'get_netdev' function with default port 1.

    Returns:
        str: A formatted string containing the metadata information.

    Example:
        get_metadata('SERVER', 'nsn160-58', ifname='ens800f0np0')
        # Returns a string with the metadata information for 'svm1' on 'example.com'.
    """
    if not ifname:
        ifname = get_netdev(host,port=1)
    dev = netdev2ibdev(host,ifname)
    net_ip = get_ip(host,ifname)
    gid = get_gid(host,net_ip)
    return f"""{svm}={host}
{svm}_DEV={dev}
{svm}_NETDEV={ifname}
{svm}_NETDEV_IP={net_ip}
{svm}_GID={gid}"""


def save_to_system_info(host_info,save_path):
    """
    Retrieves and saves system information from all nodes specified in the host_info to a file.

    Args:
        host_info (list): A list of strings containing SVM and host information in the format "svm=host".
        save_path (str): The file path to save the system information.

    Example:
        host_info = ['svm1=host1', 'svm2=host2']
        save_to_system_info(host_info, '/path/to/save.txt')
    """
    print_and_save("--------------------------",save_path)
    print_and_save("System info from all nodes",save_path)
    print_and_save("--------------------------\n",save_path)
    for line in host_info:
        svm , host = line.split("=")
        host = host.split()
        if len(host) == 1:
            host , ifname = host[0] , None
        else:
            host , ifname = host[0] , host[1]
        ifname = get_netdev(host,port=1) if not ifname else ifname
        print_and_save(f"^^^^ {line}",save_path)
        for key , value in get_system_info(host,ifname).items():
            print_and_save(f"{key}:{value}",save_path)
        print_and_save("^^^^\n",save_path)
        
def save_to_metadata_cfg(host_info,save_path):
    """
    Retrieves metadata information for each host specified in the host_info and saves it to a metadata configuration file.

    Args:
        host_info (list): A list of strings containing SVM and host information in the format "svm=host".
        save_path (str): The file path to save the metadata configuration.

    Example:
        host_info = ['svm1=host1', 'svm2=host2']
        save_to_metadata_cfg(host_info, '/path/to/metadata.cfg')
    """
    print_and_save("#!/bin/bash\n",save_path)
    for line in host_info:
        svm , host = line.split("=")
        host = host.split()
        if len(host) == 1:
            host , ifname = host[0] , None
        else:
            host , ifname = host[0] , host[1]
        ifname = get_netdev(host,port=1) if not ifname else ifname
        print_and_save(f"{get_metadata(svm,host,ifname)}\n",save_path)
        
def run_server(run_path,save_path = None,perfy_url = None):
    """
    run_path : the path to save the host.info and the switch.info
    save_path : the path to save the metadata.cfg , system.info , config.cfg , usually will be the LOG_PATH
    perfy_home : perfy url, to check whether the metacfg and the systeminfo in the database
    """
    os.makedirs(save_path) if not os.path.exists(save_path) else None
    save_path = run_path if not save_path else save_path
    host_info_path = os.path.join(run_path,"host.info")
    host_info = [i.strip() for i in open(host_info_path, 'r').readlines() if not i.startswith("#")]
    switch_info_path = os.path.join(run_path,"switch.info")
    
    # run metadata.cfg
    metadata_save_path = os.path.join(save_path,"metadata.cfg")
    save_to_metadata_cfg(host_info=host_info,save_path=metadata_save_path)
    
    # get system.info
    system_info_path = os.path.join(save_path,"system.info")
    save_to_system_info(host_info=host_info,save_path=system_info_path)
    
    # config info == > to be added
    
    
    # copy host.info and switch.info into save_path
    if os.path.exists(host_info_path):
        shutil.copy(host_info_path, save_path)
    if os.path.exists(switch_info_path):
        shutil.copy(switch_info_path, save_path)
    
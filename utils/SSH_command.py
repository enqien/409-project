import paramiko , os
from datetime import datetime
from .print_and_save import print_and_save


def is_port_available(host,port,username='root'):
    """
    Checks if a port is available on the specified host by inspecting the network status using SSH command.

    Args:
        host (str): The hostname or IP address of the remote server.
        port (int): The port number to check availability.
        username (str, optional): The username used for the SSH connection. Defaults to 'root'.

    Returns:
        bool: True if the port is available, False otherwise.

    Example:
        is_port_available('example.com', 8080, username='admin')
        # Returns True if port 8080 is available on 'example.com', False otherwise.
    """
    output = os.popen(f'ssh {username}@{host} netstat -ano').read()
    if f':{port}' not in output:
        return True
    return False
        
def find_available_port(host,username='root',port = 2000):
    """
    Finds an available port on the specified host by checking the network status using SSH command.

    Args:
        host (str): The hostname or IP address of the remote server.
        username (str, optional): The username used for the SSH connection. Defaults to 'root'.
        port (int, optional): The starting port number to check availability. Defaults to 2000.

    Returns:
        int: An available port number.

    Example:
        find_available_port('example.com', username='admin', port=3000)
        # Returns an available port number on 'example.com' starting from port 3000.
    """
    while True:
        output = os.popen(f'ssh {username}@{host} netstat -ano').read()
        if f':{port}' not in output:
            return port
        port += 1

def watch_switch(hostname,password,LOG_PATH,username = 'admin',run_time=60 , Et = None):
    """
    Watches the network switch on the specified host and retrieves relevant information.

    Args:
        hostname (str): The hostname or IP address of the network switch.
        password (str): The password for authentication.
        LOG_PATH (str): The path to save the output logs.
        username (str, optional): The username used for the SSH connection. Defaults to 'admin'.
        run_time (int, optional): The duration, in seconds, to watch the switch. Defaults to 60.
        Et (list, optional): A list of interface names to monitor. If not provided, it will be determined
                             dynamically based on the initial 'show int status' command.

    Returns:
        tuple: A tuple containing the maximum input Mbps, maximum output Mbps, the corresponding output
               log, and the number of ports with data.

    Example:
        watch_switch('switch.example.com', 'password', '/path/to/logs', username='admin', run_time=120)
    
    Note:
        show connected interface with `show int status`: 
        Port       Name                        Status       Vlan     Duplex Speed  Type         Flags Encapsulation
        Et1/1      nsn160-58-ens800f1+ens840f1 connected    1        full   100G   100GBASE-CR4                   
        Et2/1      nsn160-62-ens800f0+ens840f0 connected    1        full   100G   100GBASE-CR4                   
        Et3/1      nsn160-58-ens800f0+ens840f0 connected    1        full   100G   100GBASE-CR4                   
        Et4/1      nsn160-62-ens800f1+ens840f1 connected    1        full   100G   100GBASE-CR4                   


        show max in and out Mbps with `show int counter rate | nz`: 
        Port      Name        Intvl   In Mbps      %  In Kpps  Out Mbps      % Out Kpps
        Et1/1     nsn160-58-e  0:05   49172.0  49.4%     1476     460.8   0.6%      738
        Et2/1     nsn160-62-e  0:05     460.7   0.6%      738   49164.6  49.4%     1476
        Et3/1     nsn160-58-e  0:05   49164.0  49.4%     1476     460.7   0.6%      738
        Et4/1     nsn160-62-e  0:05     460.8   0.6%      738   49172.2  49.4%     1476
    """
    port = 22
    output_path = os.path.join(LOG_PATH,f"watch_switch_{hostname}.out")
    # Create SSH
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    # Connect
    client.connect(hostname, port, username, password)

    start_time = datetime.now()
    command = "show int status"
    stdin, stdout, stderr = client.exec_command(command)
    int_status = stdout.read().decode().split("\n")
    int_status = [int_status[0]] + [line for line in int_status if line.strip().split() and line.strip().split()[2].strip() == "connected"]
    
    int_status = "\n".join(int_status)
    
    #  ==== get Et ===
    if not Et:
        Et = [] ; device_name = None
    for line in int_status.split("\n")[1:]:
        line = line.strip().split()
        device_name = line[1][:10] if not device_name else device_name# get the first 10 chars
        Et.append(line[0]) if line[1].startswith(device_name) else None
    #  =======
    print_and_save(f"show connected interface with `show int status`: \n{int_status}\n\n",output_path)
    
    max_in_mbps = 0 ; max_out_mbps = 0 ; max_output = None ; port_num = 0
    # watching
    start_time = datetime.now()
    while (datetime.now() - start_time).seconds < run_time:
        # CMD
        command = 'show int counter rate | nz'
        stdin, stdout, stderr = client.exec_command(command)
        # Get output
        output = stdout.read().decode()
        in_mbps = [] ; out_mbps = []
        for line in output.split("\n")[1:]:
            line = line.strip().split()
            in_val = float(line[3]) if line else None ; out_val = float(line[6]) if line else None
            if not line or line[0] not in Et or (in_val < 1000 and out_val < 1000):
                continue
            in_mbps.append(in_val) ; out_mbps.append(out_val)
        # Close
        if in_mbps and out_mbps and sum(in_mbps) >= max_in_mbps and sum(out_mbps) >= max_out_mbps:
            max_output = output
            max_in_mbps = sum(in_mbps)
            max_out_mbps = sum(out_mbps)
            port_num = len(in_mbps)
    print_and_save(f"show max in and out Mbps with `show int counter rate | nz`: \n{max_output}\n\n",output_path)
    client.close()
    return max_output , max_in_mbps , max_out_mbps , port_num
import sys
from pathlib import Path
import os

def get_system_info(ip, ifname):
    """
    return examples
    {'HOSTNAME': 'nsn160-58.us.oracle.com',
    'SERVER_TYPE': '',
    'SERVER': 'SERVER: ORACLE SERVER X9-2c',
    'BIOS': 'BIOS: 66090200',
    'CPU': 'Intel(R) Xeon(R) Platinum 8358 CPU @ 2.60GHz Intel(R) Xeon(R) Platinum 8358 CPU @ 2.60GHz',
    'MEMORY': '0x DIMM(s)',
    'HCA': 'LP ADAPTER, DUAL QSFP56 2X50 GbE 2x50G, ConnectX-6 DX, PCIE 4.0X16',
    'HCA FW': '22.28.1602 22.36.1010',
    'KERNEL': '5.4.17-2136.307.3.1.el8uek.x86_64',
    'ILOM': 'Version: 5.1.1.91 r150981',
    'IMAGE': 'NA',
    'OS': 'Red Hat Enterprise Linux release 8.6 (Ootpa)',
    'INTERFACE': 'ens800f0np0',
    'INTERFACE_INFO': ' ...'}
 """
    def ssh_command(ip, command):
        ssh_cmd = f'ssh root@{ip} "{command}"'
        result = os.popen(ssh_cmd).read().strip()
        return result

    hostname = ssh_command(ip, "hostname")
    server_type = ssh_command(ip, "[[ -e /etc/init.d/dbserverd ]] && echo 'DB' || ( [[ -e /etc/init.d/cellwall ]] && echo 'CELL' ) || echo NA")
    server = ssh_command(ip, "echo -n ; [[ -x $(which dmidecode 2>/dev/null) ]] && echo $(dmidecode -s system-product-name) || echo NA")
    bios = ssh_command(ip, "echo -n 'BIOS: '; [[ -x $(which dmidecode 2>/dev/null) ]] && echo $(dmidecode -s bios-version) || echo NA")
    cpu = ssh_command(ip, "[[ -x \$(which dmidecode 2>/dev/null) ]] && echo \$(dmidecode -s processor-version) || echo NA")
    memory = ssh_command(ip, "count=\$(dmidecode | grep 'Memory Device Mapped Address' -A3 | grep -c Size); size=\$(dmidecode | grep 'Memory Device Mapped Address' -A3 | grep Size | sort | head -1 | awk '{print \$3\$4}'); echo \${count}x \${size} 'DIMM(s)'")
    bus_info = os.popen(f"ssh root@{ip} ethtool -i {ifname} | grep -i bus").read().replace("\n","").split(":",maxsplit=1)[1].strip()
    hca = os.popen(f'ssh root@{ip} lspci -s {bus_info} -vv | grep "Product Name"').read().split(":",maxsplit=1)[1].strip()
    hca_fw = os.popen(f"ssh root@{ip} ethtool -i {ifname} | grep -i firmware-version").read().split(":",maxsplit=1)[1].strip()
    kernel = ssh_command(ip, "uname -r")
    ilom = ssh_command(ip, r"[[ -x \$(which ipmitool 2>/dev/null) ]] && echo \$(ipmitool sunoem version) || echo NA")
    image = ssh_command(ip, r"[[ -x \$(which imageinfo 2>/dev/null) ]] && echo \$(imageinfo 2>/dev/null | grep -E 'Active image version|Image version' | awk '{print \$NF}') || echo NA")
    os_info = ssh_command(ip, r"[[ -e /etc/redhat-release ]]  && echo \$(cat /etc/redhat-release) || echo NA")
    interface = ssh_command(ip, f"ifconfig {ifname} |tr '\n' ';'")
    interface_name = interface.split(":")[0]
    interface_info = ":".join(interface.split(":")[1:])
    system_info = {
        'HOSTNAME': hostname,
        'SERVER_TYPE': server_type,
        'SERVER': server,
        'BIOS': bios,
        'CPU': cpu,
        'MEMORY': memory,
        'HCA': hca,
        'HCA_FW': hca_fw,
        'KERNEL': kernel,
        'ILOM': ilom,
        'IMAGE': image,
        'OS': os_info,
        'INTERFACE': interface_name,
        'INTERFACE_INFO' : interface_info
    }
    return system_info



def parse_system_info(systems):
    task_system = {}
    for idx , system in enumerate(systems):
        hostname , interface = system["HOSTNAME"] , system["INTERFACE"]
        task_system[f"system_{idx}"] = f"{hostname}:{interface}"
    task_system = ",".join(["=".join([k,v])for k ,v in task_system.items()])
    task_system
    return task_system
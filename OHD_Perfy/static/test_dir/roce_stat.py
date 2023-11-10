#!/usr/bin/python
#
# Copyright (c) 2018, Oracle and/or its affiliates. All rights reserved.
#
# This Software is licensed under one of the following licenses:
#
# 1) under the terms of the "Common Public License 1.0" a copy of which is
#    available from the Open Source Initiative, see
#    http://www.opensource.org/licenses/cpl.php.
#
# 2) under the terms of the "The BSD License" a copy of which is
#    available from the Open Source Initiative, see
#    http://www.opensource.org/licenses/bsd-license.php.
#
# 3) under the terms of the "GNU General Public License (GPL) Version 2" a
#    copy of which is available from the Open Source Initiative, see
#    http://www.opensource.org/licenses/gpl-license.php.
#
# Licensee has the right to choose one of the above licenses.
#
# Redistributions of source code must retain the above copyright
# notice and one of the license notices.
#
# Redistributions in binary form must reproduce both the above copyright
# notice, one of the license notices in the documentation
# and/or other materials provided with the distribution.
#
# rajiv.raja@Oracle.com
#
# ver=0.2
# - Fixed incorrect tx/rx counting [1]
# ver=0.1
# - init release

import subprocess, os, re, pprint, datetime, multiprocessing
from multiprocessing import Process, Queue
from time import sleep

SAMPLE_SEC=1

roce_script="for intf in $(/usr/bin/ibdev2netdev|awk '{print $5}');"+\
     "do echo \"($intf) packet distribution per priority\";"+\
     "/usr/sbin/ethtool -S $intf|grep prio|awk '$2  > 0'; done;"

def parse_counters(s):
    ret = {}
    netdev = None 
    begin = False
    for i in s:
        if re.match('^.*packet distribution per priority$', i):
            netdev = re.search('^.*\((.*)\).* per priority$', i).group(1)
            ret[netdev] = {}
        elif netdev and re.match("^.*_prio[0-7]_bytes", i):
            k,v = list(map(str.strip, i.split(':')))
            ret[netdev][k.replace('bytes','bw')] = int(v)
    return ret

def display(data):
    pre_header = "Exadata RoCE NIC stats: "+\
        "%s" % (datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    header = ['Netdev', 'Queue', 'tx_bytes', 'rx_bytes', 'tx/s (Gbps)', 
        'rx/s (Gbps)'] 
    header_str = "%-16s %-12s %16s %16s %16s %16s" % tuple(header)
    table = ['', pre_header,'',header_str,'']
    for netdev in sorted(data):
        #for qno in sorted(data[netdev]):
        for qno in map(str, range(8)):
            val = data[netdev][qno] if qno in data[netdev] else {}
            table_row = ['-']*len(header)
            table_row[0] = netdev
            table_row[1] = qno
            if int(qno) == 0:
                table_row[1] = "0 (Default)"
            elif int(qno) == 7:
                table_row[1] = "7 (CNP)"
            table_row[2] = val['tx']['bytes'] if 'tx' in val else 0
            table_row[3] = val['rx']['bytes'] if 'rx' in val else 0
            table_row[4] = "%02.2f" % (val['tx']['bw'] if 'tx' in val else 0)
            table_row[5] = "%02.2f" % (val['rx']['bw'] if 'rx' in val else 0)
            table_row = "%-16s %-12s %16s %16s %16s %16s" % tuple(table_row)
            table.append(table_row) 
        table.append('')
    for row in table:
        print(row)

def print_nic_counters(q):
    prev = None
    while True:
        val = q.get()
        if val:
            curr = parse_counters(val)
            if prev:
                bw = lambda x,y: float(
                    "%0.2f" % ((float(y)-float(x))/134217728/SAMPLE_SEC))
                ret = {}
                for netdev, counters in list(prev.items()):
                    ret[netdev] = {}
                    for k in prev[netdev]:
                        if k in curr[netdev]:
                            dir, qno = [x.replace('prio','') for x in k.split('_')[0:2]]
                            v = bw(prev[netdev][k], curr[netdev][k])
                            # bug[1] where tx or rx were being count only once
                            ret[netdev].setdefault(qno, {})[dir] = \
                                {'bytes': curr[netdev][k], 'bw': v}
                display(ret)
            sleep(1)
            prev = curr
        q.put(None)

def get_nic_counters(q):
    while True:
        q.put(subprocess.Popen(roce_script, shell=True, 
            stdout=subprocess.PIPE).stdout.readlines())
        sleep(SAMPLE_SEC)

if __name__ == "__main__":
    q = Queue()
    jobs = [Process(target=get_nic_counters, args=(q,)), 
            Process(target=print_nic_counters, args=(q,))]
    list(map(lambda x: x.start(), jobs))
    try:
        list(map(lambda x: x.join(), jobs))
    except KeyboardInterrupt:
        list(map(lambda x: x.terminate(), jobs))
        print()

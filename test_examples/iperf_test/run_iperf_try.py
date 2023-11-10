import os
import sys
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from testscripts import post_matrix , run_iperf

"-------------modify your config-----------"
config = {
    "BASE_URL": "http://nsn160-58/perfy/", # base URL
    "user_name" : "user", # user
    "user_password" : "******", # password
    "task_category": "iperf", # the tab name in the home_page
    "task_name": "iperf_test",  # the name that you want to display
    "index_columns": ["PARALLEL", "LENGTH", "WINDOW", "BIDIRECTION"], # the index of the table
    "feature_columns": {"Bandwidth(Gbps)": "max"} # the key is the feature of the table , and the value is the best_value method of the column
}
"------------------------------------------"

post_matrix(function=run_iperf,params={"S":"SERVER1","C":"CLIENT1","PARALLEL" : "1","LENGTH":"64k","WINDOW":"512k","BIDIRECTION":False},config = config)

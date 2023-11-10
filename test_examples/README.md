# test_examples

The examples for running different tests.

Currently, you need to include the **host.info** and **your py** script to run the test. And you should **go to the dictionary** of your py file to run the py

Before running the Command, you should check whether your server can ssh into the servers in the host.info by the following command:

```bash
ssh sername@remote_host
```

If you need input the password, then you can try the following command to easily ask the remote server without input the password:

```bash
# the general command is:
ssh-copy-id -i path/to/public_key_file username@remote_host
# usually the public_key_file will be ~/.ssh/id_rsa.pub
# so you can just run
ssh-copy-id -i ~/.ssh/id_rsa.pub username@remote_host
```

## How to run the tests

Before running, you should make sure you are **activating the perfy environment** by running the following command in project main dictionary:

```bash
source setup.sh

# You will see the following output.
# Redirecting to /bin/systemctl start mysqld.service
# PERFY_HOME is set to: /root/ohd_perfy
# if you want to start your Django project use the following command: 
#       1. to quick start by running 'python manage.py runserver'
#       2. to run in the backend by running 'nohup python manage.py runserver <your-public-ip>:<port>'
# (perfy-python) [root@nsn160-62 ohd_perfy]

# In the folder that contains host.info and your python file, run the following command to run the task:
python your_python_file_name
```

For the host.info:

```bash
SVM_name=server_ip server_interface

# Example:
SERVER_Port1=nsn160-58 ens800f0np0
SERVER_Port2=nsn160-58 ens800f1np1
SERVER_Port3=nsn160-58 ens840f0np0
SERVER_Port4=nsn160-58 ens840f1np1
CLIENT_Port1=nsn160-62 ens800f0np0
CLIENT_Port2=nsn160-62 ens800f1np1
CLIENT_Port3=nsn160-62 ens840f0np0
CLIENT_Port4=nsn160-62 ens840f1np1
```

For python. First to import some function:

```python
import os, sys , json , time
PERFY_HOME = os.environ.get('PERFY_HOME')
sys.path.append(PERFY_HOME)
from testscripts import your_test_function , post_matrix , debugger
from utils import print_and_save
```

And you should provide your config, which is to represent you connect which Perfy Website and your task metadata

```python
config = {
            "BASE_URL": "http://example.com", # Modify if necessary. The URL of the Perfy Home_page
            "user_name": "username", # Modify if necessary. For the post user name.
            "user_password": "password" # Modify if necessary. For the post user password.
            "task_category": "category", # Modify if necessary. The name that you want to display
            "task_name": "task", # MUST Modify. The task name.
            "template": "template.html", # If you do not give this parameter. The default will be "matrix.html".
            "index_columns": ["col1", "col2"], # Modify if necessary. The index columns, based on the function that you are going to run.
            "feature_columns": {"feat1": "min", "feat2": "max"}, # Modify if necessary. The key is the feature of the table , and the value is the best_value method of the column
        }

# Here is the real examples:

config = {
    "BASE_URL": "http://nsn160-58:8000/perfy", # base URL
    "user_name" : "junewu", # user
    "user_password" : "*******", # password
    "task_category": "nccl", # the tab name in the home_page
    "task_name": "NCCL_4PORT",  # the name that you want to display
    "index_columns": ["TYPE", "GPU_Num","Port_Num","QP", "SIZE", "Aggregation_Count"], # the index of the table
    "feature_columns": {"out_algbw(Gbps)": "max", "out_busbw(Gbps)":"max","in_algbw(Gbps)":"max","in_busbw(Gbps)":"max","avg_switch_in(Gbps)":"max","avg_switch_out(Gbps)":"min"}, # the key is the feature of the table , and the value is the best_value method of the column
}
```

And then you should provide your params for the function, you should check the specific running functions for params that you need to input. Provide these parameters in **dict** type. When writing your testing function, you should give a default input parameter ***LOG_PATH***, but you don’t need to provide this parameter, because when you are using debugger or post_matrix function, it will automatically generate for you:

```python
params = {
    "NCCL_HOME":"/root/nccl-bin",
    "MPI_HOME":"/usr/mpi/gcc/openmpi-4.1.5a1/bin/mpirun",
    "SERVERS":"SERVER",
    "CLIENTS":"CLIENT",
    "Switch_Hostname":"10.134.160.53",
    "Switch_Password":"Pass1234",
    "bind_to" : "numa",
		# ....
}

# run debugger or run post_matrix
debugger(function=your_test_function,params=params,config = config)
post_matrix(function=your_test_function,params=params,config = config)
```

for the **debugger** and **post_matrix**, it contains three parameters:

1. function: is the function to run the test. For different tests will use different functions. You can also customize your own function. But if you want to use **debugger** and **post_matrix** to warp your function, you should include a **LOG_PATH** parameter in your customized function. You can also refer the function in **test_scripts** about how to customize your function.
2. params: these parameters will go into the **function** that you set.
3. config: It will specify which website you want to send connection requests and data to. You can refer to the format of config in the example above.

**debugger** is for you to debug and check the connection with the perfy website that you provide and not post data into the perfy. While **post_matrix** is actually posting data into the website.

When you are running **debugger**,it will generate the **Debugger_LOGS** in your current running dictionary, which is for you to check the log output. If you are using the incorrect user_name and user_password, it will post

```bash
ValueError: Query system info by posting into `http://nsn160-58:8000/perfy/query_SystemsInfo` Failed with the response `Verfication Failed: user_name or user_password not correct`
```

If your function does not return a dict value, it will post

```bash
ValueError: Check your `function` return. The return data must be a dictionary. Your type is <class 'int'>
```

Once you are using debugger to check the output of data (You can see it from the log like the following):

```
Result >>>>>>>>>>    
       TYPE : all_reduce_perf
       GPU_Num : 1
       Port_Num : 1
       QP : 1
       SIZE : 32KB
       Aggregation_Count : 1
       out_algbw(Gbps) : 10.88
       out_busbw(Gbps) : 10.88
       in_algbw(Gbps) : 10.88
       in_busbw(Gbps) : 10.88
       avg_switch_in(Gbps) : 22.71
       avg_switch_out(Gbps) : 22.72
End Result >>>>>>>>>>
```

You can use **post_matrix** to post the data into the perfy. When you are running **post_matrix**, it will generate the log in OHD_Perfy’s **main** dictionary.

There are some log_output_example for posting matrix:

```bash
# When you see GET CODE 200, which means it is sucessful. And the log will end with total running time.
post data to http://nsn160-58/perfy/post_data 
GET CODE 200
post task to http://nsn160-58/perfy/post_TasksInfo 
GET CODE 200
SUCCESS!!!!
Total Running Time: 18s

# When you see GET CODE 500, usually it will be some errors in your config variable, you can check your `task_name` , `task_category` , `index_columns` and `feature_columns`
post data to http://nsn160-58/perfy/post_data 
GET CODE 500

# When you see GET CODE 400, usually you need to check your `user_name` and `user_password` in your Perfy Website in `base_url`. And also check whether the `task_name` is belong to you
post data to http://nsn160-58:80/perfy/post_data 
GET CODE 200
post task to http://nsn160-58:80/perfy/post_TasksInfo 
GET CODE 400
Failed!!!! With error post_user is junewu, but the task is belong to root
```



If you are running a task with a lot of different input parameters, you can use **nohup** to run it. It will generate a **nohup.out** for you to check the progress and the output of running.


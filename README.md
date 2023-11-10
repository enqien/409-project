# OHD_Perfy

## 2. Installation

### 1.2 Then build your env:

```bash
cd build

source build.sh
```

After building the env. Run the following command to check:

```bash
# at least the following packages should be installed: python3 python3-pip  mysql  mysql-server git
# The current building file only support Oracle Linux 8, If you have Oracle Linux 7 or a higher version, you should install these pacakages by yourself.

# run the following command to check. If there is any output, which means this one is installed
yum list installed | grep package_name

# Example:
yum list installed | grep mysql-server
# output will be:
# mysql-server.x86_64                    8.0.32-1.module+el8.8.0+21055+76bd398b        @ol8_appstream
```

### 1.3 By initializing the database:

```bash
# First, to make sure the mysql-server was started:
service mysqld start

# enter into the database. First time you don't have the password, so enter nothing.
mysql -u root -p
```

```sql
-- Now it is in SQL
-- alter the password
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '<Your password>';

-- Create the Database
CREATE DATABASE PerfyMatrix;
CREATE DATABASE PerfyInfo;

-- Exit
exit
```

In the build path, run the command to initialize the Database:

```bash
mysql -u root -p PerfyInfo < ./databases/PerfyInfo.sql
mysql -u root -p PerfyMatrix < ./databases/PerfyMatrix.sql
```

### 1.4 Now, you should go the main path and run the following command to enter the venv. In the future, if you want to activate the env, just run the command:

```bash
cd ..
source setup.sh

# You will see the following output.
# Redirecting to /bin/systemctl start mysqld.service
# PERFY_HOME is set to: /root/ohd_perfy
# if you want to start your Django project use the following command: 
#       1. to quick start by running 'python manage.py runserver'
#       2. to run in the backend by running 'nohup python manage.py runserver <your-public-ip>:<port>'
# (perfy-python) [root@nsn160-62 ohd_perfy]
```

**Only** When you see **(perfy-python)** in the front of the terminal, meanning you are entering into the perfy env. And you can run the py files in the test_examples.

### 1.5 modify the **DATABASES** in the OHD_Perfy/settings.py to connect to the right database.

```python
# OHD_Perfy/settings.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': 'PerfyInfo',                  # Do not modify. This is the `PerfyInfo` Database
        'USER': 'root',                      # Usually it will use `root` to ask database, modify it if you think it is necessary
        'PASSWORD': '*****',                  # You DB Password that you set in `ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY '<Your password>'`
        'HOST': 'localhost',                   # Usually, it will be local host
        'PORT': '3306',                      
        'OPTIONS': {'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"},
    },
    'PerfyMatrix': {
        'ENGINE': 'django.db.backends.mysql', 
        'NAME': 'PerfyMatrix',                      # Do not modify. This is the `PerfyMatrix` Database
        'USER': 'root',                             # Other thing keep the same as above
        'PASSWORD': '*****',          
        'HOST': 'localhost',                     
        'PORT': '3306',                     
        'OPTIONS': {'init_command': "SET sql_mode='STRICT_TRANS_TABLES'"},
    }
}
```
#!/bin/bash -x

PERFY_HOME=$(pwd)

export PERFY_HOME

# INSTALL
yum clean all
yum install --disablerepo=* --enablerepo=ol8_appstream --skip-broken --nobest python3 python3-pip  mysql  mysql-server git

# Can not install
# yum install --disablerepo=* --enablerepo=ol8_appstream httpd httpd-devel mod_wsgi , python3-devel mysql-devel


# After install the packages , you can use 'yum list installed | grep mysql-server' to check whether mysql is installed
service mysqld start

python3 -m venv $PERFY_HOME/perfy-python
source $PERFY_HOME/perfy-python/bin/activate
pip3 install --upgrade pip
pip3 install -r requirements.txt
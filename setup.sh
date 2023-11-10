# source setup.sh

# to start MySQL server
service mysqld start

PERFY_HOME=$(pwd)

export PERFY_HOME

unset http_proxy
unset https_proxy

echo "PERFY_HOME is set to: $PERFY_HOME"
source $PERFY_HOME/perfy-python/bin/activate

echo "if you want to start your Django project use the following command: "
echo "      1. to quick start by running 'python manage.py runserver'"
echo "      2. to run in the backend by running 'nohup python manage.py runserver <your-public-ip>:<port>'"

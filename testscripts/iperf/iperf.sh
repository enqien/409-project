#!/bin/bash

#set -x
S=$1
C=$2
LOG_PATH=$3
PARALLEL=$4
LENGTH=$5
WINDOW=$6
BIDIRECTION=$7

ROUNDTIME=10 # 10s per round
PORT=5201

source $LOG_PATH/metadata.cfg

#grab the server info
function init_vars() {
  SUT=$S
  CNT=$C
  SERVER=$(eval echo "\$${SUT}")
  CLIENT=$(eval echo "\$${CNT}")
  SERVER_IB0=$(eval echo "\$${SUT}_NETDEV_IP")
  CLIENT_IB0=$(eval echo "\$${CNT}_NETDEV_IP")
}

#Kill existing iperf tests
function iperf_reset() {
  init_vars $S $C
  ssh root@${SERVER} pkill iperf
  ssh root@${SERVER} pkill iperf3
  ssh root@${CLIENT} pkill iperf
  ssh root@${CLIENT} pkill iperf3
}

#start server
function start_server() {
  init_vars $S $C
## iperf3 needs multistream for parallel flag.
#  CMD=""
#  for (( i=0; i<$PARALLEL; i++ ))
#  do
#    CMD+="iperf3 --bind $SERVER_IB0 --port $((PORT+i)) -s --one-off &"
#  done
  CMD="iperf --bind $SERVER_IB0 -s -D"
  echo ssh root@$SERVER "$CMD"
  ssh root@$SERVER "$CMD" &
}

#start client and output results
function start_client() {
  init_vars $S $C
## iperf3 needs multistream for parallel flag.
#  CMD=""
#  for (( i=0; i<$PARALLEL; i++ ))
#  do
#    CMD+="iperf3 --bind $CLIENT_IB0 -c $SERVER_IB0 --port $((PORT+i)) -l $LENGTH -w $WINDOW &"
#  done
  CMD="iperf --bind $CLIENT_IB0 -c $SERVER_IB0 -P $PARALLEL -l $LENGTH -w $WINDOW -t $ROUNDTIME"
  if [ "$BIDIRECTION" = "true" ]; then
    CMD+=" -d"
  fi
  echo ssh root@$CLIENT "$CMD"
  ssh root@$CLIENT "$CMD" > ${LOG_PATH}/run_${CLIENT}.out
}

#calculate results
function calculate_results() {
  BANDWIDTH=0
## iperf3:
#  if (($PARALLEL > 1)); then
#    BANDWIDTH=`cat ${LOG_PATH}/run_${CLIENT}.out | grep "SUM.*sender" | grep -Eo "[0-9]+[.]?[0-9]*[^0-9]+/sec" | grep -Eo "[0-9]+[.]?[0-9]*"`
#  else
#    BANDWIDTH=`cat ${LOG_PATH}/run_${CLIENT}.out | grep "sender" | grep -Eo "[0-9]+[.]?[0-9]*[^0-9]+/sec" | grep -Eo "[0-9]+[.]?[0-9]*"`
#  fi
#
## iperf3 with multi stream:
#  BANDWIDTH=`cat ${LOG_PATH}/run_${CLIENT}.out | grep "sender" | grep -Eo "[0-9]+[.]?[0-9]*[^0-9]+/sec" | awk '{count+=$1} END{print count}'`
#
## iperf2:
  if (($PARALLEL > 1)); then
    BANDWIDTH=`cat ${LOG_PATH}/run_${CLIENT}.out | grep "SUM.*" | grep -Eo "[0-9]+[.]?[0-9]*[^0-9]+/sec" | grep -Eo "[0-9]+[.]?[0-9]*"`
  else
    BANDWIDTH=`cat ${LOG_PATH}/run_${CLIENT}.out | grep ".*/sec" | grep -Eo "[0-9]+[.]?[0-9]*[^0-9]+/sec" | awk '{count+=$1} END{print count}'`
  fi
  echo ">>>>> PARALLEL:$PARALLEL LENGTH:$LENGTH WINDOW:$WINDOW BIDIRECTION:$BIDIRECTION => $BANDWIDTH"
}

iperf_reset
sleep 1
start_server
sleep 1
start_client
sleep 1
calculate_results
sleep 1
iperf_reset

echo "FINISH ONE ROUND OF IPERF!"
exit 0
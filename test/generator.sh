#!/bin/sh
# Description: Generate random logs for testing purposes
 while true; do flog -n1 >> logs/test.log; sleep 3; done
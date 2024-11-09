#!/bin/sh
# Description: Generate random logs for testing purposes
 while true; do flog -n5 >> logs/test.log; sleep 3; done
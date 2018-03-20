#!/bin/sh

DDIR=`dirname $0`/../

. $DDIR/env
docker-compose -f $DDIR/docker-compose.yml exec db mysql -u$MYSQL_USER -p$MYSQL_PASSWORD -D$MYSQL_DATABASE

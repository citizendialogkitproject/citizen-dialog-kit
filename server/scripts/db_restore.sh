#!/bin/sh

DDIR=`dirname $0`/../

[ ! -e $DDIR/db/backups/$1 ] && echo "No such file in container: /backups/$1" && exit 1

. $DDIR/env
docker-compose -f $DDIR/docker-compose.yml exec db mysql -uroot -p$MYSQL_ROOT_PASSWORD --execute="\. /backups/$1"

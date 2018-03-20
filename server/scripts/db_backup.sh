#!/bin/sh

OUT=`date --iso-8601=seconds`.sql
DDIR=`dirname $0`/../

. $DDIR/env
docker-compose -f $DDIR/docker-compose.yml  exec db mysqldump -uroot -p$MYSQL_ROOT_PASSWORD --all-databases --single-transaction --result-file=/backups/$OUT

echo `readlink -e $DDIR/db/backups/$OUT`

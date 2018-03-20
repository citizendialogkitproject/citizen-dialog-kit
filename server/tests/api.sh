#!/bin/bash

. `dirname $0`/../env

parse_something() {
	P=`echo $2 | python -c "import json; import sys; x = json.loads(sys.stdin.readline()); print x['$1'];"`
}

URL="http://admin:$API_ADMIN_PASSWORD@localhost/api"
TS=`date +%Y%m%d%H%M%S`

# create a display and an image, save their resulting handles
parse_something 'handle' `curl -s -X POST --data name=$TS'_AAA' --data description=hello --data screen_type=7.5inch $URL/image`
IMG_HANDLE=$P
parse_something 'handle' `curl -s -X POST --data serial=$TS'_AAA' --data description=hello --data screen_type=7.5inch $URL/display`
DSPL_HANDLE=$P

# update the display read back
curl -s -X PUT --data name=$TS'_UPDATED' --data description=$TS'_UPDATED' --data screen_type=4.5inch $URL/image/$IMG_HANDLE
parse_something 'name' `curl -s -X GET $URL/image/$IMG_HANDLE`
[ "x$P" != x$TS'_UPDATED' ] && echo "FAIL: updating image lost data" && exit 1
parse_something 'description' `curl -s -X GET $URL/image/$IMG_HANDLE`
[ "x$P" != x$TS'_UPDATED' ] && echo "FAIL: updating image lost data" && exit 1
parse_something 'screen_type' `curl -s -X GET $URL/image/$IMG_HANDLE`
[ "x$P" != "x4.5inch" ] && echo "FAIL: updating image lost data" && exit 1

# update the display and read back
curl -s -X PUT --data serial=$TS'_UPDATED' --data description=$TS'_UPDATED' --data screen_type=4.5inch $URL/display/$DSPL_HANDLE
parse_something 'serial' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != x$TS'_UPDATED' ] && echo "FAIL: updating display lost data" && exit 1
parse_something 'description' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != x$TS'_UPDATED' ] && echo "FAIL: updating display lost data" && exit 1
parse_something 'screen_type' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != "x4.5inch" ] && echo "FAIL: updating display lost data" && exit 1

# update the display's image and read back
curl -s -X PUT --data handle=$IMG_HANDLE $URL/display/$DSPL_HANDLE/image
parse_something 'image_handle' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != "x$IMG_HANDLE" ] && echo "FAIL: display does not have set image" && exit 1

# create and set another image, read back
parse_something 'handle' `curl -s -X POST --data name=$TS'_BBB' --data description=hello --data screen_type=4.5inch $URL/image`
IMG_NEW_HANDLE=$P
curl -s -X PUT --data handle=$IMG_NEW_HANDLE $URL/display/$DSPL_HANDLE/image
parse_something 'image_handle' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != "x$IMG_NEW_HANDLE" ] && echo "FAIL: display does not have set image" && exit 1

# create and set another image (of wrong screen_type), read back
parse_something 'handle' `curl -s -X POST --data name=$TS'_CCC' --data description=hello --data screen_type=7.5inch $URL/image`
IMG_WRONG_HANDLE=$P
curl -s -X PUT --data handle=$IMG_WRONG_HANDLE $URL/display/$DSPL_HANDLE/image
parse_something 'image_handle' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != "x$IMG_NEW_HANDLE" ] && echo "FAIL: display does not have set image" && exit 1

# set contents of new image
#TMPFILE=`mktemp`
#echo -n "HELLOTHERE" > $TMPFILE
#curl -s -F 'data=@'$TMPFILE $URL/image/$IMG_NEW_HANDLE/original

# connect as display and report a result on the old image, read back should be new image
#DISPLAY_OUTPUT=`echo $TS'_UPDATED,'$IMG_HANDLE',some_value_at_'$TS | nc -q 1 localhost 12345`
#IMG_RECEIVED_HANDLE=`echo -n $DISPLAY_OUTPUT | cut -d ',' -f 1`
#[ "x$IMG_RECEIVED_HANDLE" != "x$IMG_NEW_HANDLE" ] && echo "FAIL: display does not receive new image"

# delete everything
curl -s -X DELETE $URL/display/$DSPL_HANDLE
curl -s -X DELETE $URL/image/$IMG_HANDLE
curl -s -X DELETE $URL/image/$IMG_NEW_HANDLE

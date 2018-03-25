#!/bin/bash

. `dirname $0`/../env

parse_something() {
	local key=$1
	shift
	P=`echo $@ | python -c "import json; import sys; x = json.loads(sys.stdin.readline()); print x[0]['$key'] if type(x) is list else x['$key'];"`
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
parse_something 'error' `curl -s -X PUT --data handle=$IMG_WRONG_HANDLE $URL/display/$DSPL_HANDLE/image`
[ "x$P" != "xscreen_type mismatch" ] && echo "FAIL: setting image of wrong display type succeeded" && exit 1
parse_something 'image_handle' `curl -s -X GET $URL/display/$DSPL_HANDLE`
[ "x$P" != "x$IMG_NEW_HANDLE" ] && echo "FAIL: display does not have set image" && exit 1

# upload image data, read back and compare
TMPFILE=`mktemp`
TESTFILE_INPUT=`dirname $0`"/data/test_640x384_bw.png"
TESTFILE_OUTPUT=`dirname $0`"/data/test_640x384_bw.eink"
TESTFILE_INPUT_CHECKSUM=`md5sum $TESTFILE_INPUT | cut -d ' ' -f 1`
TESTFILE_INPUT_SIZE=`wc -c $TESTFILE_INPUT | cut -d ' ' -f 1`
TESTFILE_OUTPUT_SIZE=`wc -c $TESTFILE_OUTPUT | cut -d ' ' -f 1`
curl -s -F 'data=@'$TESTFILE_INPUT $URL/image/$IMG_NEW_HANDLE/original
parse_something 'md5' `curl -s -X GET $URL/image/$IMG_NEW_HANDLE`
[ "x$P" != "x$TESTFILE_INPUT_CHECKSUM" ] && echo "FAIL: server-computed checksum does not match local checksum" && exit 1
parse_something 'bytes_original' `curl -s -X GET $URL/image/$IMG_NEW_HANDLE`
[ "x$P" != "x$TESTFILE_INPUT_SIZE" ] && echo "FAIL: server-computed original size does not match local size" && exit 1
parse_something 'bytes_processed' `curl -s -X GET $URL/image/$IMG_NEW_HANDLE`
[ "x$P" != "x$TESTFILE_OUTPUT_SIZE" ] && echo "FAIL: server-computed processed size does not match local size" && exit 1
curl -s $URL/image/$IMG_NEW_HANDLE/processed > $TMPFILE
cmp -s $TMPFILE $TESTFILE_OUTPUT || (echo "FAIL: processed image data does not match expected" && exit 1)

# connect as display and report a result on the old image, read back should be new image
#DISPLAY_OUTPUT=`echo $TS'_UPDATED,'$IMG_HANDLE',some_value_at_'$TS | nc -q 1 localhost 12345`
#IMG_RECEIVED_HANDLE=`echo -n $DISPLAY_OUTPUT | cut -d ',' -f 1`
#[ "x$IMG_RECEIVED_HANDLE" != "x$IMG_NEW_HANDLE" ] && echo "FAIL: display does not receive new image"

# create a schedule and read back
parse_something 'handle'  `curl -s -X POST --data start=0 --data stop=1000 --data image_handle=$IMG_NEW_HANDLE --data display_handle=$DSPL_HANDLE $URL/schedule`
SCHED_HANDLE=$P
parse_something 'handle'  `curl -s -X GET $URL/display/$DSPL_HANDLE/schedule`
[ "x$P" != "x$SCHED_HANDLE" ] && echo "FAIL: display does not have set schedule" && exit 1
parse_something 'handle'  `curl -s -X GET $URL/image/$IMG_NEW_HANDLE/schedule`
[ "x$P" != "x$SCHED_HANDLE" ] && echo "FAIL: image does not have set schedule" && exit 1

# delete everything
curl -s -X DELETE $URL/display/$DSPL_HANDLE || (echo "FAIL: deleting display did not work" && exit 1)
curl -s -X DELETE $URL/image/$IMG_HANDLE || (echo "FAIL: deleting image did not work" && exit 1)
curl -s -X DELETE $URL/image/$IMG_NEW_HANDLE || (echo "FAIL: deleting image did not work" && exit 1)

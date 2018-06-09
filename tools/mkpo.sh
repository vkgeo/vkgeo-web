#!/bin/sh

PATH=/bin:/usr/bin; export PATH

cd .. && xgettext --keyword=_ --language=JavaScript --add-comments --sort-output -o translations/po/vkgeo.po index.html vkgeo.js

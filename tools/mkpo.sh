#!/bin/sh

PATH=/bin:/usr/bin; export PATH

xgettext --keyword=_ --language=JavaScript --add-comments --sort-output -o ../translations/po/vkgeo.pot ../index.html ../vkgeo.js

msginit --locale=ru --no-translator --input=../translations/po/vkgeo.pot --output=../translations/po/vkgeo_ru.po

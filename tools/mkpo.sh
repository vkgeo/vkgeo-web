#!/bin/sh

PATH=/bin:/usr/bin; export PATH

xgettext --keyword=_ --language=JavaScript --add-comments --sort-output -o ../translations/vkgeo.pot ../web/index.html ../web/vkgeo.js

msginit --locale=ru --no-translator --input=../translations/vkgeo.pot --output=../translations/vkgeo_ru.po

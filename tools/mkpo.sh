#!/bin/sh

PATH=/bin:/usr/bin; export PATH

xgettext --keyword=_ --language=JavaScript --add-comments --sort-output -o ../translations/vkgeo.pot ../web/index.html ../web/js/vkgeo.js

if [ -f ../translations/vkgeo_ru.po ]; then
    msgmerge --update --backup=off ../translations/vkgeo_ru.po ../translations/vkgeo.pot
else
    msginit --locale=ru --no-translator --input=../translations/vkgeo.pot --output=../translations/vkgeo_ru.po
fi

#!/bin/sh

export PATH=/bin:/usr/bin

xgettext --keyword=_ --language=JavaScript --add-comments --sort-output -o ../translations/vk_iframe_app.pot ../vk_iframe_app/index.html ../vk_iframe_app/js/vkgeo.js

if [ -f ../translations/vk_iframe_app_ru.po ]; then
    msgmerge --update --backup=off ../translations/vk_iframe_app_ru.po ../translations/vk_iframe_app.pot
else
    msginit --locale=ru --no-translator --input=../translations/vk_iframe_app.pot --output=../translations/vk_iframe_app_ru.po
fi

#!/bin/sh

PATH=/bin:/usr/bin:~/bin; export PATH

po2js.py ../translations/po/vkgeo_ru.po && mv ../translations/po/vkgeo_ru.js ../translations/vkgeo_ru.js

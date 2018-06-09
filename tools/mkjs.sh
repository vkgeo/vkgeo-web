#!/bin/sh

PATH=/bin:/usr/bin:~/bin; export PATH

po2js.py ../translations/vkgeo_ru.po && mv ../translations/vkgeo_ru.js ../web/translations/vkgeo_ru.js

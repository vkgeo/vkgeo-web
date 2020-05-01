#!/bin/sh

PATH=/bin:/usr/bin:~/bin; export PATH

po2js.py ../translations/vk_iframe_app_ru.po && mv ../translations/vkgeo_ru.js ../vk_iframe_app/translations/vkgeo_ru.js

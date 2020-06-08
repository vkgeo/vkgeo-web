#!/bin/sh

PATH=/bin:/usr/bin; export PATH

localeplanet/po2js.py ../translations/vk_iframe_app_ru.po && mv ../translations/vk_iframe_app_ru.js ../vk_iframe_app/translations/vkgeo_ru.js

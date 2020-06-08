#!/usr/bin/tclsh

package require json

fconfigure stdout -buffering none

set         fd [open "|curl -s -S https://www.localeplanet.com/api/codelist.json"]
fconfigure $fd -encoding utf-8 -translation auto

foreach locale [::json::json2dict [read -nonewline $fd]] {
    puts -nonewline "$locale "
    exec curl -s -S "https://www.localeplanet.com/api/$locale/icu.js" -o "../vk_iframe_app/lib/localeplanet/icu/icu.$locale.js"
}

puts ""

close $fd

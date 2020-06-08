(function() {

	var dfs = {"am_pm":["AM","PM"],"day_name":["𑄢𑄧𑄝𑄨𑄝𑄢𑄴","𑄥𑄧𑄟𑄴𑄝𑄢𑄴","𑄟𑄧𑄁𑄉𑄧𑄣𑄴𑄝𑄢𑄴","𑄝𑄪𑄖𑄴𑄝𑄢𑄴","𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴𑄝𑄢𑄴","𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴𑄝𑄢𑄴","𑄥𑄧𑄚𑄨𑄝𑄢𑄴"],"day_short":["𑄢𑄧𑄝𑄨","𑄥𑄧𑄟𑄴","𑄟𑄧𑄁𑄉𑄧𑄣𑄴","𑄝𑄪𑄖𑄴","𑄝𑄳𑄢𑄨𑄥𑄪𑄛𑄴","𑄥𑄪𑄇𑄴𑄇𑄮𑄢𑄴","𑄥𑄧𑄚𑄨"],"era":["𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄴𑄛𑄫𑄢𑄴𑄝𑄧","𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄛𑄴𑄘𑄧"],"era_name":["𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄴𑄛𑄫𑄢𑄴𑄝𑄧","𑄈𑄳𑄢𑄨𑄌𑄴𑄑𑄛𑄴𑄘𑄧"],"month_name":["𑄎𑄚𑄪𑄠𑄢𑄨","𑄜𑄬𑄛𑄴𑄝𑄳𑄢𑄪𑄠𑄢𑄨","𑄟𑄢𑄴𑄌𑄧","𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴","𑄟𑄬","𑄎𑄪𑄚𑄴","𑄎𑄪𑄣𑄭","𑄃𑄉𑄧𑄌𑄴𑄑𑄴","𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴","𑄃𑄧𑄇𑄴𑄑𑄬𑄝𑄧𑄢𑄴","𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴","𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄧𑄢𑄴"],"month_short":["𑄎𑄚𑄪","𑄜𑄬𑄛𑄴","𑄟𑄢𑄴𑄌𑄧","𑄃𑄬𑄛𑄳𑄢𑄨𑄣𑄴","𑄟𑄬","𑄎𑄪𑄚𑄴","𑄎𑄪𑄣𑄭","𑄃𑄉𑄧𑄌𑄴𑄑𑄴","𑄥𑄬𑄛𑄴𑄑𑄬𑄟𑄴𑄝𑄧𑄢𑄴","𑄃𑄧𑄇𑄴𑄑𑄮𑄝𑄧𑄢𑄴","𑄚𑄧𑄞𑄬𑄟𑄴𑄝𑄧𑄢𑄴","𑄓𑄨𑄥𑄬𑄟𑄴𑄝𑄢𑄴"],"order_full":"MDY","order_long":"MDY","order_medium":"MDY","order_short":"MDY"};
	var nfs = {"decimal_separator":".","grouping_separator":",","minus":"-"};
	var df = {SHORT_PADDED_CENTURY:function(d){if(d){return(((d.getMonth()+101)+'').substring(1)+'/'+((d.getDate()+101)+'').substring(1)+'/'+d.getFullYear());}},SHORT:function(d){if(d){return((d.getMonth()+1)+'/'+d.getDate()+'/'+(d.getFullYear()+'').substring(2));}},SHORT_NOYEAR:function(d){if(d){return((d.getMonth()+1)+'/'+d.getDate());}},SHORT_NODAY:function(d){if(d){return((d.getMonth()+1)+' '+(d.getFullYear()+'').substring(2));}},MEDIUM:function(d){if(d){return(dfs.month_short[d.getMonth()]+' '+d.getDate()+','+' '+d.getFullYear());}},MEDIUM_NOYEAR:function(d){if(d){return(dfs.month_short[d.getMonth()]+' '+d.getDate());}},MEDIUM_WEEKDAY_NOYEAR:function(d){if(d){return(dfs.day_short[d.getDay()]+' '+dfs.month_short[d.getMonth()]+' '+d.getDate());}},LONG_NODAY:function(d){if(d){return(dfs.month_name[d.getMonth()]+' '+d.getFullYear());}},LONG:function(d){if(d){return(dfs.month_name[d.getMonth()]+' '+d.getDate()+','+' '+d.getFullYear());}},FULL:function(d){if(d){return(dfs.day_name[d.getDay()]+','+' '+dfs.month_name[d.getMonth()]+' '+d.getDate()+','+' '+d.getFullYear());}}};
	
	window.icu = window.icu || new Object();
	var icu = window.icu;	
		
	icu.getCountry = function() { return "IN" };
	icu.getCountryName = function() { return "𑄞𑄢𑄧𑄖𑄴" };
	icu.getDateFormat = function(formatCode) { var retVal = {}; retVal.format = df[formatCode]; return retVal; };
	icu.getDateFormats = function() { return df; };
	icu.getDateFormatSymbols = function() { return dfs; };
	icu.getDecimalFormat = function(places) { var retVal = {}; retVal.format = function(n) { var ns = n < 0 ? Math.abs(n).toFixed(places) : n.toFixed(places); var ns2 = ns.split('.'); s = ns2[0]; var d = ns2[1]; var rgx = /(\d+)(\d{3})/;while(rgx.test(s)){s = s.replace(rgx, '$1' + nfs["grouping_separator"] + '$2');} return (n < 0 ? nfs["minus"] : "") + s + nfs["decimal_separator"] + d;}; return retVal; };
	icu.getDecimalFormatSymbols = function() { return nfs; };
	icu.getIntegerFormat = function() { var retVal = {}; retVal.format = function(i) { var s = i < 0 ? Math.abs(i).toString() : i.toString(); var rgx = /(\d+)(\d{3})/;while(rgx.test(s)){s = s.replace(rgx, '$1' + nfs["grouping_separator"] + '$2');} return i < 0 ? nfs["minus"] + s : s;}; return retVal; };
	icu.getLanguage = function() { return "ccp" };
	icu.getLanguageName = function() { return "𑄌𑄋𑄴𑄟𑄳𑄦" };
	icu.getLocale = function() { return "ccp-IN" };
	icu.getLocaleName = function() { return "𑄌𑄋𑄴𑄟𑄳𑄦 (𑄞𑄢𑄧𑄖𑄴)" };

})();
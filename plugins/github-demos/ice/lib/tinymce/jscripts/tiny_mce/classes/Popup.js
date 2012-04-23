var tinymce=null,tinyMCEPopup,tinyMCE;tinyMCEPopup={init:function(){var t=this,w,ti;w=t.getWin();tinymce=w.tinymce;tinyMCE=w.tinyMCE;t.editor=tinymce.EditorManager.activeEditor;t.params=t.editor.windowManager.params;t.features=t.editor.windowManager.features;t.dom=t.editor.windowManager.createInstance("tinymce.dom.DOMUtils",document);if(t.features.popup_css!==false){t.dom.loadCSS(t.features.popup_css||t.editor.settings.popup_css)}t.listeners=[];t.onInit={add:function(f,s){t.listeners.push({func:f,scope:s})}};t.isWindow=!t.getWindowArg("mce_inline");t.id=t.getWindowArg("mce_window_id");t.editor.windowManager.onOpen.dispatch(t.editor.windowManager,window)},getWin:function(){return(!window.frameElement&&window.dialogArguments)||opener||parent||top},getWindowArg:function(n,dv){var v=this.params[n];return tinymce.is(v)?v:dv},getParam:function(n,dv){return this.editor.getParam(n,dv)},getLang:function(n,dv){return this.editor.getLang(n,dv)},execCommand:function(cmd,ui,val,a){a=a||{};a.skip_focus=1;this.restoreSelection();return this.editor.execCommand(cmd,ui,val,a)},resizeToInnerSize:function(){var t=this;setTimeout(function(){var vp=t.dom.getViewPort(window);t.editor.windowManager.resizeBy(t.getWindowArg("mce_width")-vp.w,t.getWindowArg("mce_height")-vp.h,t.id||window)},10)},executeOnLoad:function(s){this.onInit.add(function(){eval(s)})},storeSelection:function(){this.editor.windowManager.bookmark=tinyMCEPopup.editor.selection.getBookmark(1)},restoreSelection:function(){var t=tinyMCEPopup;if(!t.isWindow&&tinymce.isIE){t.editor.selection.moveToBookmark(t.editor.windowManager.bookmark)}},requireLangPack:function(){var t=this,u=t.getWindowArg("plugin_url")||t.getWindowArg("theme_url");if(u&&t.editor.settings.language&&t.features.translate_i18n!==false&&t.editor.settings.language_load!==false){u+="/langs/"+t.editor.settings.language+"_dlg.js";if(!tinymce.ScriptLoader.isDone(u)){document.write('<script type="text/javascript" src="'+tinymce._addVer(u)+'"><\/script>');tinymce.ScriptLoader.markDone(u)}}},pickColor:function(e,element_id){this.execCommand("mceColorPicker",true,{color:document.getElementById(element_id).value,func:function(c){document.getElementById(element_id).value=c;try{document.getElementById(element_id).onchange()}catch(ex){}}})},openBrowser:function(element_id,type,option){tinyMCEPopup.restoreSelection();this.editor.execCallback("file_browser_callback",element_id,document.getElementById(element_id).value,type,window)},confirm:function(t,cb,s){this.editor.windowManager.confirm(t,cb,s,window)},alert:function(tx,cb,s){this.editor.windowManager.alert(tx,cb,s,window)},close:function(){var t=this;function close(){t.editor.windowManager.close(window);tinymce=tinyMCE=t.editor=t.params=t.dom=t.dom.doc=null}if(tinymce.isOpera){t.getWin().setTimeout(close,0)}else{close()}},_restoreSelection:function(){var e=window.event.srcElement;if(e.nodeName=="INPUT"&&(e.type=="submit"||e.type=="button")){tinyMCEPopup.restoreSelection()}},_onDOMLoaded:function(){var t=tinyMCEPopup,ti=document.title,bm,h,nv;if(t.domLoaded){return}t.domLoaded=1;if(t.features.translate_i18n!==false){h=document.body.innerHTML;if(tinymce.isIE){h=h.replace(/ (value|title|alt)=([^"][^\s>]+)/gi,' $1="$2"')}document.dir=t.editor.getParam("directionality","");if((nv=t.editor.translate(h))&&nv!=h){document.body.innerHTML=nv}if((nv=t.editor.translate(ti))&&nv!=ti){document.title=ti=nv}}if(!t.editor.getParam("browser_preferred_colors",false)||!t.isWindow){t.dom.addClass(document.body,"forceColors")}document.body.style.display="";if(tinymce.isIE){document.attachEvent("onmouseup",tinyMCEPopup._restoreSelection);t.dom.add(t.dom.select("head")[0],"base",{target:"_self"})}t.restoreSelection();t.resizeToInnerSize();if(!t.isWindow){t.editor.windowManager.setTitle(window,ti)}else{window.focus()}if(!tinymce.isIE&&!t.isWindow){tinymce.dom.Event._add(document,"focus",function(){t.editor.windowManager.focus(t.id)})}tinymce.each(t.dom.select("select"),function(e){e.onkeydown=tinyMCEPopup._accessHandler});tinymce.each(t.listeners,function(o){o.func.call(o.scope,t.editor)});if(t.getWindowArg("mce_auto_focus",true)){window.focus();tinymce.each(document.forms,function(f){tinymce.each(f.elements,function(e){if(t.dom.hasClass(e,"mceFocus")&&!e.disabled){e.focus();return false}})})}document.onkeyup=tinyMCEPopup._closeWinKeyHandler},_accessHandler:function(e){e=e||window.event;if(e.keyCode==13||e.keyCode==32){e=e.target||e.srcElement;if(e.onchange){e.onchange()}return tinymce.dom.Event.cancel(e)}},_closeWinKeyHandler:function(e){e=e||window.event;if(e.keyCode==27){tinyMCEPopup.close()}},_wait:function(){if(document.attachEvent){document.attachEvent("onreadystatechange",function(){if(document.readyState==="complete"){document.detachEvent("onreadystatechange",arguments.callee);tinyMCEPopup._onDOMLoaded()}});if(document.documentElement.doScroll&&window==window.top){(function(){if(tinyMCEPopup.domLoaded){return}try{document.documentElement.doScroll("left")}catch(ex){setTimeout(arguments.callee,0);return}tinyMCEPopup._onDOMLoaded()})()}document.attachEvent("onload",tinyMCEPopup._onDOMLoaded)}else{if(document.addEventListener){window.addEventListener("DOMContentLoaded",tinyMCEPopup._onDOMLoaded,false);window.addEventListener("load",tinyMCEPopup._onDOMLoaded,false)}}}};tinyMCEPopup.init();tinyMCEPopup._wait();
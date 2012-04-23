(function(tinymce){var each=tinymce.each,extend=tinymce.extend,DOM=tinymce.DOM,Event=tinymce.dom.Event,ThemeManager=tinymce.ThemeManager,PluginManager=tinymce.PluginManager,explode=tinymce.explode,Dispatcher=tinymce.util.Dispatcher,undefined,instanceCounter=0;tinymce.documentBaseURL=window.location.href.replace(/[\?#].*$/,"").replace(/[\/\\][^\/]+$/,"");if(!/[\/\\]$/.test(tinymce.documentBaseURL)){tinymce.documentBaseURL+="/"}tinymce.baseURL=new tinymce.util.URI(tinymce.documentBaseURL).toAbsolute(tinymce.baseURL);tinymce.baseURI=new tinymce.util.URI(tinymce.baseURL);tinymce.onBeforeUnload=new Dispatcher(tinymce);Event.add(window,"beforeunload",function(e){tinymce.onBeforeUnload.dispatch(tinymce,e)});tinymce.onAddEditor=new Dispatcher(tinymce);tinymce.onRemoveEditor=new Dispatcher(tinymce);tinymce.EditorManager=extend(tinymce,{editors:[],i18n:{},activeEditor:null,init:function(s){var t=this,pl,sl=tinymce.ScriptLoader,e,el=[],ed;function execCallback(se,n,s){var f=se[n];if(!f){return}if(tinymce.is(f,"string")){s=f.replace(/\.\w+$/,"");s=s?tinymce.resolve(s):0;f=tinymce.resolve(f)}return f.apply(s||this,Array.prototype.slice.call(arguments,2))}s=extend({theme:"simple",language:"en"},s);t.settings=s;Event.add(document,"init",function(){var l,co;execCallback(s,"onpageload");switch(s.mode){case"exact":l=s.elements||"";if(l.length>0){each(explode(l),function(v){if(DOM.get(v)){ed=new tinymce.Editor(v,s);el.push(ed);ed.render(1)}else{each(document.forms,function(f){each(f.elements,function(e){if(e.name===v){v="mce_editor_"+instanceCounter++;DOM.setAttrib(e,"id",v);ed=new tinymce.Editor(v,s);el.push(ed);ed.render(1)}})})}})}break;case"textareas":case"specific_textareas":function hasClass(n,c){return c.constructor===RegExp?c.test(n.className):DOM.hasClass(n,c)}each(DOM.select("textarea"),function(v){if(s.editor_deselector&&hasClass(v,s.editor_deselector)){return}if(!s.editor_selector||hasClass(v,s.editor_selector)){e=DOM.get(v.name);if(!v.id&&!e){v.id=v.name}if(!v.id||t.get(v.id)){v.id=DOM.uniqueId()}ed=new tinymce.Editor(v.id,s);el.push(ed);ed.render(1)}});break}if(s.oninit){l=co=0;each(el,function(ed){co++;if(!ed.initialized){ed.onInit.add(function(){l++;if(l==co){execCallback(s,"oninit")}})}else{l++}if(l==co){execCallback(s,"oninit")}})}})},get:function(id){if(id===undefined){return this.editors}return this.editors[id]},getInstanceById:function(id){return this.get(id)},add:function(editor){var self=this,editors=self.editors;editors[editor.id]=editor;editors.push(editor);self._setActive(editor);self.onAddEditor.dispatch(self,editor);if(tinymce.adapter){tinymce.adapter.patchEditor(editor)}return editor},remove:function(editor){var t=this,i,editors=t.editors;if(!editors[editor.id]){return null}delete editors[editor.id];for(i=0;i<editors.length;i++){if(editors[i]==editor){editors.splice(i,1);break}}if(t.activeEditor==editor){t._setActive(editors[0])}editor.destroy();t.onRemoveEditor.dispatch(t,editor);return editor},execCommand:function(c,u,v){var t=this,ed=t.get(v),w;switch(c){case"mceFocus":ed.focus();return true;case"mceAddEditor":case"mceAddControl":if(!t.get(v)){new tinymce.Editor(v,t.settings).render()}return true;case"mceAddFrameControl":w=v.window;w.tinyMCE=tinyMCE;w.tinymce=tinymce;tinymce.DOM.doc=w.document;tinymce.DOM.win=w;ed=new tinymce.Editor(v.element_id,v);ed.render();if(tinymce.isIE){function clr(){ed.destroy();w.detachEvent("onunload",clr);w=w.tinyMCE=w.tinymce=null}w.attachEvent("onunload",clr)}v.page_window=null;return true;case"mceRemoveEditor":case"mceRemoveControl":if(ed){ed.remove()}return true;case"mceToggleEditor":if(!ed){t.execCommand("mceAddControl",0,v);return true}if(ed.isHidden()){ed.show()}else{ed.hide()}return true}if(t.activeEditor){return t.activeEditor.execCommand(c,u,v)}return false},execInstanceCommand:function(id,c,u,v){var ed=this.get(id);if(ed){return ed.execCommand(c,u,v)}return false},triggerSave:function(){each(this.editors,function(e){e.save()})},addI18n:function(p,o){var lo,i18n=this.i18n;if(!tinymce.is(p,"string")){each(p,function(o,lc){each(o,function(o,g){each(o,function(o,k){if(g==="common"){i18n[lc+"."+k]=o}else{i18n[lc+"."+g+"."+k]=o}})})})}else{each(o,function(o,k){i18n[p+"."+k]=o})}},_setActive:function(editor){this.selectedInstance=this.activeEditor=editor}})})(tinymce);
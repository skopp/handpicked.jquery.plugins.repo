(function(tinymce){var is=tinymce.is,DOM=tinymce.DOM,each=tinymce.each,walk=tinymce.walk;tinymce.create("tinymce.ui.MenuItem:tinymce.ui.Control",{MenuItem:function(id,s){this.parent(id,s);this.classPrefix="mceMenuItem"},setSelected:function(s){this.setState("Selected",s);this.setAriaProperty("checked",!!s);this.selected=s},isSelected:function(){return this.selected},postRender:function(){var t=this;t.parent();if(is(t.selected)){t.setSelected(t.selected)}}})})(tinymce);
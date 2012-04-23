(function(tinymce){tinymce.Formatter=function(ed){var formats={},each=tinymce.each,dom=ed.dom,selection=ed.selection,TreeWalker=tinymce.dom.TreeWalker,rangeUtils=new tinymce.dom.RangeUtils(dom),isValid=ed.schema.isValidChild,isBlock=dom.isBlock,forcedRootBlock=ed.settings.forced_root_block,nodeIndex=dom.nodeIndex,INVISIBLE_CHAR="\uFEFF",MCE_ATTR_RE=/^(src|href|style)$/,FALSE=false,TRUE=true,undefined,pendingFormats={apply:[],remove:[]};function isArray(obj){return obj instanceof Array}function getParents(node,selector){return dom.getParents(node,selector,dom.getRoot())}function isCaretNode(node){return node.nodeType===1&&(node.face==="mceinline"||node.style.fontFamily==="mceinline")}function get(name){return name?formats[name]:formats}function register(name,format){if(name){if(typeof(name)!=="string"){each(name,function(format,name){register(name,format)})}else{format=format.length?format:[format];each(format,function(format){if(format.deep===undefined){format.deep=!format.selector}if(format.split===undefined){format.split=!format.selector||format.inline}if(format.remove===undefined&&format.selector&&!format.inline){format.remove="none"}if(format.selector&&format.inline){format.mixed=true;format.block_expand=true}if(typeof(format.classes)==="string"){format.classes=format.classes.split(/\s+/)}});formats[name]=format}}}var getTextDecoration=function(node){var decoration;ed.dom.getParent(node,function(n){decoration=ed.dom.getStyle(n,"text-decoration");return decoration&&decoration!=="none"});return decoration};var processUnderlineAndColor=function(node){var textDecoration;if(node.nodeType===1&&node.parentNode&&node.parentNode.nodeType===1){textDecoration=getTextDecoration(node.parentNode);if(ed.dom.getStyle(node,"color")&&textDecoration){ed.dom.setStyle(node,"text-decoration",textDecoration)}else{if(ed.dom.getStyle(node,"textdecoration")===textDecoration){ed.dom.setStyle(node,"text-decoration",null)}}}};function apply(name,vars,node){var formatList=get(name),format=formatList[0],bookmark,rng,i,isCollapsed=selection.isCollapsed();function moveStart(rng){var container=rng.startContainer,offset=rng.startOffset,walker,node;if(container.nodeType==1||container.nodeValue===""){container=container.nodeType==1?container.childNodes[offset]:container;if(container){walker=new TreeWalker(container,container.parentNode);for(node=walker.current();node;node=walker.next()){if(node.nodeType==3&&!isWhiteSpaceNode(node)){rng.setStart(node,0);break}}}}return rng}function setElementFormat(elm,fmt){fmt=fmt||format;if(elm){each(fmt.styles,function(value,name){dom.setStyle(elm,name,replaceVars(value,vars))});each(fmt.attributes,function(value,name){dom.setAttrib(elm,name,replaceVars(value,vars))});each(fmt.classes,function(value){value=replaceVars(value,vars);if(!dom.hasClass(elm,value)){dom.addClass(elm,value)}})}}function applyRngStyle(rng){var newWrappers=[],wrapName,wrapElm;wrapName=format.inline||format.block;wrapElm=dom.create(wrapName);setElementFormat(wrapElm);rangeUtils.walk(rng,function(nodes){var currentWrapElm;function process(node){var nodeName=node.nodeName.toLowerCase(),parentName=node.parentNode.nodeName.toLowerCase(),found;if(isEq(nodeName,"br")){currentWrapElm=0;if(format.block){dom.remove(node)}return}if(format.wrapper&&matchNode(node,name,vars)){currentWrapElm=0;return}if(format.block&&!format.wrapper&&isTextBlock(nodeName)){node=dom.rename(node,wrapName);setElementFormat(node);newWrappers.push(node);currentWrapElm=0;return}if(format.selector){each(formatList,function(format){if("collapsed" in format&&format.collapsed!==isCollapsed){return}if(dom.is(node,format.selector)&&!isCaretNode(node)){setElementFormat(node,format);found=true}});if(!format.inline||found){currentWrapElm=0;return}}if(isValid(wrapName,nodeName)&&isValid(parentName,wrapName)&&!(node.nodeType===3&&node.nodeValue.length===1&&node.nodeValue.charCodeAt(0)===65279)){if(!currentWrapElm){currentWrapElm=wrapElm.cloneNode(FALSE);node.parentNode.insertBefore(currentWrapElm,node);newWrappers.push(currentWrapElm)}currentWrapElm.appendChild(node)}else{if(nodeName=="li"){liTextNode=node.ownerDocument.createTextNode("");each(tinymce.grep(node.childNodes),function(n){if(n.nodeType==3){liTextNode.nodeValue+=n.nodeValue;n.parentNode.removeChild(n)}});currentWrapElm=wrapElm.cloneNode(FALSE);node.insertBefore(currentWrapElm,node.firstChild);newWrappers.push(currentWrapElm);currentWrapElm.appendChild(liTextNode)}else{currentWrapElm=0;each(tinymce.grep(node.childNodes),process);currentWrapElm=0}}}each(nodes,process)});if(format.wrap_links===false){each(newWrappers,function(node){function process(node){var i,currentWrapElm,children;if(node.nodeName==="A"){currentWrapElm=wrapElm.cloneNode(FALSE);newWrappers.push(currentWrapElm);children=tinymce.grep(node.childNodes);for(i=0;i<children.length;i++){currentWrapElm.appendChild(children[i])}node.appendChild(currentWrapElm)}each(tinymce.grep(node.childNodes),process)}process(node)})}each(newWrappers,function(node){var childCount;function getChildCount(node){var count=0;each(node.childNodes,function(node){if(!isWhiteSpaceNode(node)&&!isBookmarkNode(node)){count++}});return count}function mergeStyles(node){var child,clone;each(node.childNodes,function(node){if(node.nodeType==1&&!isBookmarkNode(node)&&!isCaretNode(node)){child=node;return FALSE}});if(child&&matchName(child,format)){clone=child.cloneNode(FALSE);setElementFormat(clone);dom.replace(clone,node,TRUE);dom.remove(child,1)}return clone||node}childCount=getChildCount(node);if((newWrappers.length>1||!isBlock(node))&&childCount===0){dom.remove(node,1);return}if(format.inline||format.wrapper){if(!format.exact&&childCount===1){node=mergeStyles(node)}each(formatList,function(format){each(dom.select(format.inline,node),function(child){var parent;if(format.wrap_links===false){parent=child.parentNode;do{if(parent.nodeName==="A"){return}}while(parent=parent.parentNode)}removeFormat(format,vars,child,format.exact?child:null)})});if(matchNode(node.parentNode,name,vars)){dom.remove(node,1);node=0;return TRUE}if(format.merge_with_parents){dom.getParent(node.parentNode,function(parent){if(matchNode(parent,name,vars)){dom.remove(node,1);node=0;return TRUE}})}if(node){node=mergeSiblings(getNonWhiteSpaceSibling(node),node);node=mergeSiblings(node,getNonWhiteSpaceSibling(node,TRUE))}}})}if(format){if(node){rng=dom.createRng();rng.setStartBefore(node);rng.setEndAfter(node);applyRngStyle(expandRng(rng,formatList))}else{if(!isCollapsed||!format.inline||dom.select("td.mceSelected,th.mceSelected").length){var curSelNode=ed.selection.getNode();bookmark=selection.getBookmark();applyRngStyle(expandRng(selection.getRng(TRUE),formatList));if(format.styles&&(format.styles.color||format.styles.textDecoration)){tinymce.walk(curSelNode,processUnderlineAndColor,"childNodes");processUnderlineAndColor(curSelNode)}selection.moveToBookmark(bookmark);selection.setRng(moveStart(selection.getRng(TRUE)));ed.nodeChanged()}else{performCaretAction("apply",name,vars)}}}}function remove(name,vars,node){var formatList=get(name),format=formatList[0],bookmark,i,rng;function moveStart(rng){var container=rng.startContainer,offset=rng.startOffset,walker,node,nodes,tmpNode;if(container.nodeType==3&&offset>=container.nodeValue.length-1){container=container.parentNode;offset=nodeIndex(container)+1}if(container.nodeType==1){nodes=container.childNodes;container=nodes[Math.min(offset,nodes.length-1)];walker=new TreeWalker(container);if(offset>nodes.length-1){walker.next()}for(node=walker.current();node;node=walker.next()){if(node.nodeType==3&&!isWhiteSpaceNode(node)){tmpNode=dom.create("a",null,INVISIBLE_CHAR);node.parentNode.insertBefore(tmpNode,node);rng.setStart(node,0);selection.setRng(rng);dom.remove(tmpNode);return}}}}function process(node){var children,i,l;children=tinymce.grep(node.childNodes);for(i=0,l=formatList.length;i<l;i++){if(removeFormat(formatList[i],vars,node,node)){break}}if(format.deep){for(i=0,l=children.length;i<l;i++){process(children[i])}}}function findFormatRoot(container){var formatRoot;each(getParents(container.parentNode).reverse(),function(parent){var format;if(!formatRoot&&parent.id!="_start"&&parent.id!="_end"){format=matchNode(parent,name,vars);if(format&&format.split!==false){formatRoot=parent}}});return formatRoot}function wrapAndSplit(format_root,container,target,split){var parent,clone,lastClone,firstClone,i,formatRootParent;if(format_root){formatRootParent=format_root.parentNode;for(parent=container.parentNode;parent&&parent!=formatRootParent;parent=parent.parentNode){clone=parent.cloneNode(FALSE);for(i=0;i<formatList.length;i++){if(removeFormat(formatList[i],vars,clone,clone)){clone=0;break}}if(clone){if(lastClone){clone.appendChild(lastClone)}if(!firstClone){firstClone=clone}lastClone=clone}}if(split&&(!format.mixed||!isBlock(format_root))){container=dom.split(format_root,container)}if(lastClone){target.parentNode.insertBefore(lastClone,target);firstClone.appendChild(target)}}return container}function splitToFormatRoot(container){return wrapAndSplit(findFormatRoot(container),container,container,true)}function unwrap(start){var node=dom.get(start?"_start":"_end"),out=node[start?"firstChild":"lastChild"];if(isBookmarkNode(out)){out=out[start?"firstChild":"lastChild"]}dom.remove(node,true);return out}function removeRngStyle(rng){var startContainer,endContainer;rng=expandRng(rng,formatList,TRUE);if(format.split){startContainer=getContainer(rng,TRUE);endContainer=getContainer(rng);if(startContainer!=endContainer){startContainer=wrap(startContainer,"span",{id:"_start","data-mce-type":"bookmark"});endContainer=wrap(endContainer,"span",{id:"_end","data-mce-type":"bookmark"});splitToFormatRoot(startContainer);splitToFormatRoot(endContainer);startContainer=unwrap(TRUE);endContainer=unwrap()}else{startContainer=endContainer=splitToFormatRoot(startContainer)}rng.startContainer=startContainer.parentNode;rng.startOffset=nodeIndex(startContainer);rng.endContainer=endContainer.parentNode;rng.endOffset=nodeIndex(endContainer)+1}rangeUtils.walk(rng,function(nodes){each(nodes,function(node){process(node);if(node.nodeType===1&&ed.dom.getStyle(node,"text-decoration")==="underline"&&node.parentNode&&getTextDecoration(node.parentNode)==="underline"){removeFormat({deep:false,exact:true,inline:"span",styles:{textDecoration:"underline"}},null,node)}})})}if(node){rng=dom.createRng();rng.setStartBefore(node);rng.setEndAfter(node);removeRngStyle(rng);return}if(!selection.isCollapsed()||!format.inline||dom.select("td.mceSelected,th.mceSelected").length){bookmark=selection.getBookmark();removeRngStyle(selection.getRng(TRUE));selection.moveToBookmark(bookmark);if(match(name,vars,selection.getStart())){moveStart(selection.getRng(true))}ed.nodeChanged()}else{performCaretAction("remove",name,vars)}}function toggle(name,vars,node){var fmt=get(name);if(match(name,vars,node)&&(!("toggle" in fmt[0])||fmt[0]["toggle"])){remove(name,vars,node)}else{apply(name,vars,node)}}function matchNode(node,name,vars,similar){var formatList=get(name),format,i,classes;function matchItems(node,format,item_name){var key,value,items=format[item_name],i;if(items){if(items.length===undefined){for(key in items){if(items.hasOwnProperty(key)){if(item_name==="attributes"){value=dom.getAttrib(node,key)}else{value=getStyle(node,key)}if(similar&&!value&&!format.exact){return}if((!similar||format.exact)&&!isEq(value,replaceVars(items[key],vars))){return}}}}else{for(i=0;i<items.length;i++){if(item_name==="attributes"?dom.getAttrib(node,items[i]):getStyle(node,items[i])){return format}}}}return format}if(formatList&&node){for(i=0;i<formatList.length;i++){format=formatList[i];if(matchName(node,format)&&matchItems(node,format,"attributes")&&matchItems(node,format,"styles")){if(classes=format.classes){for(i=0;i<classes.length;i++){if(!dom.hasClass(node,classes[i])){return}}}return format}}}}function match(name,vars,node){var startNode,i;function matchParents(node){node=dom.getParent(node,function(node){return !!matchNode(node,name,vars,true)});return matchNode(node,name,vars)}if(node){return matchParents(node)}if(selection.isCollapsed()){for(i=pendingFormats.apply.length-1;i>=0;i--){if(pendingFormats.apply[i].name==name){return true}}for(i=pendingFormats.remove.length-1;i>=0;i--){if(pendingFormats.remove[i].name==name){return false}}return matchParents(selection.getNode())}node=selection.getNode();if(matchParents(node)){return TRUE}startNode=selection.getStart();if(startNode!=node){if(matchParents(startNode)){return TRUE}}return FALSE}function matchAll(names,vars){var startElement,matchedFormatNames=[],checkedMap={},i,ni,name;if(selection.isCollapsed()){for(ni=0;ni<names.length;ni++){for(i=pendingFormats.remove.length-1;i>=0;i--){name=names[ni];if(pendingFormats.remove[i].name==name){checkedMap[name]=true;break}}}for(i=pendingFormats.apply.length-1;i>=0;i--){for(ni=0;ni<names.length;ni++){name=names[ni];if(!checkedMap[name]&&pendingFormats.apply[i].name==name){checkedMap[name]=true;matchedFormatNames.push(name)}}}}startElement=selection.getStart();dom.getParent(startElement,function(node){var i,name;for(i=0;i<names.length;i++){name=names[i];if(!checkedMap[name]&&matchNode(node,name,vars)){checkedMap[name]=true;matchedFormatNames.push(name)}}});return matchedFormatNames}function canApply(name){var formatList=get(name),startNode,parents,i,x,selector;if(formatList){startNode=selection.getStart();parents=getParents(startNode);for(x=formatList.length-1;x>=0;x--){selector=formatList[x].selector;if(!selector){return TRUE}for(i=parents.length-1;i>=0;i--){if(dom.is(parents[i],selector)){return TRUE}}}}return FALSE}tinymce.extend(this,{get:get,register:register,apply:apply,remove:remove,toggle:toggle,match:match,matchAll:matchAll,matchNode:matchNode,canApply:canApply});function matchName(node,format){if(isEq(node,format.inline)){return TRUE}if(isEq(node,format.block)){return TRUE}if(format.selector){return dom.is(node,format.selector)}}function isEq(str1,str2){str1=str1||"";str2=str2||"";str1=""+(str1.nodeName||str1);str2=""+(str2.nodeName||str2);return str1.toLowerCase()==str2.toLowerCase()}function getStyle(node,name){var styleVal=dom.getStyle(node,name);if(name=="color"||name=="backgroundColor"){styleVal=dom.toHex(styleVal)}if(name=="fontWeight"&&styleVal==700){styleVal="bold"}return""+styleVal}function replaceVars(value,vars){if(typeof(value)!="string"){value=value(vars)}else{if(vars){value=value.replace(/%(\w+)/g,function(str,name){return vars[name]||str})}}return value}function isWhiteSpaceNode(node){return node&&node.nodeType===3&&/^([\s\r\n]+|)$/.test(node.nodeValue)}function wrap(node,name,attrs){var wrapper=dom.create(name,attrs);node.parentNode.insertBefore(wrapper,node);wrapper.appendChild(node);return wrapper}function expandRng(rng,format,remove){var startContainer=rng.startContainer,startOffset=rng.startOffset,endContainer=rng.endContainer,endOffset=rng.endOffset,sibling,lastIdx,leaf;function findParentContainer(container,child_name,sibling_name,root){var parent,child;root=root||dom.getRoot();for(;;){parent=container.parentNode;if(parent==root||(!format[0].block_expand&&isBlock(parent))){return container}for(sibling=parent[child_name];sibling&&sibling!=container;sibling=sibling[sibling_name]){if(sibling.nodeType==1&&!isBookmarkNode(sibling)){return container}if(sibling.nodeType==3&&!isWhiteSpaceNode(sibling)){return container}}container=container.parentNode}return container}function findLeaf(node,offset){if(offset===undefined){offset=node.nodeType===3?node.length:node.childNodes.length}while(node&&node.hasChildNodes()){node=node.childNodes[offset];if(node){offset=node.nodeType===3?node.length:node.childNodes.length}}return{node:node,offset:offset}}if(startContainer.nodeType==1&&startContainer.hasChildNodes()){lastIdx=startContainer.childNodes.length-1;startContainer=startContainer.childNodes[startOffset>lastIdx?lastIdx:startOffset];if(startContainer.nodeType==3){startOffset=0}}if(endContainer.nodeType==1&&endContainer.hasChildNodes()){lastIdx=endContainer.childNodes.length-1;endContainer=endContainer.childNodes[endOffset>lastIdx?lastIdx:endOffset-1];if(endContainer.nodeType==3){endOffset=endContainer.nodeValue.length}}if(isBookmarkNode(startContainer.parentNode)){startContainer=startContainer.parentNode}if(isBookmarkNode(startContainer)){startContainer=startContainer.nextSibling||startContainer}if(isBookmarkNode(endContainer.parentNode)){endOffset=dom.nodeIndex(endContainer);endContainer=endContainer.parentNode}if(isBookmarkNode(endContainer)&&endContainer.previousSibling){endContainer=endContainer.previousSibling;endOffset=endContainer.length}if(format[0].inline){leaf=findLeaf(endContainer,endOffset);if(leaf.node){while(leaf.node&&leaf.offset===0&&leaf.node.previousSibling){leaf=findLeaf(leaf.node.previousSibling)}if(leaf.node&&leaf.offset>0&&leaf.node.nodeType===3&&leaf.node.nodeValue.charAt(leaf.offset-1)===" "){if(leaf.offset>1){endContainer=leaf.node;endContainer.splitText(leaf.offset-1)}else{if(leaf.node.previousSibling){endContainer=leaf.node.previousSibling}}}}}if(format[0].inline||format[0].block_expand){startContainer=findParentContainer(startContainer,"firstChild","nextSibling");endContainer=findParentContainer(endContainer,"lastChild","previousSibling")}if(format[0].selector&&format[0].expand!==FALSE&&!format[0].inline){function findSelectorEndPoint(container,sibling_name){var parents,i,y,curFormat;if(container.nodeType==3&&container.nodeValue.length==0&&container[sibling_name]){container=container[sibling_name]}parents=getParents(container);for(i=0;i<parents.length;i++){for(y=0;y<format.length;y++){curFormat=format[y];if("collapsed" in curFormat&&curFormat.collapsed!==rng.collapsed){continue}if(dom.is(parents[i],curFormat.selector)){return parents[i]}}}return container}startContainer=findSelectorEndPoint(startContainer,"previousSibling");endContainer=findSelectorEndPoint(endContainer,"nextSibling")}if(format[0].block||format[0].selector){function findBlockEndPoint(container,sibling_name,sibling_name2){var node;if(!format[0].wrapper){node=dom.getParent(container,format[0].block)}if(!node){node=dom.getParent(container.nodeType==3?container.parentNode:container,isBlock)}if(node&&format[0].wrapper){node=getParents(node,"ul,ol").reverse()[0]||node}if(!node){node=container;while(node[sibling_name]&&!isBlock(node[sibling_name])){node=node[sibling_name];if(isEq(node,"br")){break}}}return node||container}startContainer=findBlockEndPoint(startContainer,"previousSibling");endContainer=findBlockEndPoint(endContainer,"nextSibling");if(format[0].block){if(!isBlock(startContainer)){startContainer=findParentContainer(startContainer,"firstChild","nextSibling")}if(!isBlock(endContainer)){endContainer=findParentContainer(endContainer,"lastChild","previousSibling")}}}if(startContainer.nodeType==1){startOffset=nodeIndex(startContainer);startContainer=startContainer.parentNode}if(endContainer.nodeType==1){endOffset=nodeIndex(endContainer)+1;endContainer=endContainer.parentNode}return{startContainer:startContainer,startOffset:startOffset,endContainer:endContainer,endOffset:endOffset}}function removeFormat(format,vars,node,compare_node){var i,attrs,stylesModified;if(!matchName(node,format)){return FALSE}if(format.remove!="all"){each(format.styles,function(value,name){value=replaceVars(value,vars);if(typeof(name)==="number"){name=value;compare_node=0}if(!compare_node||isEq(getStyle(compare_node,name),value)){dom.setStyle(node,name,"")}stylesModified=1});if(stylesModified&&dom.getAttrib(node,"style")==""){node.removeAttribute("style");node.removeAttribute("data-mce-style")}each(format.attributes,function(value,name){var valueOut;value=replaceVars(value,vars);if(typeof(name)==="number"){name=value;compare_node=0}if(!compare_node||isEq(dom.getAttrib(compare_node,name),value)){if(name=="class"){value=dom.getAttrib(node,name);if(value){valueOut="";each(value.split(/\s+/),function(cls){if(/mce\w+/.test(cls)){valueOut+=(valueOut?" ":"")+cls}});if(valueOut){dom.setAttrib(node,name,valueOut);return}}}if(name=="class"){node.removeAttribute("className")}if(MCE_ATTR_RE.test(name)){node.removeAttribute("data-mce-"+name)}node.removeAttribute(name)}});each(format.classes,function(value){value=replaceVars(value,vars);if(!compare_node||dom.hasClass(compare_node,value)){dom.removeClass(node,value)}});attrs=dom.getAttribs(node);for(i=0;i<attrs.length;i++){if(attrs[i].nodeName.indexOf("_")!==0){return FALSE}}}if(format.remove!="none"){removeNode(node,format);return TRUE}}function removeNode(node,format){var parentNode=node.parentNode,rootBlockElm;if(format.block){if(!forcedRootBlock){function find(node,next,inc){node=getNonWhiteSpaceSibling(node,next,inc);return !node||(node.nodeName=="BR"||isBlock(node))}if(isBlock(node)&&!isBlock(parentNode)){if(!find(node,FALSE)&&!find(node.firstChild,TRUE,1)){node.insertBefore(dom.create("br"),node.firstChild)}if(!find(node,TRUE)&&!find(node.lastChild,FALSE,1)){node.appendChild(dom.create("br"))}}}else{if(parentNode==dom.getRoot()){if(!format.list_block||!isEq(node,format.list_block)){each(tinymce.grep(node.childNodes),function(node){if(isValid(forcedRootBlock,node.nodeName.toLowerCase())){if(!rootBlockElm){rootBlockElm=wrap(node,forcedRootBlock)}else{rootBlockElm.appendChild(node)}}else{rootBlockElm=0}})}}}}if(format.selector&&format.inline&&!isEq(format.inline,node)){return}dom.remove(node,1)}function getNonWhiteSpaceSibling(node,next,inc){if(node){next=next?"nextSibling":"previousSibling";for(node=inc?node:node[next];node;node=node[next]){if(node.nodeType==1||!isWhiteSpaceNode(node)){return node}}}}function isBookmarkNode(node){return node&&node.nodeType==1&&node.getAttribute("data-mce-type")=="bookmark"}function mergeSiblings(prev,next){var marker,sibling,tmpSibling;function compareElements(node1,node2){if(node1.nodeName!=node2.nodeName){return FALSE}function getAttribs(node){var attribs={};each(dom.getAttribs(node),function(attr){var name=attr.nodeName.toLowerCase();if(name.indexOf("_")!==0&&name!=="style"){attribs[name]=dom.getAttrib(node,name)}});return attribs}function compareObjects(obj1,obj2){var value,name;for(name in obj1){if(obj1.hasOwnProperty(name)){value=obj2[name];if(value===undefined){return FALSE}if(obj1[name]!=value){return FALSE}delete obj2[name]}}for(name in obj2){if(obj2.hasOwnProperty(name)){return FALSE}}return TRUE}if(!compareObjects(getAttribs(node1),getAttribs(node2))){return FALSE}if(!compareObjects(dom.parseStyle(dom.getAttrib(node1,"style")),dom.parseStyle(dom.getAttrib(node2,"style")))){return FALSE}return TRUE}if(prev&&next){function findElementSibling(node,sibling_name){for(sibling=node;sibling;sibling=sibling[sibling_name]){if(sibling.nodeType==3&&sibling.nodeValue.length!==0){return node}if(sibling.nodeType==1&&!isBookmarkNode(sibling)){return sibling}}return node}prev=findElementSibling(prev,"previousSibling");next=findElementSibling(next,"nextSibling");if(compareElements(prev,next)){for(sibling=prev.nextSibling;sibling&&sibling!=next;){tmpSibling=sibling;sibling=sibling.nextSibling;prev.appendChild(tmpSibling)}dom.remove(next);each(tinymce.grep(next.childNodes),function(node){prev.appendChild(node)});return prev}}return next}function isTextBlock(name){return/^(h[1-6]|p|div|pre|address|dl|dt|dd)$/.test(name)}function getContainer(rng,start){var container,offset,lastIdx;container=rng[start?"startContainer":"endContainer"];offset=rng[start?"startOffset":"endOffset"];if(container.nodeType==1){lastIdx=container.childNodes.length-1;if(!start&&offset){offset--}container=container.childNodes[offset>lastIdx?lastIdx:offset]}return container}function performCaretAction(type,name,vars){var i,currentPendingFormats=pendingFormats[type],otherPendingFormats=pendingFormats[type=="apply"?"remove":"apply"];function hasPending(){return pendingFormats.apply.length||pendingFormats.remove.length}function resetPending(){pendingFormats.apply=[];pendingFormats.remove=[]}function perform(caret_node){each(pendingFormats.apply.reverse(),function(item){apply(item.name,item.vars,caret_node);if(item.name==="forecolor"&&item.vars.value){processUnderlineAndColor(caret_node.parentNode)}});each(pendingFormats.remove.reverse(),function(item){remove(item.name,item.vars,caret_node)});dom.remove(caret_node,1);resetPending()}for(i=currentPendingFormats.length-1;i>=0;i--){if(currentPendingFormats[i].name==name){return}}currentPendingFormats.push({name:name,vars:vars});for(i=otherPendingFormats.length-1;i>=0;i--){if(otherPendingFormats[i].name==name){otherPendingFormats.splice(i,1)}}if(hasPending()){ed.getDoc().execCommand("FontName",false,"mceinline");pendingFormats.lastRng=selection.getRng();each(dom.select("font,span"),function(node){var bookmark;if(isCaretNode(node)){bookmark=selection.getBookmark();perform(node);selection.moveToBookmark(bookmark);ed.nodeChanged()}});if(!pendingFormats.isListening&&hasPending()){pendingFormats.isListening=true;each("onKeyDown,onKeyUp,onKeyPress,onMouseUp".split(","),function(event){ed[event].addToTop(function(ed,e){if(hasPending()&&!tinymce.dom.RangeUtils.compareRanges(pendingFormats.lastRng,selection.getRng())){each(dom.select("font,span"),function(node){var textNode,rng;if(isCaretNode(node)){textNode=node.firstChild;while(textNode&&textNode.nodeType!=3){textNode=textNode.firstChild}if(textNode){perform(node);rng=dom.createRng();rng.setStart(textNode,textNode.nodeValue.length);rng.setEnd(textNode,textNode.nodeValue.length);selection.setRng(rng);ed.nodeChanged()}else{dom.remove(node)}}});if(e.type=="keyup"||e.type=="mouseup"){resetPending()}}})})}}}}})(tinymce);
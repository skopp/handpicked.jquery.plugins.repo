(function(){var exports=this,defaults,InlineChangeEditor;defaults={changeIdAttribute:"data-cid",userIdAttribute:"data-userid",userNameAttribute:"data-username",timeAttribute:"data-time",attrValuePrefix:"",blockEl:"p",stylePrefix:"cts",currentUser:{id:null,name:null},changeTypes:{insertType:{tag:"insert",alias:"ins",action:"Inserted"},deleteType:{tag:"delete",alias:"del",action:"Deleted"}},handleEvents:false,contentEditable:true,isTracking:true,doNotTrack:"span#test",avoid:".ice-avoid"};InlineChangeEditor=function(options){options||(options={});if(!options.element){throw Error("`options.element` must be defined for ice construction.")}ice.dom.extend(true,this,defaults,options);this.pluginsManager=new ice.IcePluginManager(this);if(options.plugins){this.pluginsManager.usePlugins("ice-init",options.plugins)}};InlineChangeEditor.prototype={_changes:{},_userStyles:{},_styles:{},_uniqueStyleIndex:0,_browserType:null,_batchChangeid:null,_uniqueIDIndex:1,_delBookmark:"tempdel",isPlaceHoldingDeletes:false,startTracking:function(){this.element.setAttribute("contentEditable",this.contentEditable);if(this.handleEvents){var self=this;ice.dom.bind(self.element,"keyup keydown keypress mousedown mouseup",function(e){return self.handleEvent(e)})}this.initializeEnvironment();this.initializeEditor();this.initializeRange();this.pluginsManager.fireEnabled(this.element);return this},initializeEnvironment:function(){this.env||(this.env={});this.env.element=this.element;this.env.document=this.element.ownerDocument;this.env.window=this.env.document.defaultView||this.env.document.parentWindow||window;this.env.frame=this.env.window.frameElement;this.env.selection=this.selection=new ice.Selection(this.env)},initializeRange:function(){var range=this.selection.createRange();range.setStart(ice.dom.find(this.element,this.blockEl)[0],0);range.collapse(true);this.selection.addRange(range);if(this.env.frame){this.env.frame.contentWindow.focus()}else{this.element.focus()}},initializeEditor:function(){var self=this,body=this.env.document.createElement("div");if(this.element.childNodes.length){ice.dom.each(ice.dom.contents(this.element),function(i,node){if(ice.dom.isBlockElement(node)){body.appendChild(node)}});if(body.innerHTML===""){body.appendChild(ice.dom.create("<"+this.blockEl+" ><br/></"+this.blockEl+">"))}}else{body.appendChild(ice.dom.create("<"+this.blockEl+" ><br/></"+this.blockEl+">"))}this.element.innerHTML=body.innerHTML;var ins=this._getIceNodeClass("insertType"),del=this._getIceNodeClass("deleteType");ice.dom.each(ice.dom.find(this.element,"."+ins+",."+del),function(i,el){var styleIndex=0;var ctnType="";var classList=el.className.split(" ");for(var i=0;i<classList.length;i++){var styleReg=new RegExp(self.stylePrefix+"-(\\d+)").exec(classList[i]);if(styleReg){styleIndex=styleReg[1]}var ctnReg=new RegExp("("+ins+"|"+del+")").exec(classList[i]);if(ctnReg){ctnType=self._getChangeTypeFromAlias(ctnReg[1])}}var userid=ice.dom.attr(el,self.userIdAttribute);self.setUserStyle(userid,Number(styleIndex));var changeid=ice.dom.attr(el,self.changeIdAttribute);self._changes[changeid]={type:ctnType,userid:userid,username:ice.dom.attr(el,self.userNameAttribute),time:ice.dom.attr(el,self.timeAttribute)}})},enableChangeTracking:function(){this.isTracking=true;this.pluginsManager.fireEnabled(this.element)},disableChangeTracking:function(){this.isTracking=false;this.pluginsManager.fireDisabled(this.element)},setCurrentUser:function(user){this.currentUser=user},handleEvent:function(e){if(!this.isTracking){return}if(e.type=="mouseup"){var self=this;setTimeout(function(){self.mouseUp(e)},200)}else{if(e.type=="mousedown"){return this.mouseDown(e)}else{if(e.type=="keypress"){var needsToBubble=this.keyPress(e);if(!needsToBubble){e.preventDefault()}return needsToBubble}else{if(e.type=="keydown"){var needsToBubble=this.keyDown(e);if(!needsToBubble){e.preventDefault()}return needsToBubble}else{if(e.type=="keyup"){this.pluginsManager.fireCaretUpdated()}}}}}},createIceNode:function(changeType,childNode){var node=this.env.document.createElement(this.changeTypes[changeType].tag);ice.dom.addClass(node,this._getIceNodeClass(changeType));node.appendChild(childNode?childNode:this.env.document.createTextNode(""));this.addChange(this.changeTypes[changeType].alias,[node]);this.pluginsManager.fireNodeCreated(node,{action:this.changeTypes[changeType].action});return node},insert:function(node,range){if(range){this.selection.addRange(range)}else{range=this.getCurrentRange()}if(typeof node==="string"){node=document.createTextNode(node)}if(!range.collapsed){this.deleteContents();range=this.getCurrentRange();if(range.startContainer===range.endContainer&&this.element===range.startContainer){ice.dom.empty(this.element);var firstSelectable=range.getLastSelectableChild(this.element);range.setStartAfter(firstSelectable);range.collapse(true)}}this._moveRangeToValidTrackingPos(range);var changeid=this.startBatchChange();this._insertNode(node||document.createTextNode("\uFEFF"),range,!node);this.pluginsManager.fireNodeInserted(node,range);this.endBatchChange(changeid);return true},placeholdDeletes:function(){var self=this;if(this.isPlaceholdingDeletes){this.revertDeletePlaceholders()}this.isPlaceholdingDeletes=true;this._deletes=[];var deleteSelector="."+this._getIceNodeClass("deleteType");ice.dom.each(ice.dom.find(this.element,deleteSelector),function(i,el){self._deletes.push(ice.dom.cloneNode(el));ice.dom.replaceWith(el,"<"+self._delBookmark+' data-allocation="'+(self._deletes.length-1)+'"/>')});return true},revertDeletePlaceholders:function(){var self=this;if(!this.isPlaceholdingDeletes){return false}ice.dom.each(this._deletes,function(i,el){ice.dom.find(self.element,self._delBookmark+"[data-allocation="+i+"]").replaceWith(el)});this.isPlaceholdingDeletes=false;return true},deleteContents:function(right,range){var prevent=true;if(range){this.selection.addRange(range)}else{range=this.getCurrentRange()}var changeid=this.startBatchChange(this.changeTypes.deleteType.alias);if(range.collapsed===false){this._deleteFromSelection(range)}else{if(right){prevent=this._deleteFromRight(range)}else{prevent=this._deleteFromLeft(range)}}this.selection.addRange(range);this.endBatchChange(changeid);return prevent},getChanges:function(){return this._changes},getElementContent:function(){return this.element.innerHTML},getCleanContent:function(body,callback){var classList="";var self=this;ice.dom.each(this.changeTypes,function(type,i){if(type!="deleteType"){if(i>0){classList+=","}classList+="."+self._getIceNodeClass(type)}});if(body){if(typeof body==="string"){body=ice.dom.create("<div>"+body+"</div>")}else{body=ice.dom.cloneNode(body)[0]}}else{body=ice.dom.cloneNode(this.element)[0]}var changes=ice.dom.find(body,classList);ice.dom.each(changes,function(el,i){ice.dom.replaceWith(this,ice.dom.contents(this))});var deletes=ice.dom.find(body,"."+this._getIceNodeClass("deleteType"));ice.dom.remove(deletes);body=callback?callback.call(this,body):body;return body.innerHTML},acceptAll:function(){this.element.innerHTML=this.getCleanContent()},rejectAll:function(){var insSel="."+this._getIceNodeClass("insertType");var delSel="."+this._getIceNodeClass("deleteType");ice.dom.remove(ice.dom.find(this.element,insSel));ice.dom.each(ice.dom.find(this.element,delSel),function(i,el){ice.dom.replaceWith(el,ice.dom.contents(el))})},acceptChange:function(node){this.acceptRejectChange(node,true)},rejectChange:function(node){this.acceptRejectChange(node,false)},acceptRejectChange:function(node,isAccept){var delSel,insSel,selector,removeSel,replaceSel,trackNode,changes,dom=ice.dom;if(!node){var range=this.getCurrentRange();if(!range.collapsed){return}else{node=range.startContainer}}delSel=removeSel="."+this._getIceNodeClass("deleteType");insSel=replaceSel="."+this._getIceNodeClass("insertType");selector=delSel+","+insSel;trackNode=dom.getNode(node,selector);changes=dom.find(this.element,"["+this.changeIdAttribute+"="+dom.attr(trackNode,this.changeIdAttribute)+"]");if(!isAccept){removeSel=insSel;replaceSel=delSel}if(ice.dom.is(trackNode,replaceSel)){dom.each(changes,function(i,node){dom.replaceWith(node,ice.dom.contents(node))})}else{if(dom.is(trackNode,removeSel)){dom.remove(changes)}}},isInsideChange:function(node){var selector="."+this._getIceNodeClass("insertType")+", ."+this._getIceNodeClass("deleteType");if(!node){range=this.getCurrentRange();if(!range.collapsed){return false}else{node=range.startContainer}}return !!ice.dom.getNode(node,selector)},addChangeType:function(typeName,tag,alias){this.changeTypes[typeName]={tag:tag,alias:alias}},getIceNode:function(node,changeType){var selector="."+this._getIceNodeClass(changeType);return ice.dom.getNode(node,selector)},_moveRangeToValidTrackingPos:function(range){var onEdge=false;var voidEl=this._getVoidElement(range.endContainer);while(voidEl){try{range.moveEnd(ice.dom.CHARACTER_UNIT,1);range.moveEnd(ice.dom.CHARACTER_UNIT,-1)}catch(e){onEdge=true}if(onEdge||ice.dom.onBlockBoundary(range.endContainer,range.startContainer,this.blockEl)){range.setStartAfter(voidEl);range.collapse(true);break}voidEl=this._getVoidElement(range.endContainer);if(voidEl){range.setEnd(range.endContainer,0);range.moveEnd(ice.dom.CHARACTER_UNIT,ice.dom.getNodeTextContent(range.endContainer).length);range.collapse()}else{range.setStart(range.endContainer,0);range.collapse(true)}}},_getVoidElement:function(node){var voidSelector=this._getVoidElSelector();return ice.dom.is(node,voidSelector)?node:(ice.dom.parents(node,voidSelector)[0]||null)},_getVoidElSelector:function(){return"."+this._getIceNodeClass("deleteType")+","+this.avoid},_currentUserIceNode:function(node){return ice.dom.attr(node,this.userIdAttribute)==this.currentUser.id},_getChangeTypeFromAlias:function(alias){var type,ctnType=null;for(type in this.changeTypes){if(this.changeTypes.hasOwnProperty(type)){if(this.changeTypes[type].alias==alias){ctnType=type}}}return ctnType},_getIceNodeClass:function(changeType){return this.attrValuePrefix+this.changeTypes[changeType].alias},getUserStyle:function(userid){var styleIndex=null;if(this._userStyles[userid]){styleIndex=this._userStyles[userid]}else{styleIndex=this.setUserStyle(userid,this.getNewStyleId())}return styleIndex},setUserStyle:function(userid,styleIndex){var style=this.stylePrefix+"-"+styleIndex;if(!this._styles[styleIndex]){this._styles[styleIndex]=true}return this._userStyles[userid]=style},getNewStyleId:function(){var id=++this._uniqueStyleIndex;if(this._styles[id]){return this.getNewStyleId()}else{this._styles[id]=true;return id}},addChange:function(ctnType,ctNodes){var changeid=this._batchChangeid||this.getNewChangeId();if(!this._changes[changeid]){this._changes[changeid]={type:this._getChangeTypeFromAlias(ctnType),time:(new Date()).getTime(),userid:this.currentUser.id,username:this.currentUser.name}}var self=this;ice.dom.foreach(ctNodes,function(i){self.addNodeToChange(changeid,ctNodes[i])});return changeid},addNodeToChange:function(changeid,ctNode){if(this._batchChangeid!==null){changeid=this._batchChangeid}var change=this.getChange(changeid);if(!ctNode.getAttribute(this.changeIdAttribute)){ctNode.setAttribute(this.changeIdAttribute,changeid)}if(!ctNode.getAttribute(this.userIdAttribute)){ctNode.setAttribute(this.userIdAttribute,change.userid)}if(!ctNode.getAttribute(this.userNameAttribute)){ctNode.setAttribute(this.userNameAttribute,change.username)}if(!ctNode.getAttribute(this.timeAttribute)){ctNode.setAttribute(this.timeAttribute,change.time)}if(!ice.dom.hasClass(ctNode,this._getIceNodeClass(change.type))){ice.dom.addClass(ctNode,this._getIceNodeClass(change.type))}var style=this.getUserStyle(change.userid);if(!ice.dom.hasClass(ctNode,style)){ice.dom.addClass(ctNode,style)}},getChange:function(changeid){var change=null;if(this._changes[changeid]){change=this._changes[changeid]}return change},getNewChangeId:function(){var id=++this._uniqueIDIndex;if(this._changes[id]){id=this.getNewChangeId()}return id},startBatchChange:function(){this._batchChangeid=this.getNewChangeId();return this._batchChangeid},endBatchChange:function(changeid){if(changeid!==this._batchChangeid){return}this._batchChangeid=null},getCurrentRange:function(){return this.selection.getRangeAt(0)},_insertNode:function(node,range,insertingDummy){var ctNode=this.getIceNode(range.startContainer,"insertType");var inCurrentUserInsert=this._currentUserIceNode(ctNode);if(insertingDummy&&inCurrentUserInsert){return}else{if(!inCurrentUserInsert){node=this.createIceNode("insertType",node)}}range.insertNode(node);if(insertingDummy){range.setStart(node,0);range.setEnd(node,1)}this.selection.addRange(range)},_deleteFromSelection:function(range){var bookmark=new ice.Bookmark(this.env,range),elements=ice.dom.getElementsBetween(bookmark.start,bookmark.end),b1=ice.dom.parents(range.startContainer,this.blockEl)[0],b2=ice.dom.parents(range.endContainer,this.blockEl)[0],betweenBlocks=new Array(),eln=elements.length;var eln=elements.length;for(var i=0;i<eln;i++){var elem=elements[i];if(ice.dom.is(elem,this.blockEl)){betweenBlocks.push(elem)}if(elem.nodeType===ice.dom.TEXT_NODE&&ice.dom.getNodeTextContent(elem)===""){continue}if(!this._getVoidElement(elem)){if(elem.nodeType!==ice.dom.TEXT_NODE){ice.dom.remove(ice.dom.find(elem,"br"));var block=ice.dom.cloneNode(elem);ice.dom.remove(ice.dom.find(block,this._getVoidElSelector()));if(ice.dom.getNodeTextContent(block).length===0){continue}else{if(ice.dom.is(elem,this.blockEl)){var ctNode=this.createIceNode("deleteType");newEl=document.createElement(this.blockEl);ctNode.innerHTML=elem.innerHTML;elem.innerHTML="";elem.appendChild(ctNode);continue}}}var del=this.createIceNode("deleteType");ice.dom.insertBefore(elem,del);del.appendChild(elem)}}if(b1!==b2){while(betweenBlocks.length){ice.dom.mergeContainers(betweenBlocks.shift(),b1)}ice.dom.mergeContainers(b2,b1)}var startEl=bookmark.start.previousSibling;if(!startEl){startEl=this.env.document.createTextNode("");ice.dom.insertBefore(bookmark.start,startEl);this.selection.addRange(range);bookmark.selectBookmark();range=this.getCurrentRange();range.setStart(startEl,0)}else{bookmark.selectBookmark();range=this.getCurrentRange();range.moveStart(ice.dom.CHARACTER_UNIT,-1);range.moveStart(ice.dom.CHARACTER_UNIT,1)}range.collapse(true)},_deleteFromRight:function(range){var parentBlock=ice.dom.parents(range.startContainer,this.blockEl)[0]||ice.dom.is(range.startContainer,this.blockEl)&&range.startContainer||null;var nextBlock=parentBlock&&parentBlock.nextSibling||null;var isEmptyBlock=(ice.dom.is(range.startContainer,this.blockEl)&&ice.dom.getNodeTextContent(range.startContainer)=="");range.moveEnd(ice.dom.CHARACTER_UNIT,1);range.moveEnd(ice.dom.CHARACTER_UNIT,-1);if(!nextBlock&&!ice.dom.isChildOf(range.endContainer,this.element)){range.moveEnd(ice.dom.CHARACTER_UNIT,-1);range.moveEnd(ice.dom.CHARACTER_UNIT,1);range.collapse();return true}if(ice.dom.onBlockBoundary(range.endContainer,range.startContainer,this.blockEl)||isEmptyBlock){if(nextBlock!==ice.dom.parents(range.endContainer,this.blockEl)[0]){range.setEnd(nextBlock,0)}ice.dom.remove(ice.dom.find(range.startContainer,"br"));return ice.dom.mergeBlockWithSibling(range,ice.dom.parents(range.startContainer,this.blockEl)[0]||parentBlock,true)}if(this._getVoidElement(range.endContainer)){range.setEnd(range.endContainer,0);range.moveEnd(ice.dom.CHARACTER_UNIT,ice.dom.getNodeTextContent(range.endContainer).length||0);range.collapse();return this._deleteFromRight(range)}range.collapse();var container=range.startContainer;if(range.startContainer.data&&range.endOffset===container.data.length){var cRange=range.cloneRange();cRange.moveEnd(ice.dom.CHARACTER_UNIT,1);var eParent=ice.dom.getBlockParent(cRange.endContainer,this.element);if(eParent){if(ice.dom.isChildOf(eParent,this.element)===false){return}var sParent=ice.dom.getBlockParent(cRange.startContainer,this.element);if(eParent!==sParent){ice.dom.mergeContainers(eParent,sParent);range.setStart(cRange.startContainer,cRange.startContainer.data.length);range.collapse(true);return}}var nextContainer=range.getNextContainer(container);if(ice.dom.isChildOf(nextContainer,this.element)===false){return false}var firstSelectable=range.getFirstSelectableChild(nextContainer);range.setStart(firstSelectable,0);this._addTextNodeTracking(firstSelectable,range)}else{var textAddNode=this.getIceNode(range.startContainer,"insertType");if(textAddNode===null||!this._currentUserIceNode(textAddNode)){this._addTextNodeTracking(range.startContainer,range,true)}else{range.moveEnd(ice.dom.CHARACTER_UNIT,1);range.deleteContents();if(textAddNode!==null&&ice.dom.isBlank(ice.dom.getNodeTextContent(textAddNode))===true){var prevSibling=textAddNode.previousSibling;if(!prevSibling||prevSibling.nodeType!==ice.dom.TEXT_NODE){prevSibling=this.env.document.createTextNode("");ice.dom.insertBefore(textAddNode,prevSibling)}range.setStart(prevSibling,prevSibling.data.length);ice.dom.remove(textAddNode)}}}range.collapse(true);return true},_deleteFromLeft:function(range){var parentBlock=ice.dom.parents(range.startContainer,this.blockEl)[0]||ice.dom.is(range.startContainer,this.blockEl)&&range.startContainer||null,prevBlock=parentBlock&&parentBlock.previousSibling||null,isEmptyBlock=(ice.dom.is(range.startContainer,this.blockEl)&&ice.dom.getNodeTextContent(range.startContainer)=="");range.moveStart(ice.dom.CHARACTER_UNIT,-1);var failedToMove=(range.startOffset===range.endOffset&&range.startContainer===range.endContainer),movedOutsideBlock=!ice.dom.isChildOf(range.startContainer,this.element);range.moveStart(ice.dom.CHARACTER_UNIT,1);if(failedToMove||!prevBlock&&movedOutsideBlock){range.moveStart(ice.dom.CHARACTER_UNIT,1);range.moveStart(ice.dom.CHARACTER_UNIT,-1);range.collapse(true);return true}if(ice.dom.onBlockBoundary(range.startContainer,range.endContainer,this.blockEl)||isEmptyBlock){if(prevBlock!==ice.dom.parents(range.startContainer,this.blockEl)[0]){range.setStart(prevBlock,0)}ice.dom.remove(ice.dom.find(range.endContainer,"br"));return ice.dom.mergeBlockWithSibling(range,ice.dom.parents(range.endContainer,this.blockEl)[0]||parentBlock)}if(this._getVoidElement(range.startContainer)){range.setStart(range.startContainer,0);range.collapse(true);return this._deleteFromLeft(range)}var container=range.startContainer;if(range.startOffset===0){var cRange=range.cloneRange();cRange.moveStart(ice.dom.CHARACTER_UNIT,-1);var sParent=ice.dom.getBlockParent(cRange.startContainer,this.element);if(sParent){if(ice.dom.isChildOf(sParent,this.element)===false){return false}var eParent=ice.dom.getBlockParent(cRange.endContainer,this.element);if(eParent!==sParent){ice.dom.mergeContainers(eParent,sParent);range.setStart(cRange.startContainer,cRange.startContainer.data.length);range.collapse(true);return}}var previousContainer=range.getPreviousContainer(container);if(!ice.dom.isChildOf(previousContainer,this.element)){return false}if(ice.dom.isStubElement(previousContainer)){range.moveStart(ice.dom.CHARACTER_UNIT,-1);ice.dom.addClass(previousContainer,this._getIceNodeClass("deleteType"));ice.dom.attr(previousContainer,"title","Content removed");range.collapse(true)}else{var lastSelectable=range.getLastSelectableChild(previousContainer);range.setStart(lastSelectable,lastSelectable.data.length);this._addTextNodeTracking(lastSelectable,range)}}else{var textNode=range.startContainer;var textAddNode=this.getIceNode(textNode,"insertType");if(textAddNode===null||!this._currentUserIceNode(textAddNode)){this._addTextNodeTracking(textNode,range)}else{range.moveStart(ice.dom.CHARACTER_UNIT,-1);range.moveEnd(ice.dom.CHARACTER_UNIT,-1);range.moveEnd(ice.dom.CHARACTER_UNIT,1);range.deleteContents();if(textAddNode!==null&&ice.dom.isBlank(ice.dom.getNodeTextContent(textAddNode))){var newstart=this.env.document.createTextNode("");ice.dom.insertBefore(textAddNode,newstart);range.setStart(newstart,0);range.collapse(true);ice.dom.replaceWith(textAddNode,ice.dom.contents(textAddNode))}}}return true},_addTextNodeTracking:function(textNode,range,del){if((!del&&range.startOffset===0)||this.getIceNode(textNode,"deleteType")!==null){return}var beforeText="";var removedChar="";var afterText="";if(!del){beforeText=textNode.nodeValue.substring(0,(range.startOffset-1));removedChar=textNode.nodeValue.substr((range.startOffset-1),1);afterText=textNode.nodeValue.substring(range.startOffset)}else{beforeText=textNode.nodeValue.substring(0,range.endOffset);removedChar=textNode.nodeValue.substr(range.endOffset,1);afterText=textNode.nodeValue.substring((range.endOffset+1))}if((range.startOffset===1&&!del)||(del&&range.startOffset===0)){var ctNode=this.getIceNode(textNode.previousSibling,"deleteType");if(ctNode!==null&&!this._currentUserIceNode(ctNode)){ctNode=null}if(ctNode){if(!del){if(ctNode.lastChild&&ctNode.lastChild.nodeType===ice.dom.TEXT_NODE){ctNode.lastChild.nodeValue+=removedChar;range.setStart(ctNode.lastChild,(ctNode.lastChild.nodeValue.length-1))}else{var charNode=this.env.document.createTextNode(removedChar);ctNode.appendChild(charNode);range.setStart(charNode,0)}textNode.nodeValue=beforeText+afterText;textNode.nodeValue=beforeText+afterText;if(textNode.nodeValue.length===0){var found=false;var previousSibling=textNode.previousSibling;while(!found){ctNode=this.getIceNode(previousSibling,"deleteType");if(!ctNode){found=true}else{previousSibling=previousSibling.previousSibling}}if(previousSibling){previousSibling=range.getLastSelectableChild(previousSibling);range.setStart(previousSibling,previousSibling.nodeValue.length);range.collapse(true)}}else{range.collapse(true)}}else{if(ctNode.lastChild&&ctNode.lastChild.nodeType===ice.dom.TEXT_NODE){ctNode.lastChild.nodeValue+=removedChar}else{var charNode=this.env.document.createTextNode(removedChar);ctNode.appendChild(charNode)}textNode.nodeValue=beforeText+afterText;if(textNode.nodeValue.length===0){var found=false;var nextSibling=textNode.nextSibling;while(!found){ctNode=this.getIceNode(nextSibling,"deleteType");if(!ctNode){found=true}else{nextSibling=nextSibling.nextSibling}}if(nextSibling){range.setStart(nextSibling,0);range.collapse(true)}}else{range.setStart(textNode,0);range.collapse(true)}}return}}if(range.startOffset===textNode.nodeValue.length){var ctNode=this.getIceNode(textNode.nextSibling,"deleteType");if(ctNode!==null&&!this._currentUserIceNode(ctNode)){ctNode=null}if(ctNode){if(ctNode.firstChild&&ctNode.firstChild.nodeType===ice.dom.TEXT_NODE){ctNode.firstChild.nodeValue=removedChar+ctNode.firstChild.nodeValue}else{var charNode=this.env.document.createTextNode(removedChar);ice.dom.insertBefore(ctNode.firstChild,charNode)}textNode.nodeValue=beforeText;range.setStart(textNode,textNode.nodeValue.length);range.setEnd(textNode,textNode.nodeValue.length);return}}var ctNode=this.createIceNode("deleteType");var newNode=null;if(del!==true){newNode=textNode.splitText(range.startOffset-1);newNode.nodeValue=newNode.nodeValue.substring(1);ice.dom.insertAfter(textNode,newNode);ctNode.firstChild.nodeValue=removedChar;ice.dom.insertAfter(textNode,ctNode);range.setStart(textNode,textNode.nodeValue.length);range.setEnd(textNode,textNode.nodeValue.length)}else{newNode=textNode.splitText(range.endOffset);newNode.nodeValue=newNode.nodeValue.substring(1);ice.dom.insertAfter(textNode,newNode);ctNode.firstChild.nodeValue=removedChar;ice.dom.insertAfter(textNode,ctNode);range.setStart(newNode,0);range.setEnd(newNode,0)}},_handleAncillaryKey:function(e){var key=e.keyCode;var preventDefault=true;var shiftKey=e.shiftKey;switch(key){case ice.dom.DOM_VK_DELETE:preventDefault=this.deleteContents();this.pluginsManager.fireKeyPressed(e);break;case 46:preventDefault=this.deleteContents(true);this.pluginsManager.fireKeyPressed(e);break;case ice.dom.DOM_VK_DOWN:case ice.dom.DOM_VK_UP:case ice.dom.DOM_VK_LEFT:case ice.dom.DOM_VK_RIGHT:this.pluginsManager.fireCaretPositioned();preventDefault=false;break;default:preventDefault=false;break}if(preventDefault===true){ice.dom.preventDefault(e);return false}return true},keyDown:function(e){if(!this.pluginsManager.fireKeyDown(e)){ice.dom.preventDefault(e);return false}var preventDefault=false;if(this._handleSpecialKey(e)===false){if(ice.dom.isBrowser("msie")!==true){this._preventKeyPress=true}return false}else{if((e.ctrlKey===true||e.metaKey===true)&&(ice.dom.isBrowser("msie")===true||ice.dom.isBrowser("chrome")===true)){if(!this.pluginsManager.fireKeyPressed(e)){return false}}}switch(e.keyCode){case 27:break;default:if(/Firefox/.test(navigator.userAgent)!==true){preventDefault=!(this._handleAncillaryKey(e))}break}if(preventDefault){ice.dom.preventDefault(e);return false}return true},keyPress:function(e){if(this._preventKeyPress===true){this._preventKeyPress=false;return}if(!this.pluginsManager.fireKeyPressed(e)){return false}var c=null;if(e.which==null){c=String.fromCharCode(e.keyCode)}else{if(e.which>0){c=String.fromCharCode(e.which)}}var range=this.getCurrentRange();var br=ice.dom.parents(range.startContainer,"br")[0]||null;if(br){range.moveToNextEl(br);br.parentNode.removeChild(br)}if(c!==null&&e.ctrlKey!==true&&e.metaKey!==true){switch(e.keyCode){case ice.dom.DOM_VK_DELETE:return this._handleAncillaryKey(e);case ice.dom.DOM_VK_ENTER:return this._handleEnter();default:this._moveRangeToValidTrackingPos(range,range.startContainer);return this.insert();break}}return this._handleAncillaryKey(e)},_handleEnter:function(){var range=this.getCurrentRange();if(!range.collapsed){this.deleteContents()}return true},_handleSpecialKey:function(e){var keyCode=e.which;if(keyCode===null){keyCode=e.keyCode}var preventDefault=false;switch(keyCode){case 65:if(e.ctrlKey===true||e.metaKey===true){preventDefault=true;var range=this.getCurrentRange();if(ice.dom.isBrowser("msie")===true){var selStart=this.env.document.createTextNode("");var selEnd=this.env.document.createTextNode("");if(this.element.firstChild){ice.dom.insertBefore(this.element.firstChild,selStart)}else{this.element.appendChild(selStart)}this.element.appendChild(selEnd);range.setStart(selStart,0);range.setEnd(selEnd,0)}else{range.setStart(range.getFirstSelectableChild(this.element),0);var lastSelectable=range.getLastSelectableChild(this.element);range.setEnd(lastSelectable,lastSelectable.length)}this.selection.addRange(range)}break;default:break}if(preventDefault===true){ice.dom.preventDefault(e);return false}return true},mouseUp:function(e,target){if(!this.pluginsManager.fireClicked(e)){return false}this.pluginsManager.fireSelectionChanged(this.getCurrentRange())},mouseDown:function(e,target){if(!this.pluginsManager.fireMouseDown(e)){return false}this.pluginsManager.fireCaretUpdated()}};exports.ice=this.ice||{};exports.ice.InlineChangeEditor=InlineChangeEditor}).call(this);
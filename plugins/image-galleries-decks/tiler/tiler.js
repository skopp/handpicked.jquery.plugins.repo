(function($){function Tiler(element,options){this.options=$.extend({},Tiler.defaults,options);this.tiles=new Grid();this.element=element.jquery?element:$(element);this.x=this.initX=this.options.x;this.y=this.initY=this.options.y;this.gridOffsetX=0;this.gridOffsetY=0;this.grid=$("<div/>").css({position:"absolute"}).appendTo(this.element);this.calcRowsColsCount();this.calcCornersCoords();this.setGridPosition();}Tiler.defaults={fetch:null,tileSize:null,margin:2,x:0,y:0};var Proto=Tiler.prototype;Proto.setGridPosition=function(){this.grid.css({left:0,top:0});};Proto.calcGridOffset=function(){var pos=this.grid.position();var ts=this.options.tileSize;pos.left>0&&(pos.left+=ts);pos.top>0&&(pos.top+=ts);return{x:~~(pos.left/ts)-this.gridOffsetX,y:~~(pos.top/ts)-this.gridOffsetY};};Proto.refresh=function(){var offset=this.calcGridOffset();this.x-=offset.x;this.y-=offset.y;this.gridOffsetX+=offset.x;this.gridOffsetY+=offset.y;this.calcRowsColsCount();this.calcCornersCoords();var removed=this.getHiddenTilesCoords();var tofetch=this.getTilesCoordsToFetch();if(removed.length){this.remove(removed);}if(tofetch.length||removed.length){this.fetchTiles(tofetch,removed);}};Proto.reload=function(){this.fetchTiles(this.getAllTilesCoords(),[]);};Proto.coords=function(x,y){if(!arguments.length){return{x:this.x,y:this.y};}this.x=this.initX=x;this.y=this.initY=y;this.gridOffsetX=0;this.gridOffsetY=0;this.calcRowsColsCount();this.calcCornersCoords();this.setGridPosition();var removed=this.getHiddenTilesCoords();var tofetch=this.getTilesCoordsToFetch();this.remove(removed);this.arrangeAll();this.fetchTiles(tofetch,removed);};Proto.show=function(x,y,elems){var fragment=document.createDocumentFragment();var tiles=$.isArray(x)?x:[[x,y,elems]];var elems;for(var i=0,l=tiles.length;i<l;i++){x=tiles[i][0];y=tiles[i][1];if(!this.inGrid(x,y)){continue;}elems=tiles[i][2];elems=$.isArray(elems)?elems:[elems];elems=$.map(elems,function(elem){return elem.jquery?elem:$(elem);});$.each(elems,function(i,elem){fragment.appendChild(elem.get(0));});this.remove(x,y);this.tiles.set(x,y,elems);this.arrange(x,y);}this.grid.append(fragment);};Proto.arrange=function(x,y){var elems=this.tiles.get(x,y),ts=this.options.tileSize,ix=this.initX,iy=this.initY;$.each(elems,function(i,elem){elem.css({position:"absolute",left:(x-ix)*ts,top:(y-iy)*ts});});};Proto.arrangeAll=function(){var coords=this.tiles.coords();for(var i=coords.length;i--;){this.arrange(coords[i][0],coords[i][1]);}};Proto.remove=function(x,y){var coords=$.isArray(x)?x:[[x,y]];for(var i=0,l=coords.length;i<l;i++){x=coords[i][0];y=coords[i][1];var present=this.tiles.get(x,y);if(present){this.tiles.remove(x,y);$.each(present,function(i,elem){elem.remove();});}}};Proto.getTilesCoordsToFetch=function(){var tofetch=[],all=this.getAllTilesCoords(),x,y;for(var i=0,l=all.length;i<l;i++){x=all[i][0];y=all[i][1];if(!this.tiles.get(x,y)){tofetch.push([x,y]);}}return tofetch;};Proto.getHiddenTilesCoords=function(){var coords=[],self=this;this.tiles.each(function(tile,x,y){if(!self.inGrid(x,y)){coords.push([x,y]);}});return coords;};Proto.getAllTilesCoords=function(){var coords=[];for(var y=this.corners.y1;y<=this.corners.y2;y++){for(var x=this.corners.x1;x<=this.corners.x2;x++){coords.push([x,y]);}}return coords;};Proto.fetchTiles=function(tofetch,removed){if($.isFunction(this.options.fetch)){this.options.fetch(tofetch,removed);}};Proto.calcColsCount=function(){var width=this.element.width(),op=this.options;if(width&&op.tileSize){return Math.ceil(width/op.tileSize)+op.margin*2;}return 0;};Proto.calcRowsCount=function(){var height=this.element.height(),op=this.options;if(height&&op.tileSize){return Math.ceil(height/op.tileSize)+op.margin*2;}return 0;};Proto.calcRowsColsCount=function(){this.rowsCount=this.calcRowsCount();this.colsCount=this.calcColsCount();};Proto.calcCornersCoords=function(){var x1=this.x-this.options.margin,y1=this.y-this.options.margin;this.corners={x1:x1,y1:y1,x2:x1+this.colsCount-1,y2:y1+this.rowsCount-1};};Proto.inGrid=function(x,y){if(y<this.corners.y1||y>this.corners.y2||x<this.corners.x1||x>this.corners.x2){return false;}return true;};window.Tiler=Tiler;})(jQuery);
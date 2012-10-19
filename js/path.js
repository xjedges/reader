debug(1)
window.onload=main
function main(){

var body=$("body")
var container=$("div",{cls:"container"})
var controller=$("div",{cls:"controller"})
var scrollControl=ScrollControl()

function ScrollControl(){
	var self=$("div",{cls:"scrollControl"})
	var val=20
	var lock=false
	var scrollFunc=function(e){
	    e=e || window.event; 
		if(e.wheelDelta && !lock){//webkit
			lock=true
			setTimeout(function(){lock=false},1)

			valtemp=val+e.wheelDelta/120
			val=valtemp<40 && valtemp>-1 ? valtemp : val
			update(val)
	    }else if(e.detail){//gecko
	    } 
	}
	self.addEventListener("mouseover",function(){
		document.addEventListener('DOMMouseScroll',scrollFunc,false);//gecko
		window.onmousewheel=document.onmousewheel=scrollFunc;//webkit
	})
	self.addEventListener("mouseout",function(){
		document.removeEventListener('DOMMouseScroll',scrollFunc,false); 
		window.onmousewheel=document.onmousewheel=function(){};
	})
	return self
}
		

body.append(
	container,
	controller.append(
		scrollControl
	)
)
var count=100
var zoom=30

for(var i=0;i<count;i++){
	var box=$("div",{cls:"box"})
	container.append(box)
}

function update(zoom){
	for(var i=0;i<count;i++){
		gain=i/zoom-count/zoom/2
		var x=Math.round(gain*zoom)
		var y=Math.round(Math.pow(gain,2))
		container.child(i).css({top:y,left:x})
	}
}

}
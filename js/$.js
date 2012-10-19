/*
 * 2012-6-8
 *
 * 参数: tag:标签<string>,
 *       attr:参数<{id, cls, text, html, src, href, value, css}>
 *
 * 方法: hasClass, addClass, removeClass,
 *       append, appendTo, parent, children[],
 *       click,
 *       css, animation,
 *       remove, clear,
 *       html, text, each,
 */
function isArray(value){
    if(value instanceof Array||value.constructor.toString().match(/function\sArray\(/))return true;
};
function $(tag,attr){
    var self={};
    var frame=20;
    var queue=[];
    var queueState=true;
    if(tag[0]!="#"){
        switch(tag){
            case "body" : self=document.body;break;
            case "head" : self=document.head;break;
            case "frag" :
                var frag=document.createDocumentFragment();
                frag.append=function(){
                    for(var i in arguments){
                        if(isArray(arguments[i])){
                            for(var j in arguments[i]){
                                frag.appendChild(arguments[i][j]);
                            }
                        }else{
                            frag.appendChild(arguments[i]);
                        }
                    }
                };
                return frag;
            default     : self=document.createElement(tag);
        }
    }else{
        self=document.getElementById(tag.slice(1));
    }
    for(var i in attr||{}){
        var value=attr[i];
        switch(i){
            case "cls"  : self.className=value;break;
            case "text" : self.text(value);break;
            case "html" : self.html(value);break;
            case "css"  : self.css(value);break;
            default     : self[i]=value;
        }
    }
    self.animation=function(param){
        queue.push(function(){
            queueState=false;
            var time=param.time || 200;
            if(param.attr){
                var attr={};
                for(var i in param.attr){
                    var startValue;
                    switch(i){
                        case"width":case"height":case"top":case"left":case"bottom":case"right":
                            var attrName="offset"+i.replace(/(\w)/,function(s){return s.toUpperCase();});
                            startValue=self[attrName];
                            break;
                        case"opacity":
                            startValue=parseInt(self.ownerDocument.defaultView.getComputedStyle(self, null)['opacity']);
                            break;
                        default:
                            var startValue=parseInt(self.style[i].match(/[0-9]*/));
                    }
                    var endValue=param.attr[i];
                    var stepValue=(endValue-startValue)/frame/time*1000;
                    attr[i]={start:startValue,end:endValue,step:stepValue,accumulate:startValue};
                }
                var animation=window.setInterval(function(){
                    var cssSetting={};
                    for(var i in attr){
                        attr[i].accumulate+=attr[i].step;
                        cssSetting[i]=attr[i].accumulate;
                    }
                    self.css(cssSetting);
                },1000/frame);
            }
            window.setTimeout(function(){
                animation && window.clearInterval(animation);
                queue.shift();
                param.callback && param.callback();
                queueState=true;
                queue[0] && queue[0]();
            },time);
        });
        queueState && queue[0]();
    };
    return self;
};

HTMLElement.prototype.css=function(attr){
    if(typeof(attr)=="string"){
        var value=window.getComputedStyle(this,null)[attr];
        if(attr.match(/[height|width|top|right|bottom|left|marginTop|marginRight|marginBottom|marginLeft|paddingTop|paddingRight|paddingBottom|paddingLeft]/)){
            value=parseInt(value.match(/\d*/));
        }
        return value;
    };
    for(var stl in attr){
        value=attr[stl];
        switch(typeof value){
            case "string":
                this.style[stl]=value;break;
            case "number":
                if(stl=="zIndex"||stl=="opacity"||value==0){this.style[stl]=value;}
                else{this.style[stl]=value+"px";}break;
            case "object":
                var str="";
                for(var i in value){
                    str+=value[i];
                    if(typeof value[i]=="number"&&value[i]!=0){
                        str+="px";
                    }
                    str+=" ";
                }
                this.style[stl]=str;break;
        }
    }
    return this;
};
HTMLElement.prototype.attr=function(attrName,attr){
    if(attr){this.setAttribute(attrName,attr)}
    else{return this.getAttribute(attrName)}
};
HTMLElement.prototype.each=function(fun){
    for(var i=0;i<this.childNodes.length;i++){
        fun.call(this.childNodes[i],i);
    }
    return this;
};
HTMLElement.prototype.find=function(exp){
    return this.querySelector(exp);
};
//---------------------------------------- hasClass addClass removeClass
HTMLElement.prototype.hasClass=function(cls){
    return this.className.match(new RegExp('(\\s|^)'+cls+'(\\s|)'));
};
HTMLElement.prototype.addClass=function(cls){
    var clsArr=cls.split(" ");
    for(var i in clsArr){
        if (!this.hasClass(clsArr[i]))this.className+=(this.className==""?"":" ")+clsArr[i];
    }
    return this;
};
HTMLElement.prototype.removeClass=function(cls){
    var clsArr=cls.split(" ");
    for(var i in clsArr){
        if (this.hasClass(clsArr[i])) {
            var reg = new RegExp('((\\s|^))'+cls+'(\\s|)');
            this.className=this.className.replace(reg,' ');
            this.className=this.className.replace(/\s+/g," ");//remove 2 space
            this.className=this.className.replace(/(^\s*)|(\s*$)/g,"");// remove front and back space
        }
    }
    return this;
};
//---------------------------------------- append prepend
HTMLElement.prototype.append=function(){
    for(var i in arguments){
        if(isArray(arguments[i])){
            for(var j in arguments[i]){
                this.appendChild(arguments[i][j]);
            }
        }else{
            this.appendChild(arguments[i]);
        }
    };
    return this;
};
HTMLElement.prototype.appendTo=function(parent){
    this.parentNode.append(this);
    return this;
};
HTMLElement.prototype.prepend=function(){
    for(var i in arguments){
        if(this.hasChildNodes()){ 
            this.insertBefore(arguments[i],this.firstChild); 
        }else{ 
            this.appendChild(arguments[i]); 
        }
    }
    return this;
};
HTMLElement.prototype.prependTo=function(parent){
    this.parentNode.prepend(this);
    return this;
};
//---------------------------------------- parent child
HTMLElement.prototype.parent=function(num){
    if(num>1){
         return this.parentNode.parent(num-1);
    }
    else{return this.parentNode;}
};
HTMLElement.prototype.child=function(num){
    if(num!=null){
         return this.children[num];
    }
    else{return this.children;}
};
HTMLElement.prototype.next=function(){
    return this.nextSibling;
};
HTMLElement.prototype.prev=function(){
    return this.previousSibling;
};
//---------------------------------------- remove clear
HTMLElement.prototype.remove=function(){
    if(this.parentNode){
        this.parentNode.removeChild(this);
    }
};
HTMLElement.prototype.clear=function(){
    while (this.hasChildNodes()) {
        this.removeChild(this.lastChild);
    }
    return this;
};
//---------------------------------------- html text
HTMLElement.prototype.html=function(str){
    if(str){
        this.innerHTML=str;
    }else{
        return this.innerHTML;
    }
};
HTMLElement.prototype.text=function(str){
    // this.innerHTML= str.replace(/</g,"&lt;").replace(/>/g,"&gt;")
    if(str){
        this.appendChild(document.createTextNode(str));
        return this;
    }else{
        return this.innerHTML;
    }
};
//---------------------------------------- width height top left
HTMLElement.prototype.width=function(num){
    if(num){
        this.style.width=num;
        return this;
    }
    return this.offsetWidth;
};
HTMLElement.prototype.height=function(num){
    if(num){
        this.style.height=num;
        return this;
    }
    return this.offsetHeight;
};
HTMLElement.prototype.top=function(num){
    if(num){
        this.style.top=num;
        return this;
    }
    return this.style.top;
};
HTMLElement.prototype.left=function(num){
    if(num){
        this.style.left=num;
        return this;
    }
    return this.style.left;
};
HTMLElement.prototype.show=function(){
    this.style.display="block";
};
HTMLElement.prototype.hide=function(){
    this.style.display="none";
};
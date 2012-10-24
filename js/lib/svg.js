function SVG(tag,attr){
    var self={};
    self=document.createElementNS('http://www.w3.org/2000/svg',tag)
    self.set=function(attr){
        for(var i in attr||{}){
            self.setAttribute(i,attr[i]);
        }
        return self;
    }
    self.append=function(){
        for(var i in arguments){
            if(isArray(arguments[i])){
                for(var j in arguments[i]){
                    self.appendChild(arguments[i][j]);
                }
            }else{
                self.appendChild(arguments[i]);
            }
        };
        return self;
    };
    self.set(attr)
    return self;
};
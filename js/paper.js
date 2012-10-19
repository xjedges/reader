debug({W:300,H:500});
window.onload=main;
function SVG(tag,attr){
    var self={};
    self=document.createElementNS('http://www.w3.org/2000/svg',tag)
    self.set=function(attr){
        for(var i in attr||{}){
            var value=attr[i];
            self.setAttribute(i,value);
        }
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
function main(){
    var body=$("body")
    var info=$("span")
    var feedView=FeedView()
    body.append(feedView,info)
    feedView.setData({items:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]})
    function FeedView(){
        var self=$("div",{cls:"feedView"})
        var size=300
        var articlePreviewArr=[]
        var wrapdata=[]
        var wrapCount=0
        var data;
        var time=600
        var frame=20
        var shadow=Shadow()
        var papers=Papers()
        var btnPrev=$("div",{id:"btnPrev",text:"prev"})
        var btnNext=$("div",{id:"btnNext",text:"next"})
        self.append(shadow,papers,btnPrev,btnNext)
        btnPrev.onclick=function(){
            var interval=window.setInterval(function(){
                papers.update(200)
            },time/frame)
            var timeout=setTimeout(function(){
                clearInterval(interval)
            },time)
        }
        btnNext.onclick=function(){
            var interval=window.setInterval(function(){
                papers.update(-200)
            },time/frame)
            var timeout=setTimeout(function(){
                clearInterval(interval)
            },time)
        }
        self.setData=function(d){
            data=d
            papers.init();
            shadow.css({display:"none"})
            wrapCount=0;
            articlePreviewArr=[]
            for(var i in data.items){
                var articlePreview=ArticlePreview(data.items[i])
                articlePreviewArr.push(articlePreview)
            }
        }
        self.setWrap=function(){
            wrapCount++
            if(wrapCount==data.items.length){
                for(var i in articlePreviewArr){
                    articlePreviewArr[i].data.type=parseArticle(articlePreviewArr[i].data.imgW,articlePreviewArr[i].data.imgH,articlePreviewArr[i].data.title)
                    
                    wrapdata.push(articlePreviewArr[i])
                    if(wrapdata.length>1){
                        parseList(wrapdata,function(length,code){
                            var paper=Paper(wrapdata,length,code)
                            papers.add(paper)
                            wrapdata=[]
                        })
                    }
                }
                for(var i in articlePreviewArr){
                    articlePreviewArr[i].resize()
                }
                papers.update();
                shadow.css({display:"block"})
            }
        }
        function Shadow(){
            var self=$("div",{id:"shadow"})
            var polygon=SVG("polygon",{fill:"#cccccc"})
            var offsetX=428
            var offsetY=440
            var perspective=1400
            self.append(
                SVG("svg").append(
                    SVG("defs").append(
                        SVG("filter",{id:"Gaussian_Blur"}).append(
                            SVG("feGaussianBlur",{in:"SourceGraphic",stdDeviation:"8"})
                        )
                    ),
                    polygon
                )
            )
            polygon.set({filter:"url(#Gaussian_Blur)"})
            self.update=function(arr){
                var str=""
                for(var i in arr){
                    str+=Math.round(arr[i][0]*perspective/(perspective+arr[i][2])+offsetX)+","+Math.round(-arr[i][1]/3+offsetY)+" "
                }
                polygon.set({points:str})
            }
            return self
        }
        function Papers(){
            var self=$("div",{id:"papers"})
            var region=2;
            var seg=200
            var size=300;
            var step=region/seg
            var space1=size/region;
            var pos=-0.26;
            window.onmousewheel=function(e){
                self.update(-e.wheelDelta)
            }
            self.init=function(){
                self.clear();
                self.add($("div",{cls:"paper cover"}))
                pos=-0.26;
            }
            self.add=function(child){
                self.append(child)
                if(self.child().length%2){
                    child.addClass("front")
                }else{
                    child.shadow=$("div",{cls:"shadow"})
                    child.append(child.shadow)
                    child.addClass("back")
                }
            }
            self.update=function(s){
                var pos_step=s!=null?s/5000:0
                pos+=pos_step
                if(pos>-0.2 && pos<0){pos=-0.2; return};
                var paperArr=[]
                var pointGroup=[]
                var shadowPoint=new Array(Math.ceil(papers.child().length/2)*2+1)
                var isLeft=true
                for(var x=pos;x<region;x+=step){
                    var y=Math.pow(x,2)*2
                    var X=Math.round(x*space1)
                    var Y=Math.round(y*space1)
                    if(paperArr.length==0 || (Math.pow(paperArr[paperArr.length-1][0]-X,2)+Math.pow(paperArr[paperArr.length-1][1]-Y,2))>4900 ){
                        paperArr.push([X,Y])
                        if(paperArr.length>=self.child().length/2+1){
                            if(x<0.3){pos-=pos_step; return;}
                            break;
                        }
                    }
                }
                for(var i=0;i<paperArr.length-1;i++){

                    if(2*i+1>self.child().length) break;
                    var x1=paperArr[i][0];
                    var y1=paperArr[i][1];
                    var x2=paperArr[i+1][0];
                    var y2=paperArr[i+1][1];
                    var d=self.width()
                    var x,y

                    if(y2==y1){
                        x=(x1+x2)/2
                        y=-Math.sqrt(Math.pow(d,2)-Math.pow(x-x,2))
                    }
                    else{
                        var x0=(x1+x2)/2
                        var y0=(y1+y2)/2
                        var r=-(y2-y1)/(x2-x1)
                        var r2=r*r
                        var M=x0-r*y0+r*y1
                        var A=(r2+1)/r2
                        var B=2*M/r2+2*x1
                        var C=M*M/r2-d*d+x1*x1

                        if(y2<y1){
                            x=(B-Math.sqrt(B*B-4*A*C))/2/A
                        }else{
                            x=(B+Math.sqrt(B*B-4*A*C))/2/A
                        }
                        y=x/r-x0/r+y0
                    }
                    pointGroup.push([x,y])

                    var paper1=self.child(2*i)
                    var paper2=self.child(2*i+1)
                    
                    var angle1=Math.atan((y-y1)/(x-x1))
                    var angle2=Math.atan((y-y2)/(x-x2))
                    if(angle1>0.16){
                        paper1.addClass("hide")
                    }else{
                        paper1.removeClass("hide")
                        paper1.css({"-webkit-transform":"translateX("+((x+x1)/2)+"px) translateZ("+(-(y+y1)/2)+"px) rotateY("+angle1+"rad)"})
                    }
                    
                    if(paper2){
                        if(angle2<-0.16){
                            paper2.addClass("hide")
                        }else{
                            paper2.removeClass("hide")
                            paper2.css({"-webkit-transform":"translateX("+((x+x2)/2)+"px) translateZ("+(-(y+y2)/2)+"px) rotateY("+angle2+"rad)"})
                            paper2.shadow.css({opacity:Math.abs(angle2)*0.3});
                        }
                    }
                }
                for(var i=0;i<pointGroup.length;i++){
                    var p1=paperArr[i]
                    var p2=paperArr[i+1]
                    var c0=i>0?pointGroup[i-1]:null
                    var c1=pointGroup[i]
                    var c2=(i<pointGroup.length-1)?pointGroup[i+1]:null
                    var dotX=0,dotY=0;

                    if(c0==null){
                        dotX=Math.min(c1[0],p1[0])
                        dotY=1160
                        shadowPoint[2*i]=[dotX,dotY,c1[1]]
                    }else if(c2==null){
                        dotX=Math.max(c1[0],p2[0])
                        dotY=1160
                        shadowPoint[2*i+1]=[c1[0],c1[1],c1[1]]
                        shadowPoint[2*(i+1)]=[dotX,dotY,c1[1]]

                        if(isLeft){
                            shadowPoint[2*i]=[p1[0],p1[1],c1[1]]
                            isLeft=false
                        }
                    }else if(isMiddle(c1,c0,p1)){
                        var x1=c0[0]
                        var y1=c0[1]
                        var x2=p1[0]
                        var y2=p1[1]
                        var d=(y1-y2)/(x1-x2)
                        dotX=c1[0]
                        dotY=d*dotX+y1-d*x1

                        shadowPoint[2*i]=[dotX,dotY,c1[1]]
                    }else if(isMiddle(c1,c2,p2)){
                        var x1=c2[0]
                        var y1=c2[1]
                        var x2=p2[0]
                        var y2=p2[1]
                        var d=(y1-y2)/(x1-x2)
                        dotX=c1[0]
                        dotY=d*dotX+y1-d*x1
                        if(isLeft){
                            shadowPoint[2*i]=[p1[0],p1[1],c1[1]]
                            isLeft=false
                        }
                        shadowPoint[2*(i+1)]=[dotX,dotY,c1[1]]
                    }else if(isMiddle(c1,p1,p2)){
                        dotX=Math.max(c1[0],p2[0])
                        dotY=p1[0]
                        shadowPoint[2*i]=[p1[0],p1[1],c1[1]]
                        shadowPoint[2*(i+1)]=[p2[0],p2[1],c1[1]]
                    }
                    function isMiddle(p0,p1,p2){
                        if(p1[0]>p2[0] && p1[0]>p0[0] && p2[0]<p0[0]){
                            return true
                        }else if(p1[0]<p2[0] && p1[0]<p0[0] && p2[0]>p0[0]){
                            return true
                        }
                        return false
                    }
                    shadowPoint[2*i+1]=[c1[0],c1[1],c1[1]]
                }
                shadow.update(shadowPoint)
            }
            return self
        }
        function Paper(data,length,code){
            var self=$("div",{cls:"paper tmp"+code+" len"+length})

            for(var i in data){
                data[i].addClass("sty"+data[i].data.type[1]+" pos"+(parseInt(i)+1))
                self.append(data[i])
            }
            return self
        }
        //--------------------------------------------------------------------------
        function ArticlePreview(data){
            var self=$("div",{cls:"cell"})
            self.data={imgW:0,imgH:0,title:data.title}
            self.resize=function(){
            }
            feedView.setWrap();
            return self
        }
        function parseArticle(width,height,title,text){
            return [1,1]
        }
        function parseList(data,callback){
            callback(1,1)
        }
        //--------------------------------------------------------------------------
        return self
    }
}




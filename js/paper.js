debug({W:300,H:300});
window.onload=main;
function SVG(tag,attr){
    var self={};
    self=document.createElementNS('http://www.w3.org/2000/svg',tag)
    self.set=function(attr){
        for(var i in attr||{}){
            self.setAttribute(i,attr[i]);
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
        var shadow=Shadow()
        var papers=Papers()
        var btnPrev=$("div",{id:"btnPrev",text:"prev"})
        var btnNext=$("div",{id:"btnNext",text:"next"})
        self.append(shadow,papers,btnPrev,btnNext)
        //--------------------------------------------------------------------------------------
        window.onmousewheel=function(e){
            papers.update(-e.wheelDelta/120*5)
        }
        btnPrev.onclick=function(){
            var endPos=papers.pos-papers.pos%papers.step+papers.step;
            function update(){
                var timeout=setTimeout(function(){
                    papers.update(5)
                    if(papers.pos<endPos){
                        update()
                    }
                },50)
            }
            update()
        }
        btnNext.onclick=function(){
            var endPos=papers.pos+(papers.pos%papers.step==0?0:(-papers.step-papers.pos%papers.step))-papers.step;
            function update(){
                var timeout=setTimeout(function(){
                    papers.update(-5)
                    if(papers.pos>endPos){
                        update()
                    }
                },50)
            }
            update()
        }
        //--------------------------------------------------------------------------------------
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
                            SVG("feGaussianBlur",{in:"SourceGraphic",stdDeviation:"5"})
                        )
                    ),
                    polygon
                )
            )
            // polygon.set({filter:"url(#Gaussian_Blur)"})
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
            var step=50
            var angle=45
            var posZ=0
            var L,D,H
            self.step
            self.pos
            
            window.onkeyup=function(e){
                switch(e.keyCode){
                    case 27://Left
                        if(angle<90){
                            angle+=3;
                            step+=3
                            self.update()
                        }
                        break;
                    case 37://Right
                        if(angle>3){
                            angle-=3
                            step-=3
                            self.update()
                        }
                        break;
                    case 38://UP
                        function update1(){
                            if(angle<81){
                                var timeout=setTimeout(function(){
                                    angle+=3
                                    step+=3
                                    posZ+=30
                                    self.update()
                                    update1()
                                },50)
                            }
                        }
                        update1()
                        break;
                    case 40://DOWN
                        function update2(){
                            if(angle>0){
                                var timeout=setTimeout(function(){
                                    angle-=3
                                    step-=3
                                    self.update()
                                    update2()
                                },50)
                            }
                        }
                        update2()
                        break;
                }
            }
            self.init=function(){
                self.clear();
                self.add(Paper())
            }
            self.add=function(child){
                self.append(child)
                if(self.child().length%2){
                    child.addClass("front")
                }else{
                    child.addClass("back")
                }
            }
            self.update=function(s){
                var angle_rad=angle*3.14/180
                var angle_tan=Math.tan(angle_rad)
                var angle_cos=Math.cos(angle_rad)
                var angle_sin=Math.sin(angle_rad)

                self.step=step*angle_cos

                if(s==null){
                    self.pos=-self.step
                    D=step/2
                    L=self.width()
                    H=Math.sqrt(L*L-D*D)
                }
               
                self.pos+=s!=null?s:0

                var paperArr=[]
                var pointGroup=[]
                var shadowPoint=new Array(Math.ceil(self.child().length/2)*2+1)
                var isLeft=true

                var H1=H*angle_sin
                var H2=H/angle_cos

                var X=self.pos
                while(paperArr.length<self.child().length/2+1){
                    Y=angle_tan*Math.abs(X)
                    paperArr.push([X,Y])
                    X+=self.step
                }

                for(var i=0;i<paperArr.length-1;i++){

                    if(2*i+1>self.child().length) break;
                    var x1=paperArr[i][0];
                    var y1=paperArr[i][1];
                    var x2=paperArr[i+1][0];
                    var y2=paperArr[i+1][1];
                    var x0=(x1+x2)/2
                    var y0=(y1+y2)/2
                    var x,y

                    if(x1<0 && x2<0){
                        x=x0-H1
                        y=angle_tan*Math.abs(x)-H2
                    }else if(x1>0 && x2>0){
                        x=x0+H1
                        y=angle_tan*Math.abs(x)-H2
                    }else if(y2==y1){
                        x=0
                        y=-(H-self.step)
                    }else{
                        var r=-(y2-y1)/(x2-x1)
                        var r2=r*r
                        var M=x0-r*y0+r*y1
                        var A=(r2+1)/r2
                        var B=2*M/r2+2*x1
                        var C=M*M/r2-L*L+x1*x1

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
                    
                    if(paper1){
                        var angle1=Math.atan((y-y1)/(x-x1))
                        if(angle1>0.16){
                            paper1.addClass("hide")
                        }else{
                            paper1.removeClass("hide")
                            paper1.css({"-webkit-transform":"translateX("+((x+x1)/2)+"px) translateZ("+(-(y+y1)/2+posZ)+"px) rotateY("+angle1+"rad)"})
                            paper1.shadow.css({opacity:Math.abs(angle1)*0.3});
                        }
                    }
                    
                    if(paper2){
                        var angle2=Math.atan((y-y2)/(x-x2))
                        if(angle2<-0.16){
                            paper2.addClass("hide")
                        }else{
                            paper2.removeClass("hide")
                            paper2.css({"-webkit-transform":"translateX("+((x+x2)/2)+"px) translateZ("+(-(y+y2)/2+posZ)+"px) rotateY("+angle2+"rad)"})
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
            self.shadow=$("div",{cls:"shadow"})
            self.append(self.shadow)
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




debug(1,{W:300,H:300});
window.onload=main;

function main(){
    var body=$("body")
    var info=$("span")
    var feedView=FeedView()
    body.append(feedView,info)
    feedView.setData({items:[1,1,1,1,1,1,1,1,1]})
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
        btnPrev.onclick=papers.pageUp
        btnNext.onclick=papers.pageDown
        btnPrev.hide()
        btnNext.hide()
        self.setData=function(d){
            data=d
            papers.init();
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
                    if(wrapdata.length>0){
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
                papers.update(null,90);
            }
        }
        function Shadow(){
            var self=$("div",{id:"shadow"})
            var polygon=SVG("polygon",{fill:"#cccccc"})
            var offsetX=570
            var offsetY=250
            var perspective=2000
            self.append(
                SVG("svg").append(
                    SVG("defs").append(
                        SVG("filter",{id:"Gaussian_Blur"}).append(
                            SVG("feGaussianBlur",{in:"SourceGraphic",stdDeviation:"6"})
                        )
                    ),
                    polygon
                )
            )
            // polygon.set({filter:"url(#Gaussian_Blur)"})
            self.update=function(arr){
                var str=""
                for(var i in arr){
                    str+=Math.round(arr[i][0]*perspective/(perspective+arr[i][2])+offsetX)+","+Math.round(-arr[i][1]/4+offsetY)+" "
                }
                polygon.set({points:str})
            }
            return self
        }
        function Papers(){
            var self=$("div",{id:"papers"})
            var step=3
            var angle=3
            var Angle=90
            var transformZ=-150,transformX=-144;
            var L,D,H
            var stepX,pos
            var animating=false
            var mousewheelHandle
            var mousewheel=false
            window.onmousewheel=function(e){
                if(animating || angle==3 || angle==81)return;
                window.clearTimeout(mousewheelHandle)
                if(pos-e.wheelDelta/120*2>-stepX || (pos+stepX*Math.floor(self.child().length/2)<0 && -e.wheelDelta<0)){
                    self.fold();
                }else{
                    self.update(-e.wheelDelta/120*2)
                }
                mousewheelHandle=setTimeout(function(){
                    (e.wheelDelta>0)?(self.pageDown()):(self.pageUp())
                },300)
            }
            self.pageDown=function(){
                if(animating || angle==3)return;
                var endPos=pos-(pos%stepX==0?stepX:stepX+pos%stepX);
                function update(){
                    var timeout=setTimeout(function(){
                        self.update(endPos-pos<-5?-5:endPos-pos)
                        if(pos>endPos){
                            update()
                        }else{
                            animating=false
                        }
                    },50)
                }
                if(pos+stepX*Math.floor(self.child().length/2)<=0){
                    self.fold()
                }else{
                    animating=true
                    update()
                }
            }
            self.pageUp=function(){
                if(animating || angle==3)return;
                var endPos=pos+(pos%stepX==0?stepX:-pos%stepX);
                function update(){
                    var timeout=setTimeout(function(){
                        self.update(endPos-pos>5?5:endPos-pos)
                        if(pos<endPos){
                            update()
                        }else{
                            animating=false
                        }
                    },50)
                }
                if(endPos>-stepX){
                    self.fold()
                }else{
                    animating=true
                    update()
                }
            }
            self.fold=function(){
                if(animating)return;
                animating=true
                function update(){
                    if(angle>3){
                        var timeout=setTimeout(function(){
                            angle-=3
                            step-=3
                            transformZ-=10
                            self.update()
                            update()
                        },50)
                    }else if(Angle<90){
                        var timeout=setTimeout(function(){
                            Angle+=5
                            transformX-=8
                            self.update(0,Angle)
                            update()
                        },50)
                    }else{
                        animating=false
                        btnPrev.hide()
                        btnNext.hide()
                    }
                }
                update()
            }
            self.unfold=function(){
                if(animating)return;
                animating=true
                function update(){
                    if(Angle>0){
                        var timeout=setTimeout(function(){
                            Angle-=5
                            transformX+=8
                            self.update(0,Angle)
                            update()
                        },50)
                    }else if(angle<45){
                        var timeout=setTimeout(function(){
                            angle+=3
                            step+=3
                            transformZ+=10
                            self.update()
                            update()
                        },50)
                    }else{
                        animating=false
                        btnPrev.show()
                        btnNext.show()
                    }
                }
                update()
            }
            self.open=function(){
                if(animating)return;
                function flat(){
                    if(angle<81){
                        var timeout=setTimeout(function(){
                            angle+=3
                            step+=3
                            transformZ+=30
                            self.update()
                            flat()
                        },50)
                    }else{
                        animating=false
                    }
                }
                function unflat(){
                    if(angle>45){
                        var timeout=setTimeout(function(){
                            angle-=3
                            step-=3
                            transformZ-=30
                            self.update()
                            unflat()
                        },50)
                    }else{
                        animating=false
                    }
                }
                if(angle==81){
                    animating=true
                    unflat()
                }else if(angle==45){
                    animating=true
                    flat()
                }else{
                    self.unfold()
                }
            }
            self.init=function(){
                self.clear();
                self.add(Paper())
            }
            self.add=function(child){
                self.append(
                    child.addClass(
                        self.child().length%2?"back":"front"
                    )
                )
            }
            self.update=function(s,Angle){
                var angle_rad=angle*3.14/180
                var angle_tan=Math.tan(angle_rad)
                var angle_cos=Math.cos(angle_rad)
                var angle_sin=Math.sin(angle_rad)

                stepX=step*angle_cos

                if(s==null){
                    pos=-stepX
                    D=step/2
                    L=self.width()
                    H=Math.sqrt(L*L-D*D)
                }

                pos+=s!=null?s:0

                var paperArr=[]
                var pointGroup=[]

                var H1=H*angle_sin
                var H2=H/angle_cos

                var X=pos
                while(paperArr.length<self.child().length/2+1){
                    if(Angle){
                        var l=X/angle_cos
                        var a=Angle*3.14/180
                        if(X<0){
                            var angle_a_sin=angle_sin*Math.cos(a)-angle_cos*Math.sin(a)
                            var angle_a_cos=angle_cos*Math.cos(a)+angle_sin*Math.sin(a)
                            X=-l*angle_a_cos
                            Y=l*angle_a_sin
                        }else{
                            var angle_a_sin=angle_sin*Math.cos(a)-angle_cos*Math.sin(a)
                            var angle_a_cos=angle_cos*Math.cos(a)+angle_sin*Math.sin(a)
                            X=l*angle_a_cos
                            Y=-l*angle_a_sin
                        }
                    }else{
                        Y=angle_tan*Math.abs(X)
                    }
                    paperArr.push([X+transformX,Y])
                    X+=stepX
                }

                var points=[]
                var shadowPoints=[]

                for(var i=0;i<paperArr.length-1;i++){

                    points.push(paperArr[i])

                    var x1=paperArr[i][0];
                    var y1=paperArr[i][1];
                    var x2=paperArr[i+1][0];
                    var y2=paperArr[i+1][1];
                    var x0=(x1+x2)/2
                    var y0=(y1+y2)/2
                    var x,y

                    // if(x1<0 && x2<0){
                    //     x=x0-H1
                    //     y=angle_tan*Math.abs(x)-H2
                    // }else if(x1>0 && x2>0){
                    //     x=x0+H1
                    //     y=angle_tan*Math.abs(x)-H2
                    // }else 
                    if(y2==y1){
                        x=0
                        y=-(H-stepX)
                    }else{
                        var r=-(y2-y1)/(x2-x1)
                        var r2=r*r
                        var M=x0-r*y0+r*y1
                        var A=(r2+1)/r2
                        var B=2*M/r2+2*x1
                        var C=M*M/r2-L*L+x1*x1
                        x=(B+(y1>y2?-1:1) * Math.sqrt(B*B-4*A*C))/2/A
                        y=x/r-x0/r+y0
                    }
                    points.push([x,y])

                    var paper1=self.child(2*i)
                    var paper2=self.child(2*i+1)

                    if(paper1){
                        var angle1=Math.atan((y-y1)/(x-x1))
                        if(angle1>0.16){
                            paper1.hide()
                        }else{
                            paper1.show()
                            paper1.css({"-webkit-transform":"translateX("+((x+x1)/2)+"px) translateZ("+(-(y+y1)/2+transformZ)+"px) rotateY("+angle1+"rad)"})
                            paper1.shadow.css({opacity:Math.abs(angle1)*0.3});
                        }
                    }
                    
                    if(paper2){
                        var angle2=Math.atan((y-y2)/(x-x2))
                        if(angle2<-0.16){
                            paper2.hide()
                        }else{
                            paper2.show()
                            paper2.css({"-webkit-transform":"translateX("+((x+x2)/2)+"px) translateZ("+(-(y+y2)/2+transformZ)+"px) rotateY("+angle2+"rad)"})
                            paper2.shadow.css({opacity:Math.abs(angle2)*0.3});
                        }
                    }   
                }

                for(var i=0;i<points.length-2;i++){
                    var p1=points[i]
                    var p2=points[i+1]
                    var p3=points[i+2]
                    if(p3[0]>p1[0] && p1[0]>p2[0] && p2[0]>0){
                        p=cast(p1,p2,p3)
                        addPoint(p1)
                        addPoint(p,p1[1])
                    }else if(p2[0]>p3[0] && p3[0]>p1[0] && p2[0]<0){
                        p=cast(p3,p2,p1)
                        addPoint(p,p3[1])
                        addPoint(p3)
                    }else if(p3[0]>p2[0] && p2[0]>p1[0]){
                        if(i==0)shadowPoints.push(p1);
                        addPoint(p2)
                        if(i==points.length-3)addPoint(p3);
                    }else if(i==0 && p2[0]>p3[0] && p3[0]>p1[0]){
                        addPoint(p1)
                    }else if(i==points.length-3 && p3[0]>p1[0] && p1[0]>p2[0]){
                        addPoint(p3)
                    }else if(i==0 && p3[0]>p1[0] && p1[0]>p2[0]){
                        addPoint(p2)
                    }else if(i==points.length-3 && p2[0]>p3[0] && p3[0]>p1[0]){
                        addPoint(p2)
                    }
                }
                function cast(p1,p2,p3){
                    var d=(p2[1]-p3[1])/(p2[0]-p3[0])
                    return [p1[0],d*p1[0]+p2[1]-d*p2[0]]
                }
                function addPoint(point,z){
                    shadowPoints.push([point[0],point[1],z?z:point[1]])
                }

                for(var i=0;i<shadowPoints.length;i++){
                    shadowPoints[i][1]=700-shadowPoints[i][1]
                }
                var shadowPoints1=shadowPoints
                for(var i=shadowPoints.length-1;i>=0;i--){
                    shadowPoints1.push([shadowPoints[i][0],-shadowPoints[i][1],shadowPoints[i][2]])
                }
                shadow.update(shadowPoints1)
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
            self.onclick=function(){
                self.parent().open()
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
            return [2,1]
        }
        function parseList(data,callback){
            callback(1,1)
        }
        //--------------------------------------------------------------------------
        return self
    }
}
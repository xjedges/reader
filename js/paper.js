debug(1,{W:300,H:300});
window.onload=main;

function main(){
    var body=$("body")
    var info=$("span")
    var feedView=FeedView()
    body.append(feedView,info)
    feedView.setData({items:[1,1,1,1,1,1,1,1,1,1]})
    function FeedView(){
        var self=$("div",{cls:"feedView"})
        var articlePreviewArr=[]
        var wrapdata=[]
        var wrapCount=0
        var data;
        var shadow=Shadow()
        var papers=Papers()
        var controller=Controller()
        var tags=Tags()
        self.append(shadow,papers)
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
        function Controller(){
            var self={}
            var x0,x1,xt,xt1
            var mouseMove=false
            var mouseDown=false
            papers.onmousedown=function(e){
                mouseMove=false
                mouseDown=true
                xt=x0=e.clientX
            }
            papers.onmouseup=function(e){
                mouseDown=false
                if(!mouseMove){
                    papers.open()
                }else{
                    x1=e.clientX
                    if(x0>x1){
                        papers.pageDown()
                    }else{papers.pageUp()}
                }
            };
            papers.onmousemove=function(e){
                mouseMove=true
                if(mouseDown){
                    var xt1=e.clientX
                    papers.slide((xt1-xt)/20)
                    xt=xt1
                }
            }
            papers.onmousewheel=function(e){
                papers.slide(e.wheelDelta/120*2)
            }
            return self
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
            var step=3,pos
            var L,D,H
            var animating=false
            var slideHandle
            var angle={
                val:3,rad:0,sin:0,cos:0,
                update:function(offset){
                    this.val+=offset
                    this.rad=this.val*3.14/180
                    this.tan=Math.tan(this.rad)
                    this.cos=Math.cos(this.rad)
                    this.sin=Math.sin(this.rad)
                },
                isFlat:function(){
                    if(this.val==84)return true;
                },
                isFold:function(){
                    if(this.val==3)return true;
                },
                isOpen:function(){
                    if(this.val==45)return true;
                }
            }
            var Angle={
                val:90,rad:0,sin:0,cos:0,
                update:function(offset){
                    this.val+=offset
                    this.rad=this.val*3.14/180
                    this.tan=Math.tan(this.rad)
                    this.cos=Math.cos(this.rad)
                    this.sin=Math.sin(this.rad)
                },
            }
            var transform={
                x:-144,z:150
            }
            self.slide=function(gain){
                if(animating || angle.val==3 || angle.val==84)return;
                window.clearTimeout(slideHandle)
                if(pos+gain>-step || (pos+step*Math.floor(self.child().length/2)<0 && gain<0)){
                    self.fold();
                }else{
                    self.update(gain)
                }
                slideHandle=setTimeout(function(){
                    (gain<0)?(self.pageDown()):(self.pageUp())
                },100)
            }
            self.pageDown=function(){
                if(animating || angle.val==3)return;
                var endPos=pos-(pos%step==0?step:step+pos%step);
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
                if(pos+step*Math.floor(self.child().length/2)<=0){
                    self.fold()
                }else{
                    animating=true
                    update()
                }
            }
            self.pageUp=function(){
                if(animating || angle.val==3)return;
                var endPos=pos+(pos%step==0?step:-pos%step);
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
                if(endPos>-step){
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
                    if(pos<-step){
                        var timeout=setTimeout(function(){
                            self.update(step/4)
                            update()
                        },50)
                    }else if(angle.val>3){
                        var timeout=setTimeout(function(){
                            angle.update(-3)
                            step-=3
                            transform.z+=10
                            self.update()
                            update()
                        },50)
                    }else if(Angle.val<90){
                        var timeout=setTimeout(function(){
                            Angle.update(5)
                            transform.x-=8
                            self.update(0)
                            update()
                        },50)
                    }else{
                        animating=false
                    }
                }
                update()
            }
            self.unfold=function(){
                if(animating)return;
                animating=true
                function update(){
                    if(Angle.val>0){
                        var timeout=setTimeout(function(){
                            Angle.update(-5)
                            transform.x+=8
                            self.update(0)
                            update()
                        },50)
                    }else if(angle.val<45){
                        var timeout=setTimeout(function(){
                            angle.update(3)
                            step+=3
                            transform.z-=10
                            self.update()
                            update()
                        },50)
                    }else{
                        animating=false
                    }
                }
                update()
            }
            self.open=function(){
                if(animating)return;
                function flat(){
                    if(angle.val<84){
                        var timeout=setTimeout(function(){
                            angle.update(3)
                            transform.z-=30
                            self.update(0)
                            flat()
                        },50)
                    }else{
                        animating=false
                    }
                }
                function unflat(){
                    if(angle.val>45){
                        var timeout=setTimeout(function(){
                            angle.update(-3)
                            transform.z+=30
                            self.update(0)
                            unflat()
                        },50)
                    }else{
                        animating=false
                    }
                }
                if(angle.val==84){
                    animating=true
                    unflat()
                }else if(angle.val==45){
                    animating=true
                    flat()
                }else{
                    self.unfold()
                }
            }
            self.init=function(){
                self.clear();
                self.add(Paper())
                angle.update(0)
                Angle.update(0)
                D=step/2
                L=self.width()
                H=Math.sqrt(L*L-D*D)
            }
            self.add=function(child){
                self.append(
                    child.addClass(
                        self.child().length%2?"back":"front"
                    )
                )
            }
            self.update=function(offset){
                

                var stepX=step*angle.cos

                if(offset==null){
                    pos=-step
                }else{
                    pos+=offset
                }

                var paperArr=[]
                var pointGroup=[]

                var X=pos*angle.cos
                while(paperArr.length<self.child().length/2+1){
                    if(Angle.val==0){
                        Y=angle.tan*Math.abs(X)
                    }else{
                        var l=X/angle.cos
                        if(X<0){
                            var angle_a_sin=angle.sin*Angle.cos-angle.cos*Angle.sin
                            var angle_a_cos=angle.cos*Angle.cos+angle.sin*Angle.sin
                            X=-l*angle_a_cos
                            Y=l*angle_a_sin
                        }else{
                            var angle_a_sin=angle.sin*Angle.cos-angle.cos*Angle.sin
                            var angle_a_cos=angle.cos*Angle.cos+angle.sin*Angle.sin
                            X=l*angle_a_cos
                            Y=-l*angle_a_sin
                        }
                    }
                    paperArr.push([X+transform.x,Y+transform.z])
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

                    // var H1=H*angle.sin
                    // var H2=H/angle.cos
                    // if(Angle.val==0 && x1<0 && x2<0){
                    //     x=x0-H1
                    //     y=angle.tan*Math.abs(x)-H2
                    // }else if(Angle.val==0  && x1>0 && x2>0){
                    //     x=x0+H1
                    //     y=angle.tan*Math.abs(x)-H2
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
                            paper1.css({"-webkit-transform":"translateX("+((x+x1)/2)+"px) translateZ("+(-(y+y1)/2)+"px) rotateY("+angle1+"rad)"})
                            paper1.shadow.css({opacity:Math.abs(angle1)*0.3});
                        }
                    }
                    
                    if(paper2){
                        var angle2=Math.atan((y-y2)/(x-x2))
                        if(angle2<-0.16){
                            paper2.hide()
                        }else{
                            paper2.show()
                            paper2.css({"-webkit-transform":"translateX("+((x+x2)/2)+"px) translateZ("+(-(y+y2)/2)+"px) rotateY("+angle2+"rad)"})
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
            // if(Math.random()>0.5){
            //     var tag=tags.addTag("XXX")
            //     self.append(tag)
            // }
            self.append(self.shadow)
            for(var i in data){
                data[i].addClass("sty"+data[i].data.type[1]+" pos"+(parseInt(i)+1))
                self.append(data[i])
            }
            return self
        }
        function Tags(){
            var self={}
            var theme=["#2D2B2A","#561812","#FFFFFF","#333B3A","#B4BD51","#543B38","#61594D","#B8925A"]
            var titles=["Hublot","Hublot Watches","Big Bang","Watches","Swiss Watch","Hublot Genève","Aerobang","Watchmaker","All Black","Black Magic"]
            var topOffset=0
            self.addTag=function(){
                var color=theme[ Math.random()*theme.length>>0 ];
                var title=titles[ Math.random()*titles.length>>0 ]
                var tag=$("div",{cls:"tag",text:title})
                var h=title.length*10
                var w=30
                var t=topOffset
                topOffset=t+h
                l=w
                tag.css({background:color,width:w,height:h,top:t,marginLeft:-l,marginRight:-l})
                return tag
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
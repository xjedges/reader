function Book(){
    var self=$("div",{id:"papers"})
    var step=3,pos
    var L,D,H
    var animating=false
    var slideHandle
    var index=0
    var angle={
        val:3,rad:0,sin:0,cos:0,
        update:function(offset){
            this.val+=offset
            this.rad=this.val*3.14/180
            this.tan=Math.tan(this.rad)
            this.cos=Math.cos(this.rad)
            this.sin=Math.sin(this.rad)
        },
    }
    var Angle={
        val:75,rad:0,sin:0,cos:0,
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
            }else if(Angle.val<75){
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

        for(var i=0;i<paperArr.length;i++){

            points.push(paperArr[i])

            if(i==paperArr.length-1)break;
            var x1=paperArr[i][0];
            var y1=paperArr[i][1];
            var x2=paperArr[i+1][0];
            var y2=paperArr[i+1][1];
            var x0=(x1+x2)/2
            var y0=(y1+y2)/2
            var x,y

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
            // var line1=track.child(2*i)
            // var line2=track.child(2*i+1)

            if(paper1){
                var angle1=Math.atan((y-y1)/(x-x1))
                if(angle1>0.16){
                    paper1.hide()
                }else{
                    paper1.show()
                    paper1.css({"-webkit-transform":"translateX("+((x+x1)/2)+"px) translateZ("+(-(y+y1)/2)+"px) rotateY("+angle1+"rad)"})
                    paper1.shadow.css({opacity:Math.abs(angle1*(y+y1+200)/400)});
                    
                }
                // line1.css({top:-(y+y1)/2,left:(x+x1)/2,"-webkit-transform":"rotate("+(3.14/2-angle1)+"rad)"})
            }
            
            if(paper2){
                var angle2=Math.atan((y-y2)/(x-x2))
                if(angle2<-0.16){
                    paper2.hide()
                }else{
                    paper2.show()
                    paper2.css({"-webkit-transform":"translateX("+((x+x2)/2)+"px) translateZ("+(-(y+y2)/2)+"px) rotateY("+angle2+"rad)"})
                    paper2.shadow.css({opacity:Math.abs(angle2*(y+y2+200)/400)});
                }
                // line2.css({top:-(y+y2)/2,left:(x+x2)/2,"-webkit-transform":"rotate("+(3.14/2-angle2)+"rad)"});
            }
        }

        var perspective=1200
        var height=-self.height()/2*1.05
        for(var i in points){
            var perspectiveNum=perspective/(perspective+points[i][1])
            points[i][0]=points[i][0]*perspectiveNum
            points[i][1]=height*perspectiveNum
        }

        for(var i=0;i<points.length-2;i++){
            var p1=points[i]
            var p2=points[i+1]
            var p3=points[i+2]

            if(p3[0]>p1[0] && p1[0]>p2[0]){
                if(p1[1]<p3[1]){
                    var p=cast(p1,p2,p3)
                    addPoint(p,false)
                    addPoint(p3,true)
                }else if(i==points.length-3){
                    addPoint(p2,true)
                    addPoint(p3,true)
                }
            }else if(p2[0]>p3[0] && p3[0]>p1[0]){
                if(p1[1]>p3[1]){
                    var p=cast(p3,p2,p1)
                    addPoint(p1,true)
                    addPoint(p,false)
                }else if(i==0){
                    addPoint(p1,true)
                    addPoint(p2,true)
                }
            }else if(p3[0]>p2[0] && p2[0]>p1[0]){
                addPoint(p1,true);
                addPoint(p2,false)
                addPoint(p3,true);
            }
        }
        function cast(p1,p2,p3){
            var d=(p2[1]-p3[1])/(p2[0]-p3[0])
            return [p1[0],d*p1[0]+p2[1]-d*p2[0]]
        }
        function addPoint(point,value){
            shadowPoints.push([point[0],point[1],value])
        }

        var offsetX=perspective/(perspective+transform.z/2)*20
        var offsetY=-offsetX

        for(var i=shadowPoints.length-1;i>=0;i--){
            shadowPoints.push([shadowPoints[i][0],-shadowPoints[i][1],shadowPoints[i][2]])
        }

        for(var i=0;i<shadowPoints.length;i++){
            shadowPoints[i][0]+=offsetX
            shadowPoints[i][1]+=offsetY
        }

        // shadowDot.update(shadowPoints.length)       
        // for(var i=0;i<shadowPoints.length;i++){
        //     shadowDot.child(i).css({top:-shadowPoints[i][1],left:shadowPoints[i][0]})
        //     shadowDot.child(i).html("("+Math.round(shadowPoints[i][0])+","+Math.round(shadowPoints[i][1])+")")
        // }
        

        shadow.update(shadowPoints)
    }

    return self
}
function Shadow(){
    var self=$("div",{id:"shadow"})
    var path=SVG("path",{fill:"#cccccc"})
    var offsetX=555
    var offsetY=305
    var radiusBorder=8
    self.append(
        SVG("svg").append(
            SVG("defs").append(
                SVG("filter",{id:"Gaussian_Blur"}).append(
                    SVG("feGaussianBlur",{in:"SourceGraphic",stdDeviation:"6"})
                )
            ),
            path
        )
    )
    self.update=function(arr){
        var str=""
        for(var i=0;i<arr.length;i++){
            if(arr[i][2]){
                var p0=arr[i==0?arr.length-1:(i-1)]
                var p1=arr[i]
                var p2=arr[(i==arr.length-1)?0:(i+1)]

                var off1,off2

                if(p0[0]==p1[0]){
                    if(p0[1]<p1[1]){
                        off1=[0,-1]
                        off2=[1,0]
                    }else{
                        off1=[0,1]
                        off2=[-1,0]
                    }
                }else{
                    if(p2[1]<p1[1]){
                        off1=[-1,0]
                        off2=[0,1]
                    }else{
                        off1=[1,0]
                        off2=[0,-1]
                    }
                }
                var p01=[arr[i][0]-off1[0]*radiusBorder,arr[i][1]+off1[1]*radiusBorder]
                var p12=[arr[i][0]-off2[0]*radiusBorder,arr[i][1]-off2[1]*radiusBorder]

                str+=
                    (i==0?"M":"L")+Math.round(p01[0]+offsetX)+","+Math.round(-p01[1]+offsetY)+" "+
                    "C"+Math.round(p01[0]+offsetX)+","+Math.round(-p01[1]+offsetY)+" "+
                    Math.round(p1[0]+offsetX)+" "+Math.round(-p1[1]+offsetY)+" "+
                    Math.round(p12[0]+offsetX)+","+Math.round(-p12[1]+offsetY)+" "+
                    "L"+Math.round(p12[0]+offsetX)+","+Math.round(-p12[1]+offsetY)+" "
            }else{
                str+=(i==0?"M":"L")+Math.round(arr[i][0]+offsetX)+","+Math.round(-arr[i][1]+offsetY)+" "
            }
        }

        str+="Z"
        path.set({d:str})
    }
    return self
}

function Track(){
    var self=$("div",{id:"track"})
    self.css({display:"none"})
    self.update=function(num){
        if(self.child().length==0){
            for(var i=0;i<num;i++){
                self.append($("div",{cls:"dot2"}))
            }
        }
    }
    return self
}
function ShadowDot(){
    var self=$("div",{id:"shadowDot"})
    self.css({display:"none"})
    self.update=function(num){
        for(var i=0;i<self.child().length;i++){
            self.child(i).css({display:"block"})
        }
        if(self.child().length<num){
            var len=num-self.child().length
            for(var i=0;i<len;i++){
                self.append($("div",{cls:"dot1"}))
            }
        }else if(self.child().length>num){
            var len=num
            for(var i=len;i<self.child().length;i++){
                self.child(i).css({display:"none"})
            }
        }
    }
    return self
}
debug({W:300,H:200},main);

function getData(param){}

function XML2JSON(xml){
    return domTree(xml.documentElement);
    function domTree(all){
        var Data={}
        for(var i in all.childNodes){
            if(i=="length" || i=="item")continue;

            var selfNode=all.childNodes[i];
            var data={}

            if(selfNode.childNodes&&selfNode.childNodes.length>0){
                for(var i in selfNode.childNodes){
                    if(selfNode.childNodes[i].nodeType==3){
                        data=htmlReplace(selfNode.childNodes[i].nodeValue)
                        break;
                    }
                }
                if(typeof(data)!="string")
                    data=arguments.callee(selfNode);
            }
            // attributes
            // if(selfNode.attributes && selfNode.attributes.length>0 && typeof(data)!="string"){
            //     data.attributes={}
            //     for(i=0;i<selfNode.attributes.length;i++){
            //         //DD(selfNode.attributes[i].nodeName,selfNode.attributes[i].firstChild.nodeValue)
            //         data.attributes[selfNode.attributes[i].nodeName]=selfNode.attributes[i].firstChild.nodeValue;
            //     }
            // }

            var label=selfNode.nodeName?selfNode.nodeName:i
            
            if(Data[label]==null){
                Data[label]=data
            }else if(isArray(Data[label])){
                Data[label].push(data)
            }else{
                Data[label]=[Data[label]]
            }
        };
        return Data
    };
    function htmlReplace(str){
        return str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
    };
    function isArray(value){
        if(value instanceof Array||value.constructor.toString().match(/function\sArray\(/))return true;
    };
}
function API(){
    var self={}
    var Interface={
        tagList:"api/0/tag/list",
        subscribeList:"api/0/subscription/list",
        preferenceList:"api/0/preference/list",
        unreadCount:"api/0/unread-count",
    }
    var option={
        output:"json"
    }
    self.get=function(id,param,callback){
        var requestURL=Interface[id]+"?"
        for(var i in param){
            option[i]=param[i]
        }
        for(var i in option){
            requestURL+=i+"="+option[i]+"&";
        }
        requestURL=requestURL.substring(0,requestURL.length-1);
        DD(requestURL)
        getData(requestURL,function(text){
            if(text.responseXML && typeof(text.responseXML)=="object"){
                var xml=text.responseXML
                callback(XML2JSON(xml))
            }else{
                eval("var data="+text.responseText)
                callback(data)
            }
        })
    }
    self.gett=function(id,param,callback){
        var requestURL="api/0/stream/contents/"+encodeURIComponent(id)+"?"
        for(var i in param){
            requestURL+=i+"="+param[i]+"&";
        }
        requestURL=requestURL.substring(0,requestURL.length-1);
        DD(requestURL)
        getData(requestURL,function(text){
            if(text.responseXML && typeof(text.responseXML)=="object"){
                var xml=text.responseXML
                callback(XML2JSON(xml))
            }else{
                eval("var data="+text.responseText)
                callback(data)
            }
        })
    }
    function setData(text){
        
    }
    return self
}
var api=API()
function main(){
    var body=$("body");
    var listView=ListView()
    var feedView=FeedView()
    var articleView=ArticleView()
    body.append(listView,feedView,articleView)

    function ListView(){
        var self=$("ul",{cls:"listView"})
        var getBtn=$("button",{text:"getFeed"})
        //var Sections=[]
        self.append(getBtn)
        getBtn.onclick=function(){
            api.get("subscribeList",{},function(data){
                //JJ(data.subscriptions)
                for(var i in data.subscriptions){

                }
                for(var i in data.subscriptions){
                    var feed=Feed(data.subscriptions[i])
                    self.append(feed)
                }
            })
        }
        function Section(data){
            var self=$("ul",{text:data.label})
            self.id=data.id
            return self
        }
        function Feed(data){
            var self=$("li",{text:data.title})
            self.id=data.id
            self.onclick=function(){
                api.gett(data.id,{},function(data){
                    //JJ(data)
                    feedView.setData(data)
                })
            }
            return self
        }
        return self
    }
    
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
            var posZ=-150,posX=-144;
            var L,D,H
            var stepX,pos
            var animating=false
            window.onmousewheel=function(e){
                if(animating || angle==3 || angle==81)return;
                if(pos-e.wheelDelta/120*5>-stepX){self.fold();}
                else{self.update(-e.wheelDelta/120*5)}
            }
            self.pageDown=function(){
                if(animating || angle==3)return;
                animating=true
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
                update()
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
                if(
                    endPos>-stepX){self.fold()
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
                            posZ-=10
                            self.update(0)
                            update()
                        },50)
                    }else if(Angle<90){
                        var timeout=setTimeout(function(){
                            Angle+=5
                            posX-=8
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
                            posX+=8
                            self.update(0,Angle)
                            update()
                        },50)
                    }else if(angle<45){
                        var timeout=setTimeout(function(){
                            angle+=3
                            step+=3
                            posZ+=10
                            self.update(0)
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
                            posZ+=30
                            self.update(0)
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
                            posZ-=30
                            self.update(0)
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
                self.append(child)
                if(self.child().length%2){
                    child.addClass("front")
                }else{
                    child.addClass("back")
                }
            }
            self.update=function(s,Angle){
                if(pos+stepX*Math.floor(self.child().length/2)<0 && s<0){DD(11);return;}
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
                    paperArr.push([X+posX,Y])
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
                            paper1.css({"-webkit-transform":"translateX("+((x+x1)/2)+"px) translateZ("+(-(y+y1)/2+posZ)+"px) rotateY("+angle1+"rad)"})
                            paper1.shadow.css({opacity:Math.abs(angle1)*0.3});
                        }
                    }
                    
                    if(paper2){
                        var angle2=Math.atan((y-y2)/(x-x2))
                        if(angle2<-0.16){
                            paper2.hide()
                        }else{
                            paper2.show()
                            paper2.css({"-webkit-transform":"translateX("+((x+x2)/2)+"px) translateZ("+(-(y+y2)/2+posZ)+"px) rotateY("+angle2+"rad)"})
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
        function ArticlePreview(data){
            var self=$("div",{cls:"cell"})
            var box=$("div",{cls:"box"})
            var title=$("div",{cls:"title",text:data.title})
            var author=$("span",{cls:"author",text:data.author})
            var preview,image
            self.data={imgW:0,imgH:0,title:data.title}
            // self.append(title)
            data.summary=data.summary?data.summary:data.content
            self.append(
                box.append(
                    title
                )
            )
            findPic(data.summary.content,function(img){
                if(img){
                    image=img
                    var W=150
                    var H=150
                    preview=$("div",{cls:"img"})
                    box.append(preview.append(img))
                    self.data.imgW=img.width
                    self.data.imgH=img.height
                }
                feedView.setWrap();

            })
            self.resize=function(){
                if(!preview)return;
                if(preview.height()==0)
                    preview.height(box.height()-title.height());
                //---------------------------------- TBD
                if(preview.width()/preview.height()/image.width*image.height>1.6)
                    preview.width(preview.width()*0.8);
                //----------------------------------
                var o=resizePic(preview.width(),preview.height(),image.width,image.height)
                image.css({width:o.w,height:o.h,top:o.y,left:o.x})
            }
            self.onclick=function(){
                articleView.setData(data)
            }
            function findPic(html,callback){
                var index=0
                getImage()
                function getImage(){
                    var imgSrc=getImagePath()
                    if(imgSrc){
                        var img=$("img",{src:imgSrc})
                        img.onload=function(){
                            if(img.width<100||img.height<100){
                                getImage()
                            }
                            else{
                                callback(img)
                            }
                        }
                    }else{
                        callback(false)
                    }
                }
                function getImagePath(){
                    html=html.slice(index)
                    var result=html.match(/http:\/\/[\w\d\/\:\.-]*(jpg|gif|png|jpeg)/i)
                    
                    if(result){
                        index=result.index+result[0].length
                        return result[0]
                    }
                    return false
                }
            }
            function resizePic(W,H,w,h){
                var o={w:W,h:H,x:0,y:0}
                if(w*H>W*h){
                    o.w=w/h*H
                    o.x=(W-o.w)/2
                }else{
                    o.h=h/w*W
                    o.y=(H-o.h)/2
                }
                return o
            }
            return self
        }
        function parseArticle(width,height,title,text){
            if(width>height){
                if(height>400){
                    return [1,1];
                }else if(height>200){
                    return [1,2];
                }else{
                    return [1,3];
                }
            }else{
                if(width>400){
                    return [2,1];
                }else if(width>200){
                    return [2,2];
                }else{
                    return [2,3];
                }
            }
        }
        function parseList(data,callback){
            var types=[]
            for(var i in data){
                types[i]=data[i].data.type
            }
            switch(types.length){
                case 1:
                    if(types[0][0]==2 && types[0][1]==1){
                        callback(1,1)
                    }
                    break;
                case 2:
                    if(types[0][0]==1){
                        if(types[0][1]==1 && types[1][1]==1){
                            callback(2,1)
                        }
                    }else{
                        if(types[0][1]==1 && types[1][1]==1){
                            callback(2,1)
                        }
                    }
                    break;
                case 3:
                    if(types[0][0]==1){
                        if(types[0][1]==1 && types[1][1]<=2){
                            callback(3,1)
                        }else if(types[0][1]==2 && types[1][1]==2 && types[2][1]==2){
                            callback(3,3)
                        }
                    }else{
                        if(types[0][1]==1 && types[1][1]<=2){
                            callback(3,2)
                        }else if(types[0][1]==2 && types[1][1]==2 && types[2][1]==2){
                            callback(3,3)
                        }
                    }
                    break;
                case 4:
                    if(types[0][0]==1){
                        if(types[0][1]==1){
                            callback(4,1)
                        }else if(types[0][1]<=2 && types[1][1]<=2){
                            callback(4,3)
                        }else if(types[0][1]<=2 && types[3][1]<=2){
                            callback(4,4)
                        }
                    }else{
                        if(types[0][1]==1){
                            callback(4,2)
                        }
                    }
                    break;
                case 5:
                    if(types[0][0]==1){
                        if(types[0][1]<=2){
                            callback(5,1)
                        }else if(types[2][1]<=2){
                            callback(5,2)
                        }else if(types[4][1]<=2){
                            callback(5,3)
                        }
                    }
                    break;
                case 6:
                default:callback(types.length,1)
            }
        }
        return self
    }
    function ArticleView(){
        var self=$("div",{cls:"articleView"})
        var title=$("h2",{cls:"title"})
        var date=$("span",{cls:"date"})
        var author=$("span",{cls:"author"})
        var content=$("div",{cls:"content"})
        self.append(title,date,author,content)
        self.setData=function(data){
            title.html(data.title)
            date.html(data.published)
            author.html(data.author)
            content.html(data.summary.content)
        }
        return self
    }

}


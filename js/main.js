debug({W:300,H:300},main);

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
                    // JJ(data)
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
        var controller=Controller()
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


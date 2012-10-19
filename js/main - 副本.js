debug({W:500,H:300},main);
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
function setTimeFormat(time){
    var second=0,minute=0,hour=0
    if(typeof(time)=="number"){
        second=time%60
        minute=(time-second)/60%60
        hour=(time-second-minute*60)/3600
    }else if(typeof(time)=="string"){
        var timeArr=time.split(":")
        var len=timeArr.length
        timeArr[len-1] && (second=parseInt(timeArr[len-1]))
        timeArr[len-2] && (minute=parseInt(timeArr[len-2]))
        timeArr[len-3] && (hour=parseInt(timeArr[len-3]))
    }
    return  (hour           //hour
                ?hour+":"
                :""
            )+
            (hour           //minute
                ?(minute<10?"0"+minute:minute)+":"
                :minute?minute+":":""
            )+
            ((hour||minute) //second
                ?(second<10?"0"+second:second)
                :second
            )
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
                eval("data="+text.responseText)
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
                eval("data="+text.responseText)
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
        self.setData=function(data){
            self.clear();
            for(var i in data.items){
                var articlePreview=ArticlePreview(data.items[i])
                self.append(articlePreview)
            }
        }
        function ArticlePreview(data){
            var self=$("div",{cls:"articlePreview"})
            var title=$("h3",{cls:"title",text:data.title})
            var author=$("span",{cls:"author",text:data.author})
            self.append(title,author)
            data.summary=data.summary?data.summary:data.content
            findPic(data.summary.content,function(img){
                var W=150
                var H=150
                var preview=$("div",{cls:"preview",css:{width:W,height:H}})
                var o=resizePic(W,H,img.width,img.height)
                img.css({width:o.w,height:o.h,top:o.y,left:o.x})
                self.append(
                    preview.append(
                        img
                    )
                )
            })
            // if(imgSrc){
            //     var W=150
            //     var H=150
            //     var preview=$("div",{cls:"preview",css:{width:W,height:H}})
            //     var img=$("img",{src:imgSrc})
            //     for(var i in img){
            //         DD(i,img[i])
            //     }
            //     img.onload=function(){
            //         var o=resizePic(W,H,img.width,img.height)
            //         img.css({width:o.w,height:o.h,top:o.y,left:o.x})
            //         self.append(
            //             preview.append(
            //                 img
            //             )
            //         )
            //     }
            // }
            
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
            date.html(setTimeFormat(Math.floor(parseInt(data.published)/1000000)))
            author.html(data.author)
            content.html(data.summary.content)
        }
        return self
    }

}


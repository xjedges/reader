debug(1,{W:300,H:300});
window.onload=main;


function Paper(data,length,code){
    var self=$("div",{cls:"paper tmp"+code+" len"+length})
    self.shadow=$("div",{cls:"shadow"})
    
    self.append(self.shadow)
    self.update=function(){
        if(Math.random()>0.5){
            if(self.domIndex()%2==0){
                var tag=tags.addTag(self,self.parent().child(self.domIndex()+1))
            }else{
                var tag=tags.addTag(self,self.parent().child(self.domIndex()-1))
            }
        }
    }
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
    var topOffset=10
    var pad=5
    var insert=15
    self.addTag=function(paper1,paper2){
        var color=theme[ Math.random()*theme.length>>0 ];
        var title=titles[ Math.random()*titles.length>>0 ]

        if(title.length>10){
            title=title.replace(/ /g,"<br/>")
        }

        var t=topOffset
        var tag1=$("div",{cls:"tag",html:title})
        paper1.append(tag1)
        l=tag1.width()-insert
        topOffset=t+tag1.height()+pad
        tag1.css({background:color,top:t,"margin-left":-l,"margin-right":-l})
        if(paper2){
            var tag2=$("div",{cls:"tag back",html:title})
            paper2.append(tag2)
            tag2.css({background:color,top:t,width:tag1.width()-insert-10,"margin-left":-l,"margin-right":-l})
        }
    }
    return self
}
function main(){
    var body=$("body")
    var info=$("span")
    var feedView=FeedView()
    tags=Tags()
    body.append(feedView,info)
    feedView.setData({items:[1,1,1,1,1,1,1,1,1,1]})
    function FeedView(){
        var self=$("div",{cls:"feedView"})
        var articlePreviewArr=[]
        var wrapdata=[]
        var wrapCount=0
        var data;
        var shadow=Shadow()
        var book=Book()
        var controller=Controller()
        var tags=Tags()
        self.append(shadow,book)
        self.setData=function(d){
            data=d
            book.init();
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
                            book.add(paper)
                            wrapdata=[]
                        })
                    }
                }
                for(var i=0;i<book.child().length;i++){
                    book.child(i).update()
                }
                for(var i in articlePreviewArr){
                    articlePreviewArr[i].resize()
                }
                book.update(null,90);
            }
        }
        function Controller(){
            var self={}
            var x0,x1,xt,xt1
            var mouseMove=false
            var mouseDown=false
            book.onmousedown=function(e){
                mouseMove=false
                mouseDown=true
                xt=x0=e.clientX
            }
            book.onmouseup=function(e){
                mouseDown=false
                if(!mouseMove){
                    book.open()
                }else{
                    x1=e.clientX
                    if(x0>x1){
                        book.pageDown()
                    }else{book.pageUp()}
                }
            };
            book.onmousemove=function(e){
                mouseMove=true
                if(mouseDown){
                    var xt1=e.clientX
                    book.slide((xt1-xt)/20)
                    xt=xt1
                }
            }
            book.onmousewheel=function(e){
                book.slide(e.wheelDelta/120*2)
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


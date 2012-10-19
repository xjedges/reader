 debug({W:500,H:300});
window.onload=main
function main(){
    var imgWseed=[600,500,500,400,400,400,300,200]
    var imgHseed=[500,600,500,400,400,400,400,300]
    var titleseed=[5,10,10,8,9,9,13,20,20]
    var textseed=[0,20,40,60,200,300]

    function random(seed){
        return seed[Math.floor(Math.random()*seed.length)]
    }
    function parseArticle(width,height,title,text){
        if(width>height){
            if(height>500){
                return [1,1];
            }else if(height>300){
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
            types[i]=data[i].type
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
    var body=$("body")
    var wrapdata=[]

    for(var i=0;i<30;i++){

        var data={img:{}}
        data.img.width=random(imgWseed)
        data.img.height=random(imgHseed)
        data.title=random(titleseed)
        data.text=random(textseed)

        data.type=parseArticle(data.img.width,data.img.height,data.title,data.text)

        wrapdata.push(data)
        if(wrapdata.length>=1){
            parseList(wrapdata,function(length,code){
                var wrap=Wrap(wrapdata,length,code)
                body.append(wrap)
                wrapdata=[]
            })
        }

    }
    var body=$("body")
    
    function Wrap(data,length,code){
        var self=$("div",{cls:"wrap tmp"+code+" len"+length})
        for(var i in data){
            var box=$("div",{cls:"box"})
            var cell=$("div",{cls:"cell sty"+data[i].type[1]+" pos"+(parseInt(i)+1)})
            var img=$("div",{cls:"img"})
            var titleStr=""
            for(var j=0;j<data[i].title;j++){
                titleStr+="x"
            }
            var textStr=""
            for(var j=0;j<data[i].text;j++){
                textStr+="x"
            }
            var title=$("p",{cls:"title",text:titleStr})
            var text=$("div",{cls:"text",text:textStr})
            
            if(data[i].type[1]<=2){
                self.append(cell.append(box.append(title,img)))
            }else{
                self.append(cell.append(box.append(title,text)))
            }
        }
        return self
    }

}


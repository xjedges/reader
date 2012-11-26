debug({W:300,H:500},main);
function DomToJson(dom){
    var data={}
    function domTree(dom){
        
        var nodeData={}
        // if(dom.getAttribute("id")!=null)nodeData.id=dom.getAttribute("id");
        // if(dom.getAttribute("class")!=null)nodeData.cls=dom.getAttribute("class");
        nodeData.tag=dom.nodeName.toLowerCase()
        if(nodeData.tag=="p"){
            D("----------------------")
            for(var i=0;i<dom.childNodes.length;i++){
                D(dom.childNodes[i].nodeType,dom.childNodes[i].nodeName)
            }
        }
        switch(nodeData.tag){
            // case "p":nodeData.text=dom.innerHTML; return nodeData;
            case "img":nodeData.src=dom.getAttribute("src"); break;
            case "a":nodeData.href=dom.getAttribute("href"); break;
        }

        for(var i=0;i<dom.childNodes.length;i++){
            if(dom.childNodes[i].nodeType==Node.TEXT_NODE){
                nodeData.text=dom.childNodes[0].nodeValue
            }else{
                if(!nodeData.children)nodeData.children=[];
                nodeData.children.push(domTree(dom.childNodes[i]));
            }
        }
        return nodeData
    };
    JJ(domTree(dom))
}
function StringToJson(string){

    function getNode(){
        var tag1=string.match(/<([\w]*)([^>]*)>([^<]*)/)
        var tag2=string.match(/<\/([^>]*)>/)
        if(tag1 && tag2){
            if(tag1.index<tag2.index){
                var node={}
                node.tag=tag1[1]
                getAttr(node,tag1[2])
                getText(node,tag1[3])
                string=string.substring(tag1.index+tag1[0].length)
                if(node.tag=="img")string="</>"+string;
                getChildren(node);

                return node
            }else{
                string=string.substring(tag2.index+tag2[0].length)
            }
        }
    }
    function getChildren(node){
        function getChild(){
            var childNode=getNode()
            if(childNode){
                if(!node.children)node.children=[];

                if(childNode.children && childNode.children.length==1){
                    node.children.push(childNode.children[0])
                }else if(childNode.tag!="div" || (childNode.children && childNode.children.length>0)){
                    node.children.push(childNode)
                }
                getChild()
            }
        }
        getChild()
    }

    function getAttr(node,str){
        if(str){
            var attr=str.match(/[\s]*([\w]*)[\s]*=[\s]*["']([^"']*)["']/)
            if(attr){
                // filter
                if(attr[1].search(/src|href/)==0)
                    node[attr[1]]=attr[2];
                    
                getAttr(node,str.substring(attr.index+attr[0].length))
            }
        }
    }
    function getText(node,str){
        if(str!="")node.text=str;
    }
    
    return getNode()
}
function display(node){
    var html=""
    function displayNode(node){
        switch(node.tag){
            case "img":html+='<img src="'+node.src+'"/>'; break;
            case "p":html+='<p>'+node.text+'</p>'; break;
            case "div":html+='<div>'
                for(var i in node.children){
                    displayNode(node.children[i])
                }
                html+='</div>'
                break;
            case "h3":html+='<h3>'+node.text+'</h3>'; break;
        }
    }
    displayNode(node)
    return html
}
function main(){
    var body=$("body")
    var dataView=$("div")
    body.append(dataView)
    for(var i in data[0].items){
        var article=Article(data[0].items[i])
        break;
    }

    function Article(data){
        var self={}
        var content=data.summary && data.summary.content
        
        // DomToJson(dataView)
        content=content.replace(/<strong>([^<]*)<\/strong>/g,"$1").replace(/<a[^>]*>([^<]*)<\/a>/g,"$1")
        node=StringToJson("<div>"+content+"</div>")
        // JJ(node)
        content=display(node)
        // DD(content)
        dataView.html(content)
        // html='<img src="http://abduzeedo.com/files/originals/gtav-theme.jpg" width="1680" height="1050" alt="GTA V Logo in Illustrator and Photoshop" title="GTA V Logo in Illustrator and Photoshop">'
        // StringToJson(html)
        // StringToJson('<div id="sdaf" class="sdfaiu">sdafasd<img ><p><div></div></p><a></a></div>')
        
        return self
    }
    S()
}
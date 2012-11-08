/*
 * 2012-5-2
 *
 * 参数: active:激活<boolean>,
 *		 orient:信息流方向<boolean>,
 *		 fun:执行函数<function>,
 *		 param:参数<{ W:宽度<number>, H:高度<number>, P:面板位置<"TL|TR|BL|BR">, T:颜色<"dark|light|mono"> }>
 *
 */

window.debug=debug;

function debug(){
	//--------------------------------------------------------------------
	//参数定义
	var fun,setting,orient=0,active=true,theme,nav=getNav(),startTime;
	for(var i=0;i< arguments.length;i++){
		switch(typeof arguments[i]){
			case "object":setting=arguments[i];break;
			case "function":
				fun=arguments[i];
				window.onload=function(){
					startTime=new Date();
					// if(fun)getError(fun);
					fun()
				};
				break;
			case "number":orient=arguments[i];break;
			case "boolean":active=arguments[i];break;
		};
	};
	
	//变量
	var num=0;
	var msgHtml="";
	var debugDiv;
	var initState=0;
	//方法
	D=function(){},DD=function(){D.apply(this,arguments);S();},//打印 Array|Number|String
	Q=function(){},QQ=function(){Q.apply(this,arguments);S();},//打印 Array|Number|String（条件）
	A=function(){},AA=function(){A.apply(this,arguments);S();},//打印 Array
	J=function(){},JJ=function(){J.apply(this,arguments);S();},//打印 Object
	F=function(){},FF=function(){F.apply(this,arguments);S();},//打印 Function
	Z=function(){},ZZ=function(){Z.apply(this,arguments);S();},//打印 Dom对象
	N=function(){},NN=function(){N.apply(this,arguments);S();},//打印 BrowerInfo
	X=function(){},XX=function(){X.apply(this,arguments);S();},//打印 time
	S=function(){};//打印显示
	
	if(!active){return};
	//--------------------------------------------------------------------
	D=function(){
		msgInset(getNum()+getMsg(arguments)+"<br/>");
	};
	Q=function(){
		var args=Array.prototype.slice.apply(arguments).slice(1);
		if(typeof arguments[0]=="boolean" && arguments[0])D.apply(this,args);
	};
	A=function(arr){
		var html=getNum()+style("arr","[array]");
		if(isArray(arr)){
			html+="<table class='arr'>";
			var maxlen=0;
			for(var i in arr){
				var len=0;
				if(isArray(arr[i])){
					len=arr[i].length;
				}else{len=1};
				if(len>maxlen)maxlen=arr[i].length;
			};
			for(var i in arr){
				if(isArray(arr[i])){
					html+=(i!=0)?"<tr><td>&nbsp;[</td>":"<tr><td>[[</td>";
					for(var j in arr[i]){
						if(j!=arr[i].length-1){
							html+="<td>"+msgStyle(arr[i][j])+","+"</td>";
						}else{
							html+="<td colspan="+(maxlen-arr[i].length+1)+">"+msgStyle(arr[i][j])+"</td>";
						};
					};
					html+=(i!=arr.length-1)?"<td>],</td></tr>":"<td>]]</td></tr>";
				}else{
					html+=(i!=0)?"<tr><td>&nbsp;</td>":"<tr><td>[&nbsp;</td>";
					html+="<td colspan="+maxlen+">"+msgStyle(arr[i])+"</td>";
					html+=(i!=arr.length-1)?"<td>&nbsp;,</td></tr>":"<td>&nbsp;]</td></tr>";
				};
			};
			html+="</table>";
		}else{html+=style("warm","! A ( array )"+"<br/>");};
		msgInset(html);
	};
	X=function(){
		var endTime=new Date();
		var start=startTime.getMilliseconds()+startTime.getSeconds()*1000;
		var end=endTime.getMilliseconds()+endTime.getSeconds()*1000;
		var space=end-start;
		var html=style("time","======== "+space+" ms"+" ========")+"<br/>";
		msgInset(html);
		startTime=endTime;
	};
	J=function(obj,more){
		var html=getNum();
		html+="<span>"+style("obj","{obj}")+"<br/>";
		objTree(obj,[]);
		html+="</span>";
		msgInset(html);
		function objTree(all,indexArr){
			var len=0;
			var count=0;
			if(typeof all=="object")for(var i in all)len++;
			if(len==0)return false;
			for(var i in all){
				var blank="";
				for(var j=indexArr.length-1;j>=0;j--){
					if(indexArr[j]==false){blank="|&nbsp;"+blank;}
					else{blank="&nbsp;&nbsp;"+blank;}
				};
				if(count!=(len-1)){
					var branch="|-";
					indexArr.push(false);
				}else{
					var branch="`-";
					indexArr.push(true);
				};
				var str=blank+branch+style("cls",i+": ")+msgStyle(all[i]);
				
				html+=str+"<br/>";

				objTree(all[i],indexArr);
				
				indexArr.pop();
				count++;
			};
		};
	};
	Z=function(obj){
		var html=getNum()+"<span>"+style("tag","&lt;"+obj.nodeName.toLowerCase()+"&gt;")+"<br/>";
		domTree(obj,[]);
		html+="</span>";
		msgInset(html);
		function domTree(all,indexArr){
			var len=all.childNodes.length;
			for(var i=0;i<len;i++){
				
				var blank="";
				for(var j=indexArr.length-1;j>=0;j--){
					if(indexArr[j]==false){blank="┃　"+blank;}
					else{blank="　　"+blank;}
				};
				if(i!=(len-1)){
					var branch="┣━";
					indexArr.push(false);
				}else{
					var branch="┗━";
					indexArr.push(true);
				};
				
				var selfNode=all.childNodes[i];
				
				var id=(selfNode.getAttribute("id")!=null)?     style("id"," #"+selfNode.getAttribute("id")+"")    :"";
				var cls=(selfNode.getAttribute("class")!=null)? style("cls"," ."+selfNode.getAttribute("class")+""):"";
				var value=selfNode.nodeValue?htmlReplace(selfNode.nodeValue):""
				
				var label=style("tag","&lt;"+selfNode.nodeName.toLowerCase()+"&gt;");
				var str=blank+branch+label+id+cls+value;
				
				html+=str+"<br/>";
				
				if(selfNode.childNodes.length>0)domTree(selfNode,indexArr);
				indexArr.pop();
			};
		};
	};
	N=function(){
		var oCC=new TClientCheck();
		var html="Browse>>"+style("index",oCC.getBrowse())+"<br/>"+
				 "Kernel>>"+style("index",oCC.browseKernel)+"<br/>"+
				 "OS>>"+style("index",oCC.getOS())+"<br/>"+
				 "Agent>>"+style("index",oCC.userAgent)+"<br/>";
		msgInset(html);
	};
	F=function(){
		var html=getNum()+getMsg(arguments);
		var funHtml="";
		var funArr=[];
		fun(F.caller);
		function fun(fn){
			var fnName=fn+"";
			fnName=fnName.replace(/function\s*([a-zA-Z0-9_]*)\s*[\S\W]*/,"$1");
			funArr.push(fnName);
			
			if(fnName!="getError"){fun(fn.caller)};
		};
		for(var i=0;i<funArr.length-2;i++){
			var str=(funArr[i]=="")?style("fun","null ( )"):style("fun",funArr[i]+" ( )");
			funHtml+="<<"+str;
		};
		funHtml+="<br/>";
		msgInset(html+funHtml);
	};
	S=function(){
		showMsg();
	};
	//--------------------------------------------------------------------
	function msgInset(msg){
		if(orient){msgHtml=msg+msgHtml;}
		else{msgHtml+=msg;};
	};
	function showMsg(){
		if(initState==2){
			debugDiv.innerHTML=msgHtml;
		}else if(msgHtml!=""&&initState==0){
			initState=1;
			initPannel();
		};
	};
	function initPannel(){
		var themeTemplate={
			dark:{
				str:'#E6DB74',obj:'#FD971F',fun:'#66D9EF',num:'#AE81FF',boo:'#F92672',arr:"#FD971F",
				bg:'#272822',time:'#A6E22E',index:'#F92672',txt:'#F8F8F2',warm:"#F00",
				cls:"#A6E22E",id:'#66D9EF',tag:'#F92672'
			},
			light:{
				str:'#669900',obj:'#008B8B',fun:'#CC9966',num:'#A061F0',boo:'#F92672',arr:"#FD971F",
				bg:'#dddddd',time:'#A6E22E',index:'#F92672',txt:'#333',warm:"#F00",
				cls:"#690",id:'#008B8B',tag:'#F92672'
			},
			mono:{
				bg:'#dddddd',txt:'#111111'
			}
		};
		var option={W:200,H:200,P:"BR",T:"dark"};
		for (var attribute in setting)option[attribute] = setting[attribute];
	    
		theme=themeTemplate[option.T];
		
		var body=document.getElementsByTagName("body")[0];
		var iframe=document.createElement("iframe");
		css(iframe,{width:option.W,height:option.H,padding:5,background:theme.bg,borderRadius:5,position:nav=="IE"?"absolute":"fixed",border:0,"zIndex":10000});
		
		switch(option.P){
			case "TL":css(iframe,{top:0,left:0});break;
			case "TR":css(iframe,{top:0,right:0});break;
			case "BL":css(iframe,{bottom:0,left:0});break;
			case "BR":css(iframe,{bottom:0,right:0});break;
		};
		body.appendChild(iframe);
		
		if(nav=="Firefox"){iframe.onload=init}else{init();}
		function init(){
			var box=Box(iframe);
			debugDiv=box.div;
			initState=2;
			showMsg()
		};
	};
	function css(obj,param){
		for(var stl in param){
            var value=param[stl];
            switch(typeof value){
                case "string":
                    obj.style[stl]=value;break;
                case "number":
                    if(stl!="zIndex"&&stl!="opacity"&&value!=0){obj.style[stl]=value+"px";}
                    else{obj.style[stl]=value};break;
                case "object":
                    var str="";
                    for(var i in value){
                        str+=value[i];
                        if(typeof value[i]=="number"&&value[i]!=0){
                            str+="px";
                        };
                        str+=" ";
                    };
                    obj.style[stl]=str;break;
            };
        };
	};
	function getMsg(args){
		var msg="";
		for(var i in args){
			if(i<args.length-1){msg+=msgStyle(args[i])+" ` ";}
			else{msg+=msgStyle(args[i]);};
		};
		return msg;
	};
	function isArray(value){
		if(value instanceof Array||value.constructor.toString().match(/function\sArray\(/))return true;
	};
	function msgStyle(msg){
		if(msg==null){return style("boo",msg);}
		else if(isArray(msg)){
			var str="";
			for(var i in msg){
				var comma=(i!=msg.length-1)?", ":"";
				str+=msgStyle(msg[i])+comma;
			}
			return style("arr",'['+str+']');
		};
		switch(typeof msg){
			case "string":return style("str",'"'+htmlReplace(msg)+'"');break;
			case "object":return style("obj",'{obj}');break;
			case "number":return style("num",msg);break;
			case "function":return style("fun",'(fun)');break;
			default:return style("boo",msg);
		};
	};
	function htmlReplace(str){
		return str.replace(/</g,"&lt;").replace(/>/g,"&gt;");
	};
	function style(str,text){
		if(theme!="mono"){return "<span class='"+str+"'>"+text+"</span>";}
		else{return text;};
	};
	function getNum(){
		num++;
		var num_str=style("index",num);
		return num_str+(num<10
							?"===>"
							:num<100
								?"==>"
								:"=>");
	};
	function getNav(){
		var sUA=navigator.userAgent;
	    if ((navigator.appName == "Microsoft Internet Explorer")) {
	        if (sUA.indexOf('Opera')!=-1) {return 'Opera';};
			return 'IE';
	    };
	    if(sUA.indexOf('Gecko')!=-1) {
	        if(navigator.vendor=="Mozilla") {return "Mozilla";};
	        if (sUA.indexOf('Firefox')!=-1) {return 'Firefox';};
	        return "Gecko";
	    };
	    if(sUA.indexOf('Netscape')!=-1) {return 'Netscape';};
	    if(sUA.indexOf('Safari') != -1) {return 'Safari';};
	};
	function Box(iframe){
		var self={};
		self.document=(nav=="IE")?iframe.contentWindow.document:iframe.contentDocument;
		self.document.write('\
		<head>\
		<title>debug</title>\
		<style>\
		body{padding:0; margin:0;}\
		#wrap{ color:'+theme.txt+'; font-weight:900; font-family:Courier New; font-size:12px; line-height:12px;\
		position:absolute; width:100%; height:100%; overflow:auto;}\
		#wrap::-webkit-scrollbar{width:6px; height:6px; background:transparent;}\
		#wrap::-webkit-scrollbar-thumb{background:#666; border-radius:3px; }\
		#wrap::-webkit-scrollbar-corner{display:none;}\
		#debugDiv{margin:5px;}\
		.table,.str,.obj,.fun,.num,.boo,.arr,.time,.txt,.warm,.cls,.id,.tag{font-family:sans-serif; white-space:nowrap; }\
		.table{color:'+theme.cls+'; border:1px solid #444;}\
		.table th{text-align:left;}\
		.table td{max-width:200px; overflow:hidden}\
		.str{color:'+theme.str+';}\
		.obj{color:'+theme.obj+';}\
		.fun{color:'+theme.fun+';}\
		.num{color:'+theme.num+';}\
		.boo{color:'+theme.boo+';}\
		.arr{color:'+theme.arr+';}\
		.time{color:'+theme.time+';}\
		.index{color:'+theme.index+';}\
		.txt{color:'+theme.txt+';}\
		.warm{color:'+theme.warm+';}\
		.cls{color:'+theme.cls+';}\
		.id{color:'+theme.id+';}\
		.tag{color:'+theme.tag+';}\
		</style>\
		</head>\
		<body>\
		<div id="wrap"><div id="debugDiv"></div></div>\
		</body>');
		self.div=self.document.getElementById("debugDiv");
		return self;
	};
};
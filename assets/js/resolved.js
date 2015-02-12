sc={
	// CSS classes
	
	hidingClass:'hide', // hide elements
	
	init:function(){
		
		if(!document.getElementById || !document.createElement){ return; }
		var header=document.getElementById('useractivity');
		if(!header) { return; }
		var hideLink=sc.createLink('','hide resolved');
		sc.addEvent(hideLink,'click',sc.peekaboo,false);
		var tempObj=document.createElement('span');
		tempObj.appendChild(document.createTextNode('-'));
		header.appendChild(tempObj);
		header.appendChild(hideLink);
	},
	
	peekaboo:function(e){
		var container = document.getElementById('content');
		var header=document.getElementById('useractivity');
		var hideLink = header.getElementsByTagName('a');
		
		var listitems = container.getElementsByTagName('li');
		for(var i=0;i<listitems.length;i++){
			if(sc.cssjs('check',listitems[i],'resolved')) {
				if(sc.cssjs('check',listitems[i], sc.hidingClass)) {
					sc.cssjs('remove',listitems[i], sc.hidingClass);
					hideLink[0].innerHTML ='hide resolved';
				} else {
					sc.cssjs('add',listitems[i], sc.hidingClass);
					hideLink[0].innerHTML ='show resolved';
				}
			}
		}
		sc.cancelClick(e);
	},
	
	cssjs:function(a,o,c1,c2){
		switch (a){
			case 'swap':
				o.className=!sc.cssjs('check',o,c1)?o.className.replace(c2,c1):o.className.replace(c1,c2);
			break;
			case 'add':
				if(!sc.cssjs('check',o,c1)){o.className+=o.className?' '+c1:c1;}
			break;
			case 'remove':
				var rep=o.className.match(' '+c1)?' '+c1:c1;
				o.className=o.className.replace(rep,'');
			break;
			case 'check':
				var found=false;
				var temparray=o.className.split(' ');
				for(var i=0;i<temparray.length;i++){
					if(temparray[i]==c1){found=true;}
				}
				return found;
			break;
		}
	},
	
	createLink:function(to,txt){
		var tempObj=document.createElement('a');
		tempObj.appendChild(document.createTextNode(txt));
		tempObj.setAttribute('href',to);
		return tempObj;
	},
	
	addEvent: function(elm, evType, fn, useCapture){
		if (elm.addEventListener){
			elm.addEventListener(evType, fn, useCapture);
			return true;
		} else if (elm.attachEvent) {
			var r = elm.attachEvent('on' + evType, fn);
			return r;
		} else {
			elm['on' + evType] = fn;
		}
	},
	
	cancelClick:function(e){
		if (window.event){
			window.event.cancelBubble = true;
			window.event.returnValue = false;
		}
		if (e && e.stopPropagation && e.preventDefault){
			e.stopPropagation();
			e.preventDefault();
		}
	}
	
	
}
sc.addEvent(window,'load',sc.init,false);

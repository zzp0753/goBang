var chessBoard = document.getElementById("chessBoard"),
	_replay = document.getElementById('replay'),
	_retract = document.getElementById('retract'),
	_disRetract = document.getElementById('disRetract');

var goBang = {
	step:1,//奇数为黑，黑先手
	matrix:new Array(),//棋局矩阵
	size:16,
	cx:0,//落子行坐标
	cy:0,//落子列坐标
	end:false,//结束标志
	rtrSize:5,//悔棋的最大允许步数
	retractor:new Array(),//悔棋队列
	disRetractor:new Array(),//撤销悔棋队列，记录连续悔棋操作，一旦重新落子则清空
	initMatrix:function(){//初始化棋局矩阵
		for(var x = 0;x < this.size;x++){
			this.matrix[x] = new Array();
			for(var y = 0;y < this.size;y++){
				this.matrix[x][y] = 0;
			}
		}
	},
	addRectractor:function(cx,cy,index){//更新悔棋队列
		if(this.retractor.length < this.rtrSize){
			this.retractor.push([cx,cy,index]);
		} else{
			this.retractor.shift();
			this.retractor.push([cx,cy,index]);
		}
	},
	retract:function(){ //悔棋逻辑

		if(goBang.retractor.length == 0){
			alert('无棋可悔。')
			return false;
		}

		var rx = goBang.retractor[goBang.retractor.length - 1][0],
			ry = goBang.retractor[goBang.retractor.length - 1][1],
			ri = goBang.retractor[goBang.retractor.length - 1][2];
		var tEle = document.getElementsByClassName('chess')[ri];
		var side = tEle.classList[1];//也可通过step判断黑白
		tEle.classList.remove(side);//重置棋子样式
		goBang.matrix[rx][ry] = 0;//更新棋局矩阵
		goBang.step --;//更新落子一方
		
		goBang.disRetractor.push([rx,ry,ri,side]) //同步修改反悔棋队列
		goBang.retractor.pop();//同步修改悔棋队列
		console.log('retract')
	},
	disRetract:function(){ //撤销悔棋逻辑

		if(goBang.disRetractor.length == 0){
			alert('无悔可撤。')
			return false;
		}

		var dx = goBang.disRetractor[goBang.disRetractor.length - 1][0],
			dy = goBang.disRetractor[goBang.disRetractor.length - 1][1],
			di = goBang.disRetractor[goBang.disRetractor.length - 1][2],
			side = goBang.disRetractor[goBang.disRetractor.length - 1][3];
		var tEle = document.getElementsByClassName('chess')[di];
		tEle.classList.add(side); //控制棋子样式

		if(side == 'b'){
			goBang.matrix[dx][dy] = 1;
		}else{
			goBang.matrix[dx][dy] = -1;
		}
		goBang.retractor.push([dx,dy,di]) //同步修改悔棋队列

		goBang.disRetractor.pop();//同步修改反悔棋队列
		console.log('disRetract');
	},
	replay:function(){ //重置所有数据
		goBang.step = 1;//奇数为黑，黑先手
		goBang.matrix = new Array();//棋局矩阵
		goBang.cx = 0;//落子行坐标
		goBang.cy = 0;//落子列坐标
		goBang.end = false;//结束标志
		goBang.retractor = new Array();//悔棋队列
		goBang.disRetractor = new Array();

		var chessSum = document.getElementsByClassName('chess');
		for(i = 0;i<256;i++){
			chessSum[i].classList = 'chess';
		}

		console.log(goBang);
		goBang.init();
	},
	func:function(){//落子
		var self = this;
		var index = 0;
		var fn = function(e){
			if(self.end){ //游戏结束则停止落子事件响应
				console.log('end');
				if(window.attachEvent){
					chessBoard.detachEvent('onclick',fn);
				} else{
					chessBoard.removeEventListener('click',fn);
				}
			} else{
				var ele = e.target;
				if(e.target.className == 'chess'){
					//棋子位置索引值index
					index = Array.prototype.indexOf.call(ele.parentNode.children, ele);
					console.log(index);
					self.setChess(ele,index); //落子
					self.addRectractor(self.cx,self.cy,index); //更新悔棋队列
					self.disRetractor = new Array(); //开始落子则置空反悔棋队列
					setTimeout(function(){
						self.judge(self.cx,self.cy); //落子即判断胜负
					},1)
				}
			}
		}
		if(window.attachEvent){
			chessBoard.attachEvent('onclick',fn);
			// 按钮事件绑定
			_replay.attachEvent('onclick',this.replay);
			_retract.attachEvent('onclick',this.retract);
			_disRetract.attachEvent('onclick',this.disRetract);
		} else{
			chessBoard.addEventListener('click',fn);

			_replay.addEventListener('click',this.replay);
			_retract.addEventListener('click',this.retract);
			_disRetract.addEventListener('click',this.disRetract);
		}

		// _replay.onclick = goBang.replay;
		// _retract.onclick = goBang.retract;
		// _disRetract.onclick = goBang.disRetract;
	},
	judge:function(cx,cy){//胜负判定，index为当前落子元素索引
		var self = this;
		var target = self.matrix[cx][cy];
		var count = [1,1,1,1];//四个方向的同色子数

		// 四个方向都以当前落子为轴心判断，可以直接排除9子之间有空位情况，是最快的判断方法。
		// 纵向判断,
		for(var i=1;i<5;i++){
			if(cx-i<0 || self.matrix[cx-i][cy]!=target){break;}
			count[0] ++;
		}
		for(var i=1;i<5;i++){
			if(cx+i>self.size-1 || self.matrix[cx+i][cy]!=target){break;}
			count[0] ++;
		}
		if(count[0] > 4){
			self.sayWinner(target);
		}

		// 横向判断
		for(var i=1;i<5;i++){
			if(cy-i<0 || self.matrix[cx][cy-i]!=target){break;}
			count[1] ++;
		}
		for(var i=1;i<5;i++){
			if(cy+i>self.size-1 || self.matrix[cx][cy+i]!=target){break;}
			count[1] ++;
		}
		if(count[1] > 4){
			self.sayWinner(target);
		}

		// 东北向判断
		for(var i=1;i<5;i++){
			if(cx-i<0 || cy+i>self.size-1 || self.matrix[cx-i][cy+i]!=target){break;}
			count[2] ++;
		}
		for(var i=1;i<5;i++){
			if(cx+i>self.size-1 || cy-i<0 || self.matrix[cx+i][cy-i]!=target){break;}
			count[2] ++;
		}
		if(count[2] > 4){
			self.sayWinner(target);
		}

		// 西北向判断
		for(var i=1;i<5;i++){
			if(cx-i<0 || cy-i<0 || self.matrix[cx-i][cy-i]!=target){break;}
			count[3] ++;
		}
		for(var i=1;i<5;i++){
			if(cx+i>self.size-1 || cy+i>self.size-1 || self.matrix[cx+i][cy+i]!=target){break;}
			count[3] ++;
		}
		if(count[3] > 4){
			self.sayWinner(target);
		}
	},
	setChess:function(ele,index){
		var self = this;

		if(ele.classList.length == 1){//未落子

			self.cx = Math.floor(index/self.size);
			self.cy = index%self.size;

			if(self.step%2 == 1){ //黑
				ele.classList.add('b');
				self.matrix[self.cx][self.cy] = 1;
			} else{ //白
				ele.classList.add('w');
				self.matrix[self.cx][self.cy] = -1;
			}
			self.step ++;
		}
	},
	sayWinner:function(target){
		if(target == 1){
			alert('黑胜!');
		} else if(target == -1){
			alert('白胜!')
		}
		
		this.end = true;
	},
	init:function(){
		this.initMatrix();
		this.func();
	}
}
goBang.init();
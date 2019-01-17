var chessBoard = document.getElementById("chessBoard");


var goBang = {
	step:1,//奇数为黑，黑先手
	matrix:new Array(),//棋局矩阵
	size:16,
	cx:0,//落子行坐标
	cy:0,//落子列坐标
	end:false,//结束标志
	retractor:[],//悔棋队列
	initMatrix:function(){
		for(var x = 0;x < this.size;x++){
			this.matrix[x] = new Array();
			for(var y = 0;y < this.size;y++){
				this.matrix[x][y] = 0;
			}
		}
	},
	setChess:function(){//落子
		var self = this;
		// ...
		var index = 0;
		var fn = function(e){
			if(self.end){ //游戏结束则停止落子事件响应
				console.log(23232323)
				if(window.attachEvent){
					chessBoard.detachEvent('onclick',fn)
					console.log(fn)
				} else{
					chessBoard.removeEventListener('click',fn)
					console.log(fn)
				}
			} else{
				var ele = e.target;
				if(e.target.className == 'chess'){
					//棋子位置索引值i
					index = Array.prototype.indexOf.call(ele.parentNode.children, ele);
					console.log(index);
					self.action(ele,index);
					setTimeout(function(){
						self.judge(self.cx,self.cy);
					},1)
				}
			}
		}
		if(window.attachEvent){
			chessBoard.attachEvent('onclick',fn);
		} else{
			chessBoard.addEventListener('click',fn);
		}
		console.log(fn);



	},
	judge:function(cx,cy){//胜负判定，index为当前落子元素索引
		var self = this;
		var target = self.matrix[cx][cy];
		var count = [1,1,1,1];//四个方向的同色子数

		// 纵向判断
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
	action:function(ele,index){
		var self = this;

		if(ele.classList.length == 1){//未落子

			self.cx = Math.floor(index/self.size);
			self.cy = index%self.size;

			if(self.step%2 == 1){
				ele.classList.add('b');
				self.matrix[self.cx][self.cy] = 1;
			} else{
				ele.classList.add('w');
				self.matrix[self.cx][self.cy] = -1;
			}
			self.step ++;
		}
	},
	sayWinner:function(target){
		if(target == 1){
			alert('黑胜!');
		} else{
			alert('白胜!')
		}
		this.end = true;
	},
	init:function(){
		this.initMatrix();
		this.setChess();
	}
}
goBang.init()
(function ($) {
	/*
	*	代码相对独立
	*	链式操作
	*	插件可配置
	*	有课操作的方法， 插件的声明周期
	*   配置可缓存
	*   可扩展
	*	无冲突处理
	*   事件代理，动态初始化
	*/
	//开启严格模式
	'use strict';
	//浏览器类别判断
	var typeBrowser = function () {
	};
	//构造函数
	var Anchor = function (el, options) {
		this.options = $.extend({}, Anchor.defaultParam, Anchor.DEFAULTS, options);
		this.$el = $(el);
		this.$el_ = this.$el.clone();  //克隆节点
		this.nodeType = this.$el == document ? true : false;
		this.anchorNodeArrs = [] ;
		this.init();
	};
	//默认参数
	Anchor.DEFAULTS = {
		id: "myanchor",
		showno: true,     //是否显示标题号
		alwayshow: false, //是否一直显示
		showline: true,	//是否显示标题线条
		showbtn: true,	//是否底部按钮
		anchornum: 10,		//显示锚点数量
		container: window,   	//锚点所在容器
		style: "frist_style",    	//内联样式
		location: "left bottom"     //锚点位置
	};

	Anchor.defaultParam = {
		$focusSiglnDiv: null,
		beRadius: 3,    //起始圆半径
		anRadius: 2,	 //一级标题半径
		wheight: 4,
		caOffset: 20,	 //标题点向右偏移量
		fNodeNum: 1,     //一级节点起始标题
		sNodeNum: 1,		//二级节点起始标题
		focusId: 1000, 	//默认焦点id
		siglnHeight: 25,   //单个锚点
		marginBottom: 0,   //单个外边距
		btnDivHeight: 50,
		anchorIndex: 1,
		anchortitlenum: [],
		anchorsObj: [],
		lineDivWidth: 40,
		focusId: null,
		hovid: null,
		flag: false,
		ownerDocument: document
	};

	Anchor.prototype.getParam = function ($anchorNodes) {
		this.options.sheight = this.options.siglnHeight + this.options.marginBottom;
		this.options.dheight = this.options.sheight * $anchorNodes.length;
		$anchorNodes.length > this.options.anchornum?this.options.pDivheight=this.options.anchornum*this.options.sheight:this.options.pDivheight=$anchorNodes.length*this.options.sheight
	};

	//初始化方法
	Anchor.prototype.init = function () {
		this.initContainer();
		this.addListener();
		this.addonWheelListener();
	};

	Anchor.prototype.addonWheelListener = function () {
		//添加滚轮滚动事件
		var that = this;
		this.options.container.onmousewheel = function (e) {
			//判断滚动条是否在顶部或者底部
			if (!that.options.flag) {
				var b = $(that.options.container).scrollTop() + $(that.options.container).height() - $(that.options.ownerDocument).height() + 5;
			} else {
				var b = $(that.options.container).height() + that.options.container.scrollTop - that.options.container.scrollHeight + 5;
			}
			if (b >= 0)   //滚动条到达底部
			{
				console.log("到达底部") ;
				//alert("到达底部");
				return;
			} else if ($(that.options.container).scrollTop() == 0) {  //反动条到达顶部
				console.log("到达底部") ;
				//alert("到达顶部");
				return;
			}
			var anchorId = that.getCurrentFocusId();  //获取当前焦点id
			//判断anchorDIV是否存在滚动条 
				//判断当前焦点是否在可是区域内
			that.removeFocusAnchor(that.options.$focusSiglnDiv);  //移除焦点状态
			if (!anchorId) {
				that.options.focusId = null;
				that.$focusInco.addClass("hidden") ;
				return;
			}
			var $focusNode = that.$anchor_pDiv.find("div[id='anchor_" + anchorId + "']");
			that.addFocusAnchor($focusNode, false);
		} ;
	}

	Anchor.prototype.isInViArea = function($node)
	{
		var top = $node.offset().top - this.$anchor_pDiv.offset().top ;
		if(top <= 0 || top >= this.$anchor_dDiv.height())  //不在可视区域内
		{
			$node[0].scrollIntoView() ;
		}
	}

	//获取当前焦点
	Anchor.prototype.getCurrentFocusId = function () {
		var viewfocusHeight = $(this.options.container).scrollTop();
		var focusAnchor = null;
		var tempHeight = this.options.anchorsObj[0].top - viewfocusHeight;
		if (tempHeight >= 0) {
			if (tempHeight > $(this.options.container).height() / 2) {
				return null;
			}
			return this.options.anchorsObj[0].anchorId;
		}
		for (var i = 0; i < this.options.anchorsObj.length; i++) {
			if (this.options.anchorsObj[i].flag)     //隐藏跳过
			{
				continue;
			}
			let height = this.options.anchorsObj[i].top - viewfocusHeight;
			if (height >= 0) {
				focusAnchor = this.options.anchorsObj[i].anchorId;
				break;
			}
		}
		return focusAnchor;
	}

	Anchor.prototype.addListener = function () {
		var that = this;
		//事件
		this.$anchor_pDiv.on("click", "div[name='anchorNode']", function (event) {
			var $target = $(event.currentTarget);
			var $obj = $target.parent();
			var focusId = $target.attr("id");
			if (that.options.focusId != focusId && that.options.focusId) {
				that.removeFocusAnchor(that.$anchor_pDiv.find("#anchor_" + that.options.focusId));
			}
			that.addFocusAnchor($obj, true);
			event.stopPropagation();
		});

		this.$anchor_pDiv.on("mouseover", "div[name='anchorNode']", function (event) {
			var $target = $(event.currentTarget);
			if (that.options.focusId == $target.attr("id")) {

				return;
			}
			var $obj = $target.parent();
			if (that.options.hovid) {
				var $object = that.$anchor_pDiv.find("#anchor_" + that.options.hovid);
				that.removeHoverState($object);
			}
			that.addHoverState($obj);
			event.stopPropagation();
		});

		this.$anchor_pDiv.on("mouseout", "div[name='anchorNode']", function (event) {
			var $target = $(event.currentTarget) ;
			if (that.options.focusId == $target.attr("id")) {
				that.options.hovid = null ;
				return ;
			}
			var $obj = $target.parent() ;
			that.removeHoverState($obj) ;
			event.stopPropagation() ;
		});

		this.$showBtn.on("click", "i", function(event){
			var $btn = $(event.currentTarget); 
			if($btn.hasClass("fa-bars"))
			{

				$btn.attr("class", "fa fa-list-ul cbtn") ;
				$btn.attr("flag", "true") ;
				$btn.attr("title", "隐藏锚点列") ;
				that.$anchor_dDiv.removeClass("hidden") ;
			}else if($btn.hasClass("fa-list-ul")){

				$btn.attr("class", "fa fa-bars cbtn") ;
				$btn.attr("title", "展开锚点列") ;
				$btn.attr("flag", "false") ;
				that.$anchor_dDiv.addClass("hidden") ;
			}else if($btn.hasClass("fa-angle-double-up")){

				$(that.$anchor_pDiv.find("div[name='anchorNode']")[0]).trigger("click") ;
			}
		}) ;
	}

	//清除画板 绘制hover图形
	Anchor.prototype.addHoverState = function ($obj) {
		var $tempNode = $obj.find("div[name='anchorNode']");
		this.options.hovid = $tempNode.attr("id");
		if (!$obj.hasClass("hoverState")) {
			$obj.addClass("hoverState");
			$tempNode.addClass("hover");
		}
		var context = $obj.find("canvas")[0].getContext('2d');
		context.clearRect(0, 0, 40, this.options.sheight);
		if ($tempNode.attr("type") == "fNode") {
			this.drawbeCanvas(context, 5)
		} else if ($tempNode.attr("type") == "sNode") {
			this.drawbeCanvas(context, 6);
		}
	}

	Anchor.prototype.removeHoverState = function ($obj) {    //清除画板  绘制初始图像
		var $tempNode = $obj.find("div[name='anchorNode']");
		$obj.removeClass("hoverState");
		$tempNode.removeClass("hover");
		this.options.hovid = null;
		//this.options.$focusSiglnDiv = null;
		var context = $obj.find("canvas")[0].getContext('2d');
		context.clearRect(0, 0, 40, this.options.sheight);
		$tempNode.attr("type") == "fNode" ? this.drawbeCanvas(context, 5) : this.drawbeCanvas(context, 6);
	}


	Anchor.prototype.addFocusAnchor = function ($obj, bool) {
		var $tempNode = $obj.find("div[name='anchorNode']");
		if ($obj.hasClass("focusSiglnDiv")) {
			return;
		}
		
		//focus图标移动
		this.$focusInco.hasClass("hidden")?this.$focusInco.removeClass("hidden"):"" ;
		$obj.addClass("focusSighDiv");
		this.options.focusId = $tempNode.attr("id");
		this.options.$focusSiglnDiv = $tempNode.parent();
		$tempNode.addClass("focusAnchor");
		//刷新节点所在的top值
		this.isInViArea($tempNode) ;
		this.setFocusInconLoc($obj);
		//跳转
		if (bool) {
			this.setViewLoc($tempNode.attr("id"));
		}
	}


	Anchor.prototype.removeFocusAnchor = function ($obj) {
		this.$anchor_pDiv.children().each(function(index, item){
			$(item).hasClass("focusSighDiv")?$(item).removeClass("focusSighDiv"):"" ;
			$(item).find("div[name='anchorNode']").removeClass("focusAnchor");
		}) ;
		if (!$obj) {
			return;
		}
		var $tempNode = $obj.find("div[name='anchorNode']");
		$obj.removeClass("focusSighDiv");
		$obj.removeClass("hoverState");
		this.options.focusId = null;
		$tempNode.removeClass("focusAnchor");
		$tempNode.removeClass("hover");
		var context = $obj.find("canvas")[0].getContext('2d');
		context.clearRect(0, 0, 40, this.options.sheight);
		if ($tempNode.attr("type") == "fNode") {
			this.drawbeCanvas(context, 9)
		} else if ($tempNode.attr("type") == "sNode") {
			this.drawbeCanvas(context, 6);
		}
	}

	//跳转
	Anchor.prototype.setViewLoc = function (focusId) {
		var scrollTop = 0;
		for (var i = 0; i < this.options.anchorsObj.length; i++) {
			if (this.options.anchorsObj[i].anchorId == focusId) {
				scrollTop = this.options.anchorsObj[i].top;
				break;
			}
		}
		$(this.options.container).scrollTop(scrollTop);
	}


	//初始化外部Container
	Anchor.prototype.initContainer = function () {

		if (this.$container && this.$container.find("div[id='" + this.options.id + "']").length == 1) {
			this.$container.find("div[id='" + this.options.id + "']").remove();
		}
		//获取节点
		var $anchorNodes = $(this.getAnchorNodes());
		//封装相位置信息
		this.options.anchorsObj = this.setLocalInfo($anchorNodes);
		//封装相关参数
		this.getParam($anchorNodes);
		//生成锚点序号
		this.setAnchorTitleNums($anchorNodes);
		//创建外部pDiv
		this.$el.prepend(this.createDataDiv($anchorNodes));
		//创建btn函数
		//绘制标题点
		this.drawLeftIcon();
		this.$container = this.$el.find("div[id='" + this.options.id + "']");
		this.$showBtn = this.createBtn()?this.$container.append($(this.createBtn())):"" ;
		this.$anchor_pDiv = this.$container.find("#anchor_pDiv");
		this.$anchor_dDiv = this.$container.find("#anchor_DataDiv");
		//绘制起始标志
		this.drawbeginAndEndInco() ;
		//初始化
		//绘制焦点图标
		this.initFocusIcon();
		var focusId = this.getCurrentFocusId();
		if (focusId) {
			var $focusSiglnNode = this.$anchor_pDiv.find("#anchor_" + focusId);
			this.addFocusAnchor($focusSiglnNode, false);
		}else {
			this.$focusInco.addClass("hidden") ;
		}
	};

	Anchor.prototype.drawbeginAndEndInco = function(){
		
		var drawArc = function(ctx, x, y, r){
			ctx.strokeStyle = "#B8B8B8";
			ctx.strokeWidth=1;
			ctx.beginPath();
			ctx.arc(x, y, r, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.stroke();	
			ctx.fillStyle = 'white';
			ctx.fill() ;
		}
		var beWidth = this.options.beRadius * 2+3 ;
		var beHeight = this.options.beRadius * 2+3 ;
		var left = this.options.caOffset - this.options.beRadius - 1 ;
		var beginCanvas = $("<canvas class='begin-canvas' width='"+beWidth+"px' height='"+beHeight+"px' style='position:absoluie; top:0px;left:"+left+"px;'></canvas>") ;
		var top = this.$anchor_pDiv.height() - beHeight ;
		var endCanvas = $("<canvas class='end-canvas' width='"+beWidth+"px' height='"+beHeight+"px' style='position:absolute; top:"+top+"px;left:"+left+"px;'></canvas>") ;
		
		var context = beginCanvas[0].getContext("2d") ;
		drawArc(context, 4, this.options.beRadius+1, this.options.beRadius) ;
		context = endCanvas[0].getContext("2d") ;
		drawArc(context, 4, this.options.beRadius+1, this.options.beRadius) ;
		this.$anchor_dDiv.append(beginCanvas).append(endCanvas) ;
	}
	
	Anchor.prototype.createBtn = function() {
		if(this.options.showbtn == "false")
		{
			return null;
		}
		return "<div class='anchor_btn' style='height:50px;'>" +
		"<i class='fa fa-list-ul cbtn' aria-hidden='true' title='关闭标签项' style='font-size: 25px;' flag='true'></i>" +
		"<i class='fa fa-angle-double-up cbtn' aria-hidden='true' title='回到顶部' style='font-size: 30px;'></i>" +
		"</div>";
	} ;
	
	Anchor.prototype.initFocusIcon = function () {
		this.$focusInco = this.$anchor_dDiv.find("div[id='anchor_focus']");
		var context = this.$focusInco.find("canvas")[0].getContext('2d');
		context.clearRect(0, 0, 40, this.options.sheight);
		this.drawbeCanvas(context, 8);
	};

	//设置焦点图标的位置
	Anchor.prototype.setFocusInconLoc = function ($focusSiglnNode) {  //焦点DIVd对象
		var $showAnchors = this.anchorSiglnDiv();
		var top = this.options.$focusSiglnDiv.offset().top - this.$anchor_dDiv.offset().top;

		this.$focusInco.animate({ top: top + "px" }, { queue: false });    //不再效果队列中播放
	};

	Anchor.prototype.anchorSiglnDiv = function () {
		var $anchorSiglnDiv = this.$anchor_pDiv.find(".signDiv");
		var $nodesArr = $anchorSiglnDiv.each(function (index, item) {
			if (!$(item).hasClass("hidden")) {
				return item;
			}
		});
		return $nodesArr;
	};

	Anchor.prototype.getIndex = function ($obj, $objArrs) {
		var flagnum = null;
		for (var i = 0; i < $objArrs.length; i++) {
			if ($obj.attr("id") === $($objArrs[i]).attr("id")) {
				flagnum = i;
				break;
			}
		}
		return flagnum;
	}

	Anchor.prototype.addBtn = function () {
		return "<div id='anchor_btn' class='anchor_btn'>"
			+ "<i class='fa fa-list-ul' aria-hidden='true'title='关闭标签项' style='font-size:25px'>"
			+ "</div>";
	};

	//计算锚点标题
	Anchor.prototype.setAnchorTitleNums = function ($anchorNodes) {
		var pnum = 0;
		var cnum = 0;
		var flag = false;
		this.options.anchortitlenum.length = 0;
		for (var i = 0; i < $anchorNodes.length; i++) {
			if ($($anchorNodes[i]).hasClass("hidden")) {
				continue;
			}
			if ($anchorNodes[i].getAttribute("anchor-parent") || $($anchorNodes[i]).hasClass("childDiv")) {
				cnum = cnum + 0.1;
				var num = pnum + cnum;
				this.options.anchortitlenum.push(num);
			} else {
				pnum++;
				flag = true;
				cnum = 0;
				this.options.anchortitlenum.push(pnum);
			}
		}
	};

	//获取dom的锚点标签
	Anchor.prototype.getAnchorNodes = function () {
		var that = this;
		var anchorNodes = [];
		var tempArr = this.$el.find("*");
		tempArr.each(function (index, item) {
			if (item.getAttribute("anchor-id") && item.offsetWidth > 0 && item.offsetHeight > 0) {
				anchorNodes.push(item);
			}
		});
		return anchorNodes;
	};

	//设置
	Anchor.prototype.setLocalInfo = function ($anchorNodes) {
		var objectArrs = [];
		$anchorNodes.each(function (index, item) {
			var object = {};
			object.top = $(item).offset().top;
			object.anchorId = item.getAttribute("anchor-id");
			object.anchorIndex = index + 1;
			object.anchorType = object.anchorType = item.getAttribute("anchor-parent") == null ? "parentNode" : "childNode";
			object.dom = item ;
			objectArrs.push(object);
		});
		return objectArrs;
	};

	Anchor.prototype.createDataDiv = function ($anchorNodes) {
		var locationstr = this.options.location;
		this.conHeight = this.getHeight($anchorNodes);

		this.conWidth = this.getWidth();
		//this.right = this.getRightMar() ;   //frame意外的元素放置需要计算
		var positionStr = this.getPdistance(locationstr);
		if (!positionStr) {
			console.error("position error");
		}
		var dataDivStr = this.initDataDiv($anchorNodes);
		var tempHeight = this.conHeight - this.options.btnDivHeight;
		var focusIncoStr = "<div id='anchor_focus' style='width:40px; height:25px;'class='anchor_focus_canvas'><canvas  width='40px' height='25px' ></canvas></div>"
		var strhtml = "<div id='" + this.options.id + "' " + positionStr + 
						"><div class='anchor_con' style='height:" + tempHeight + 
						"px;'><div id='anchor_DataDiv' class='anchor_dataDiv'>"+
						
						focusIncoStr + dataDivStr + "</div></div></div>";
		return strhtml;
	};

	Anchor.prototype.initDataDiv = function ($anchorNodes) {
		var anchorStr = "<div id='anchor_pDiv' class='anchor_pDiv' style='width:250px;height:"+this.options.pDivheight+"px;'>" + this.createAnchors($anchorNodes) + "</div>";
		return anchorStr;
	};

	Anchor.prototype.initcanvasDiv = function () {
		var str = "<div id='anchor_canvasDiv' class='anchor_canvasDiv' height='" + 
					this.options.sheight + "px'><canvas id='anchor_canvas' class='anchor_canvas' width='40px' height='" + 
					this.options.dheight + "'></canvas></div>";
		return str;
	};

	Anchor.prototype.drawLeftIcon = function () {
		var that = this;
		var canvasNodes = this.$el.find("canvas");
		canvasNodes.each(function (index, item) {
			var context = item.getContext('2d');
			context.lineWidth = 2;
			context.strokeStyle = '#999';
			if (index == 0) {//开始圆形
				//that.drawbeCanvas(context, 2);

			} else if (index == canvasNodes.length - 1) {//结束圆形
				if ($(item).attr("type") == "fNode") {
					that.drawbeCanvas(context, 3);
				} else if ($(item).attr("type") == "sNode") {
					that.drawbeCanvas(context, 4);
				}
			} else {
				if ($(item).attr("type") == "fNode")   //绘制圆形
				{
					that.drawbeCanvas(context, 0, index);
				} else if ($(item).attr("type") == "sNode") {   //绘制线条
					that.drawbeCanvas(context, 1);
				}
			}
		});
	};

	//绘制起始节点
	Anchor.prototype.drawbeCanvas = function (ctx, state, hovid) {
		switch (state) {
			case 0:  //一级节点
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				if(hovid != 1){
					this.drawline(ctx, this.options.caOffset, 0, endy);
				}
				
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius);
				var beginy = this.options.sheight / 2 + this.options.anRadius + this.options.wheight;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;

			case 1:  //二级节点
				this.drawline(ctx, this.options.caOffset, 0, this.options.sheight);
				break;

			case 2: //起始图形 
				this.drawarc(ctx, this.options.caOffset, this.options.beRadius, this.options.beRadius);
				var beginy = this.options.wheight + this.options.beRadius * 2;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;
			case 3:  //以父节点结束
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius);
			case 4:  //以子节点结束
				var endy = this.options.sheight - 2 * this.options.beRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				break;

			case 5:  //悬浮效果非末尾节点 //fNode
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius, this.options.hovid);
				var beginy = this.options.sheight / 2 + this.options.anRadius + this.options.wheight;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;

			case 6: //悬浮效果  //sNode
				this.drawline(ctx, this.options.caOffset, 0, this.options.sheight);
				break;

			case 8:  //绘制焦点图形
				this.drawfocusInco1(ctx, 0, 0, this.options.sheight, 40 - 10);
				break;

			case 9:
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius);
				var beginy = this.options.sheight / 2 + this.options.anRadius + this.options.wheight;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;

			default:
				break;
		}
	}

	//绘制圆形
	Anchor.prototype.drawarc = function (ctx, x, y, r, hov) {
		ctx.strokeStyle = "#F4F4F4";
		ctx.beginPath();
		if (hov) {
			ctx.strokeStyle = 'deepskyblue';
		}
		ctx.arc(x, y, r, 0, Math.PI * 2, true);
		ctx.closePath();
		ctx.stroke();
		if (!hov) {
			ctx.fillStyle = '#E4E4E4';
			ctx.fill();
		} else {
			ctx.fillStyle = 'deepskyblue';
			hov = null;
			ctx.fill();
		}
		return hov;
	};

	//绘制线条
	Anchor.prototype.drawline = function (ctx, x, by, ey)   //x偏移量   起始x 结束x
	{
		ctx.strokeStyle = "#F2F2F2";
		ctx.beginPath();
		ctx.moveTo(x, by);
		ctx.lineTo(x, ey);
		ctx.closePath();
		ctx.stroke();
	};

	//绘制焦点图标
	Anchor.prototype.drawfocusInco = function (ctx, bx, by, height, width) {
		var offsetx = 3;
		//长度为6  俩边长为10的等腰三角形
		//非边界锚点
		ctx.beginPath();
		ctx.strokeStyle = "lightskyblue";
		ctx.fillStyle = "lightskyblue";

		var xr = bx + width - offsetx;
		var yr = by + height / 2;
		ctx.moveTo(xr, yr);
		ctx.lineTo(bx + width - 3 - offsetx, by + height / 2 - 4);
		ctx.lineTo(bx + width - 3 - offsetx, by + height / 2 + 4);
		var bxl = bx + width - 3 - 8 - offsetx;
		var byl = by + height / 2 - 4;
		ctx.fillRect(bxl, byl, 8, 8);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.strokeStyle = '#999';
	};

	Anchor.prototype.drawfocusInco1 = function (ctx, bx, by, height, width) {
		var offsetx = 3;
		//长度为6  俩边长为10的等腰三角形
		//非边界锚点
		ctx.beginPath();
		ctx.fillStyle = "lightblue";
		ctx.strokeStyle = 'lightblue';
		ctx.fillRect(10, 6, 12, 12);
		ctx.fillStyle = "lightblue";
		ctx.moveTo(30, 12);
		ctx.lineTo(22, 6);
		ctx.lineTo(22, 18);
		ctx.closePath();
		ctx.stroke();
		ctx.fill();
		ctx.strokeStyle = '#999';
	};


	//创建单个锚点
	Anchor.prototype.createAnchors = function ($anchorNodes) {
		var that = this;
		var str = "";
		$anchorNodes.each(function (index, item) {
			if (item.getAttribute("anchor-parent")) {
				str = str + that.createsilgnSAnchor(item, index);
				that.anchorNodeArrs.push($(that.createsilgnSAnchor(item, index))[0]) ;
			} else {

				str = str + that.createsilgnFAnchor(item, index);
				that.anchorNodeArrs.push($(that.createsilgnFAnchor(item, index))[0])
			}
		});
		return str;
	};

	//创建一级锚点
	Anchor.prototype.createsilgnSAnchor = function (anchorNode, index) {
		var nodeStr = "<div id='anchor_" + anchorNode.getAttribute("anchor-id") + "' class='signDiv'><div class='canvas_an'><canvas class='canvas' type='sNode' height='25px' width='40px'></canvas></div><div id='" + anchorNode.getAttribute("anchor-id") + "' class='anchor anchor_childDiv' name='anchorNode' anchor-index='" + this.options.anchorIndex + "' type='sNode'>"
			+ "<span class='numspan_s'>" + this.options.anchortitlenum[index] + "</span>"
			+ "<span class='iconspan_s'>  </span>"
			+ "<span class='valSpan_s'>" + anchorNode.getAttribute("anchor-text") + "</span>";
		nodeStr += "</div></div>";
		this.options.anchorIndex++;
		return nodeStr;
	};

	//创建二级锚点
	Anchor.prototype.createsilgnFAnchor = function (anchorNode, index) {
		var nodeStr = "<div id='anchor_" + anchorNode.getAttribute("anchor-id") + "' class='signDiv'><div class='canvas_an'><canvas class='canvas' type='fNode' height='25px' width='40px'></canvas></div><div id='" + anchorNode.getAttribute("anchor-id") + "' class='anchor anchor_childDiv' name='anchorNode' anchor-index='" + this.options.anchorIndex + "' type='fNode'>"
			+ "<span class='numspan_f'>" + this.options.anchortitlenum[index] + "</span>"
			+ "<span class='iconspan_f'>  </span>"
			+ "<span class='valspan_f'>" + anchorNode.getAttribute("anchor-text") + "</span>";
		nodeStr += "</div></div>";
		this.options.anchorIndex++;
		return nodeStr;
	};

	Anchor.prototype.getPdistance = function (locationstr) {
		var pdistancestr = this.checkLocation(locationstr);
		if (!pdistancestr) {
			console.error("localtion param is error!");
		}
		if (pdistancestr.length == 2) {
			var containerClass = "class='";
			if (pdistancestr[0] == "left") {
				containerClass += "mxanchor anchorDiv right' ";
			} else {
				containerClass += "mxanchor anchorDiv left' ";
			}
			var attrStr = "style='";
			if (pdistancestr[0] == "top") {
				attrstr = "top:50px;";
			} else if (pdistancestr[0] == "middle") {
				//计算容器中部位置
				attrStr = getMiddlePos(height);
			} else {
				attrStr = attrStr + "bottom: 95px;";
			}
			attrStr = containerClass + attrStr + "height:" + this.conHeight + "px;" + "width:" + this.conWidth + "px;'";
			return attrStr;
		}
		return null;
	};

	Anchor.prototype.getMiddlePos = function () {
		var pospx = parseInt(this.$el[0].innerHeight / 2) - parseInt(this.conHeight / 2) + "";
		return "top:" + pospx + "px; "
	};

	Anchor.prototype.checkLocation = function (localstr) {
		var str = '';
		var strArrs = localstr == null || localstr.split(" ").length == 0 ? false : localstr.split(" ");
		if (!strArrs) {
			return null;
		}
		if (strArrs.length == 1) {
			if (strArrs[0] == "right" || strArrs[0] == "left") {
				strArrs[1] = "bottom";
			} else {
				return null;
			}
		} else if (strArrs.length == 2) {
			if (strArrs[0] == "right" || strArrs[0] == "left") {
				if (strArrs[1] != "top" && strArrs[1] != "middle" && strArrs[1] != "bottom") {
					return null;
				}
			} else {
				return null;
			}
		}
		var tempStr = strArrs[0] + " " + strArrs[1];
		if (tempStr != this.options.location) {
			this.options.location = tempStr;
		}
		return strArrs;
	};

	Anchor.prototype.getHeight = function (anchorNodes) {
		var anchorHeight = 0;
		if (anchorNodes.length > parseInt(this.options.anchornum)) {
			anchorHeight = parseInt(this.options.anchornum) * this.options.sheight;
		} else {
			anchorHeight = anchorNodes.length * this.options.sheight;
		}
		if (this.options.showbtn) {
			anchorHeight += this.options.btnDivHeight;
		}
		return anchorHeight;
	};
	
	Anchor.prototype.getWidth = function () {
		return 250;
	};

	var old = $.fn.anchor;

	$.fn.anchor = function (option) {
		//合并默认参数
		return this.each(function () {
			var $this = $(this);
			//判断是否初始化的依据
			var data = $this.data('bs.anchor');
			var options = typeof option == 'object' && option;
			if (!data) {   //如果未初始化则进行初始化
				$this.data('bs.anchor', (data = new Anchor(this, options)));
			}
			if (option == 'toggle') {
				
			} else if (option) {
			
			}
		});
	};
	//暴露接口
	$.fn.anchor.Constructor = Anchor;
	$.fn.anchor.defaults = Anchor.DEFAULTS;
	//无冲突处理
	$.fn.anchor.noConflict = function () {
		$.fn.anchor = old;
		return this;
	};
	//事件智能化处理
})(jQuery);
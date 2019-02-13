(function ($) {
	/*
	*	������Զ���
	*	��ʽ����
	*	���������
	*	�пβ����ķ����� �������������
	*   ���ÿɻ���
	*   ����չ
	*	�޳�ͻ����
	*   �¼�������̬��ʼ��
	*/
	//�����ϸ�ģʽ
	'use strict';
	//���������ж�
	var typeBrowser = function () {
	};
	//���캯��
	var Anchor = function (el, options) {
		this.options = $.extend({}, Anchor.defaultParam, Anchor.DEFAULTS, options);
		this.$el = $(el);
		this.$el_ = this.$el.clone();  //��¡�ڵ�
		this.nodeType = this.$el == document ? true : false;
		this.anchorNodeArrs = [] ;
		this.init();
	};
	//Ĭ�ϲ���
	Anchor.DEFAULTS = {
		id: "myanchor",
		showno: true,     //�Ƿ���ʾ�����
		alwayshow: false, //�Ƿ�һֱ��ʾ
		showline: true,	//�Ƿ���ʾ��������
		showbtn: true,	//�Ƿ�ײ���ť
		anchornum: 10,		//��ʾê������
		container: window,   	//ê����������
		style: "frist_style",    	//������ʽ
		location: "left bottom"     //ê��λ��
	};

	Anchor.defaultParam = {
		$focusSiglnDiv: null,
		beRadius: 3,    //��ʼԲ�뾶
		anRadius: 2,	 //һ������뾶
		wheight: 4,
		caOffset: 20,	 //���������ƫ����
		fNodeNum: 1,     //һ���ڵ���ʼ����
		sNodeNum: 1,		//�����ڵ���ʼ����
		focusId: 1000, 	//Ĭ�Ͻ���id
		siglnHeight: 25,   //����ê��
		marginBottom: 0,   //������߾�
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

	//��ʼ������
	Anchor.prototype.init = function () {
		this.initContainer();
		this.addListener();
		this.addonWheelListener();
	};

	Anchor.prototype.addonWheelListener = function () {
		//��ӹ��ֹ����¼�
		var that = this;
		this.options.container.onmousewheel = function (e) {
			//�жϹ������Ƿ��ڶ������ߵײ�
			if (!that.options.flag) {
				var b = $(that.options.container).scrollTop() + $(that.options.container).height() - $(that.options.ownerDocument).height() + 5;
			} else {
				var b = $(that.options.container).height() + that.options.container.scrollTop - that.options.container.scrollHeight + 5;
			}
			if (b >= 0)   //����������ײ�
			{
				console.log("����ײ�") ;
				//alert("����ײ�");
				return;
			} else if ($(that.options.container).scrollTop() == 0) {  //���������ﶥ��
				console.log("����ײ�") ;
				//alert("���ﶥ��");
				return;
			}
			var anchorId = that.getCurrentFocusId();  //��ȡ��ǰ����id
			//�ж�anchorDIV�Ƿ���ڹ����� 
				//�жϵ�ǰ�����Ƿ��ڿ���������
			that.removeFocusAnchor(that.options.$focusSiglnDiv);  //�Ƴ�����״̬
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
		if(top <= 0 || top >= this.$anchor_dDiv.height())  //���ڿ���������
		{
			$node[0].scrollIntoView() ;
		}
	}

	//��ȡ��ǰ����
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
			if (this.options.anchorsObj[i].flag)     //��������
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
		//�¼�
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
				$btn.attr("title", "����ê����") ;
				that.$anchor_dDiv.removeClass("hidden") ;
			}else if($btn.hasClass("fa-list-ul")){

				$btn.attr("class", "fa fa-bars cbtn") ;
				$btn.attr("title", "չ��ê����") ;
				$btn.attr("flag", "false") ;
				that.$anchor_dDiv.addClass("hidden") ;
			}else if($btn.hasClass("fa-angle-double-up")){

				$(that.$anchor_pDiv.find("div[name='anchorNode']")[0]).trigger("click") ;
			}
		}) ;
	}

	//������� ����hoverͼ��
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

	Anchor.prototype.removeHoverState = function ($obj) {    //�������  ���Ƴ�ʼͼ��
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
		
		//focusͼ���ƶ�
		this.$focusInco.hasClass("hidden")?this.$focusInco.removeClass("hidden"):"" ;
		$obj.addClass("focusSighDiv");
		this.options.focusId = $tempNode.attr("id");
		this.options.$focusSiglnDiv = $tempNode.parent();
		$tempNode.addClass("focusAnchor");
		//ˢ�½ڵ����ڵ�topֵ
		this.isInViArea($tempNode) ;
		this.setFocusInconLoc($obj);
		//��ת
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

	//��ת
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


	//��ʼ���ⲿContainer
	Anchor.prototype.initContainer = function () {

		if (this.$container && this.$container.find("div[id='" + this.options.id + "']").length == 1) {
			this.$container.find("div[id='" + this.options.id + "']").remove();
		}
		//��ȡ�ڵ�
		var $anchorNodes = $(this.getAnchorNodes());
		//��װ��λ����Ϣ
		this.options.anchorsObj = this.setLocalInfo($anchorNodes);
		//��װ��ز���
		this.getParam($anchorNodes);
		//����ê�����
		this.setAnchorTitleNums($anchorNodes);
		//�����ⲿpDiv
		this.$el.prepend(this.createDataDiv($anchorNodes));
		//����btn����
		//���Ʊ����
		this.drawLeftIcon();
		this.$container = this.$el.find("div[id='" + this.options.id + "']");
		this.$showBtn = this.createBtn()?this.$container.append($(this.createBtn())):"" ;
		this.$anchor_pDiv = this.$container.find("#anchor_pDiv");
		this.$anchor_dDiv = this.$container.find("#anchor_DataDiv");
		//������ʼ��־
		this.drawbeginAndEndInco() ;
		//��ʼ��
		//���ƽ���ͼ��
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
		"<i class='fa fa-list-ul cbtn' aria-hidden='true' title='�رձ�ǩ��' style='font-size: 25px;' flag='true'></i>" +
		"<i class='fa fa-angle-double-up cbtn' aria-hidden='true' title='�ص�����' style='font-size: 30px;'></i>" +
		"</div>";
	} ;
	
	Anchor.prototype.initFocusIcon = function () {
		this.$focusInco = this.$anchor_dDiv.find("div[id='anchor_focus']");
		var context = this.$focusInco.find("canvas")[0].getContext('2d');
		context.clearRect(0, 0, 40, this.options.sheight);
		this.drawbeCanvas(context, 8);
	};

	//���ý���ͼ���λ��
	Anchor.prototype.setFocusInconLoc = function ($focusSiglnNode) {  //����DIVd����
		var $showAnchors = this.anchorSiglnDiv();
		var top = this.options.$focusSiglnDiv.offset().top - this.$anchor_dDiv.offset().top;

		this.$focusInco.animate({ top: top + "px" }, { queue: false });    //����Ч�������в���
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
			+ "<i class='fa fa-list-ul' aria-hidden='true'title='�رձ�ǩ��' style='font-size:25px'>"
			+ "</div>";
	};

	//����ê�����
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

	//��ȡdom��ê���ǩ
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

	//����
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
		//this.right = this.getRightMar() ;   //frame�����Ԫ�ط�����Ҫ����
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
			if (index == 0) {//��ʼԲ��
				//that.drawbeCanvas(context, 2);

			} else if (index == canvasNodes.length - 1) {//����Բ��
				if ($(item).attr("type") == "fNode") {
					that.drawbeCanvas(context, 3);
				} else if ($(item).attr("type") == "sNode") {
					that.drawbeCanvas(context, 4);
				}
			} else {
				if ($(item).attr("type") == "fNode")   //����Բ��
				{
					that.drawbeCanvas(context, 0, index);
				} else if ($(item).attr("type") == "sNode") {   //��������
					that.drawbeCanvas(context, 1);
				}
			}
		});
	};

	//������ʼ�ڵ�
	Anchor.prototype.drawbeCanvas = function (ctx, state, hovid) {
		switch (state) {
			case 0:  //һ���ڵ�
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				if(hovid != 1){
					this.drawline(ctx, this.options.caOffset, 0, endy);
				}
				
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius);
				var beginy = this.options.sheight / 2 + this.options.anRadius + this.options.wheight;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;

			case 1:  //�����ڵ�
				this.drawline(ctx, this.options.caOffset, 0, this.options.sheight);
				break;

			case 2: //��ʼͼ�� 
				this.drawarc(ctx, this.options.caOffset, this.options.beRadius, this.options.beRadius);
				var beginy = this.options.wheight + this.options.beRadius * 2;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;
			case 3:  //�Ը��ڵ����
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius);
			case 4:  //���ӽڵ����
				var endy = this.options.sheight - 2 * this.options.beRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				break;

			case 5:  //����Ч����ĩβ�ڵ� //fNode
				var endy = this.options.sheight / 2 - this.options.anRadius - this.options.wheight;
				this.drawline(ctx, this.options.caOffset, 0, endy);
				this.drawarc(ctx, this.options.caOffset, this.options.sheight / 2, this.options.anRadius, this.options.hovid);
				var beginy = this.options.sheight / 2 + this.options.anRadius + this.options.wheight;
				this.drawline(ctx, this.options.caOffset, beginy, this.options.sheight);
				break;

			case 6: //����Ч��  //sNode
				this.drawline(ctx, this.options.caOffset, 0, this.options.sheight);
				break;

			case 8:  //���ƽ���ͼ��
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

	//����Բ��
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

	//��������
	Anchor.prototype.drawline = function (ctx, x, by, ey)   //xƫ����   ��ʼx ����x
	{
		ctx.strokeStyle = "#F2F2F2";
		ctx.beginPath();
		ctx.moveTo(x, by);
		ctx.lineTo(x, ey);
		ctx.closePath();
		ctx.stroke();
	};

	//���ƽ���ͼ��
	Anchor.prototype.drawfocusInco = function (ctx, bx, by, height, width) {
		var offsetx = 3;
		//����Ϊ6  ���߳�Ϊ10�ĵ���������
		//�Ǳ߽�ê��
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
		//����Ϊ6  ���߳�Ϊ10�ĵ���������
		//�Ǳ߽�ê��
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


	//��������ê��
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

	//����һ��ê��
	Anchor.prototype.createsilgnSAnchor = function (anchorNode, index) {
		var nodeStr = "<div id='anchor_" + anchorNode.getAttribute("anchor-id") + "' class='signDiv'><div class='canvas_an'><canvas class='canvas' type='sNode' height='25px' width='40px'></canvas></div><div id='" + anchorNode.getAttribute("anchor-id") + "' class='anchor anchor_childDiv' name='anchorNode' anchor-index='" + this.options.anchorIndex + "' type='sNode'>"
			+ "<span class='numspan_s'>" + this.options.anchortitlenum[index] + "</span>"
			+ "<span class='iconspan_s'>  </span>"
			+ "<span class='valSpan_s'>" + anchorNode.getAttribute("anchor-text") + "</span>";
		nodeStr += "</div></div>";
		this.options.anchorIndex++;
		return nodeStr;
	};

	//��������ê��
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
				//���������в�λ��
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
		//�ϲ�Ĭ�ϲ���
		return this.each(function () {
			var $this = $(this);
			//�ж��Ƿ��ʼ��������
			var data = $this.data('bs.anchor');
			var options = typeof option == 'object' && option;
			if (!data) {   //���δ��ʼ������г�ʼ��
				$this.data('bs.anchor', (data = new Anchor(this, options)));
			}
			if (option == 'toggle') {
				
			} else if (option) {
			
			}
		});
	};
	//��¶�ӿ�
	$.fn.anchor.Constructor = Anchor;
	$.fn.anchor.defaults = Anchor.DEFAULTS;
	//�޳�ͻ����
	$.fn.anchor.noConflict = function () {
		$.fn.anchor = old;
		return this;
	};
	//�¼����ܻ�����
})(jQuery);
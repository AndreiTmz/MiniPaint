 var canvas, canvasWidth, canvasHeight, ctx,currentColor, currentWidth, options, scaleOptions;
var currentTool = "";
var fileKeeper;
var image;
var tools = [];

//pencilTools
var pencilTrack = [];
var pencilStartX,pencilStartY;

// //lineTool
var lineStartX,lineStartY,lineEndX,lineEndY;
var currentLineX,currentLineY;
var lines = [];

//rectangleTool
var recStartX, recStartY, recStartFinalX, recStartFinalY, recCurrentWidth, recCurrentHeight;
var rectangles = [];

//squareTool
var squareStartX,squareStartY,squareSideLength;
var squares = [];

//circleTool
var initX,initY,circleCenterX, circleCenterY,circleRadiusX,circleRadiusY;
var circles = [];
var perfectCircle,circleInfo;
var radXSpan,radYSpan;

//selection tool
var selection = {}, selectionInitX,selectionInitY,selectionStartX, selectionStartY;
var mouseOffsetXInsideSelection, mouseOffsetYInsideSelection;
var finalSelectionLocation = {}; 
var selectionMovementHistory = [];

//crop tool
var cropRect = {}, cropContent, cropX, cropY, cropButton;
var updatingCropRect = false;
var cropCursor = {};
var side;

//sounds
var soundOn = false;
var pencilSound, lineSound;

window.ondragover = function(ev) 
{
	ev.preventDefault();
	clearCanvas(true);
}
window.ondrop = function(ev) 
{
	ev.preventDefault(); 
	fileKeeper = ev.dataTransfer.files[0];
	image = document.createElement("IMG");
	image.src = (window.webkitURL ? webkitURL : URL).createObjectURL(fileKeeper);
	image.addEventListener('load',function() {
		loadImageToCanvas();
	});
	
	//loadImageToCanvas(fileKeeper); 
}

window.onresize = function(){
	// canvasDrawing = ctx.getImageData(0,0,canvas.width,canvas.height);
	setCanvasDim();
	redrawCanvas();
	// ctx.clearRect(0,0,canvas.width,canvas.height);

	// loadImageToCanvas();
	//ctx.putImageData(canvasDrawing,0,0);
}

function initSounds()
{
	pencilSound = document.createElement('audio');
	pencilSound.src = 'media/sounds/pencil.mp3';
	lineSound = document.createElement('audio');
	lineSound.src = "media/sounds/line.mp3";
}

window.onload = function(){

	tools = document.getElementsByClassName("tool");
	var mousePressed = false;
	canvas = document.getElementById("canvas");
	ctx = canvas.getContext("2d");	
	radXSpan = document.getElementById("radiusX");
	radYSpan = document.getElementById("radiusY");
	perfectCircle  = document.getElementById("circle");
	circleInfo = document.getElementById("circleInfo");
	options = document.getElementById("options");
	scaleOptions = document.getElementById("scale-options");
	cropButton = document.getElementById("crop");
	initSounds();
	setCanvasDim();
	canvas.oncontextmenu = function(e){
		e.preventDefault();
	}

	canvas.addEventListener("mousedown",function(e){
		mousePressed = true;
		currentColor = document.getElementById("lineColor").value;
		currentWidth = document.getElementById("lineWidth").value;
		if(currentTool == "pencil")
		{
			pencilStartX = e.pageX - this.offsetLeft;
			pencilStartY = e.pageY - this.offsetTop;		
			addPencilDetails(pencilStartX,pencilStartY,false);
			// redrawCanvas();			
		}
		else if(currentTool == "line")
		{
			lineStartX = e.pageX - this.offsetLeft;
			lineStartY = e.pageY - this.offsetTop;	
		}
		else if(currentTool == "rectangle")
		{
			recStartX = e.pageX - this.offsetLeft;
			recStartY = e.pageY - this.offsetTop;
		}
		else if( currentTool == "selection")
		{
			selectionInitX = e.pageX - this.offsetLeft;
			selectionInitY = e.pageY - this.offsetTop;
			if(selection.active == true)
			{				
				if(selectionInitX > selection.x && selectionInitY > selection.y &&
				 selectionInitX < (selection.x + selection.width) && selectionInitY < (selection.y + selection.height)) //check if mousedown inside selection
				{					
					//get mouse offset inside selection
					mouseOffsetXInsideSelection = selectionInitX - selection.x;
					mouseOffsetYInsideSelection = selectionInitY - selection.y;
					selection.content = ctx.getImageData(selection.x,selection.y,selection.width,selection.height);
					currentTool = "move";
				}
				else
				{
					currentTool = "selection";
					redrawCanvas();
					selection.active = false;
				}
			}			
		}
		else if(currentTool == "move")
		{
			let currentX = e.pageX - this.offsetLeft;
			let currentY = e.pageY - this.offsetTop;
			selectionInitX = currentX;
			selectionInitY = currentY;
			if(finalSelectionLocation.active)
			{
				//check if mousedown is inside selection or outside
				if(currentX < finalSelectionLocation.x || currentX > (finalSelectionLocation.x + finalSelectionLocation.width) || 
					(currentY < finalSelectionLocation.y || currentY > (finalSelectionLocation.y + finalSelectionLocation.height)))
				{
					//outside
					finalSelectionLocation.content = ctx.getImageData(selection.x + 2,selection.y + 2,
						selection.width -4 , selection.height -4);
					selectionMovementHistory.push(finalSelectionLocation);
					redrawCanvas();
					finalSelectionLocation.active = false;
					selection.active = false;
					currentTool = "selection";
				}
				else
				{
					//inside
					mouseOffsetXInsideSelection = currentX - finalSelectionLocation.x;
					mouseOffsetYInsideSelection = currentY - finalSelectionLocation.y;
				}
			}
		}
		else if(currentTool == "circle")
		{
			initX = e.pageX - this.offsetLeft;
			initY = e.pageY - this.offsetTop;
		}
		else if(currentTool == "crop")
		{
			if(cropCursor.y > cropRect.y && cropCursor.y < cropRect.y + cropRect.height)
			{
				if(cropCursor.x == cropRect.x)
				{
					side = 'left';
					updatingCropRect = true;
				}
				else if(cropCursor.x == cropRect.x + cropRect.width)
				{
					side = 'right';
					updatingCropRect = true;
				}
			}
			else if(cropCursor.x > cropRect.x && cropCursor.x < cropRect.x + cropRect.width)
			{
				if(cropCursor.y == cropRect.y)
				{
					side = 'top';
					updatingCropRect = true;
				}
				else if(cropCursor.y == cropRect.y + cropRect.height)
				{
					side = 'bottom';
					updatingCropRect = true;
				}
			}
			else
			{
				updatingCropRect = false;
			}

		}
		else if(currentTool == "eraser")
		{
			var startX = e.pageX - this.offsetLeft;
			var startY = e.pageY - this.offsetTop;			
			currentColor = "white";
			addPencilDetails(startX,startY);
			redrawCanvas();
		}
		
	});

	canvas.addEventListener("mousemove",function(e)
	{ 
		if(currentTool == "pencil")
		{
			var currentX = e.pageX - this.offsetLeft;
			var currentY = e.pageY - this.offsetTop;
			
			if(mousePressed)
			{
				addPencilDetails(currentX,currentY,true);
		
			 	ctx.lineTo(currentX,currentY);
				ctx.stroke(); 
				
				if(soundOn)
				{
					pencilSound.play();
				}

			 	redrawCanvas();
			}

		}
		else if(currentTool == "line")
		{ 

			 currentLineX = e.pageX - this.offsetLeft;
			 currentLineY = e.pageY - this.offsetTop;
			 canvas.style.cursor = "crosshair";
			 if(mousePressed)
			 {
			 	ctx.clearRect(0,0,canvas.width,canvas.height);
			 	redrawCanvas();
			 	// loadImageToCanvas(fileKeeper);
			 	ctx.beginPath();
			 	ctx.moveTo(lineStartX,lineStartY);
			 	ctx.lineTo(currentLineX,currentLineY);
			 	ctx.strokeStyle = currentColor;
			 	ctx.lineWidth = currentWidth;
			 	ctx.lineCap = "round";
			 	ctx.stroke(); 
			 	if(soundOn)
				{
					lineSound.play();
				}
			 	// redrawCanvas();

			 }
		}
		else if(currentTool == "rectangle")
		{
			canvas.style.cursor = "crosshair";

			if(mousePressed)
			{
				//current cursor position
				var currentX = e.pageX - this.offsetLeft;
				var currentY = e.pageY - this.offsetTop;
				
				recCurrentWidth = Math.abs(currentX - recStartX);
				recCurrentHeight =  Math.abs(currentY - recStartY);

				ctx.clearRect(0,0,canvas.width,canvas.height);
				redrawCanvas();
				recStartFinalX = Math.min(recStartX,currentX);
				recStartFinalY = Math.min(recStartY,currentY);

				ctx.strokeStyle = currentColor;
				ctx.lineWidth = currentWidth;	
				
				ctx.strokeRect(recStartFinalX,recStartFinalY,recCurrentWidth,recCurrentHeight);
				//ctx.strokeRect();

			}
		}
		else if(currentTool == "selection")
		{			
			canvas.style.cursor = "crosshair";
				if(mousePressed)
				{
					//current cursor position
					var currentX = e.pageX - this.offsetLeft;
					var currentY = e.pageY - this.offsetTop;
					
					selectionStartX = Math.min(selectionInitX,currentX);
					selectionStartY = Math.min(selectionInitY,currentY);

					selectionCurrentWidth = Math.abs(currentX - selectionInitX);
					selectionCurrentHeight =  Math.abs(currentY - selectionInitY);

					ctx.clearRect(0,0,canvas.width,canvas.height);
					redrawCanvas();
					

					ctx.setLineDash([5,3]);	
					ctx.strokeStyle = "#aaaaaa";
					ctx.lineWidth = "4";
					ctx.strokeRect(selectionStartX,selectionStartY,selectionCurrentWidth,selectionCurrentHeight);
				}							
		}
		else if(currentTool == "move")
		{
			canvas.style.cursor = "move";
			let currentX = e.pageX - this.offsetLeft;
			let currentY = e.pageY - this.offsetTop;

			if(mousePressed)
			{
				redrawCanvas();
				let x = currentX - mouseOffsetXInsideSelection;
				let y = currentY - mouseOffsetYInsideSelection;
				ctx.putImageData(selection.content,x,y);
			}
			
		}
		else if(currentTool == "circle")
		{
			canvas.style.cursor = "crosshair";
			var currentX = e.pageX - this.offsetLeft;
			var currentY = e.pageY - this.offsetTop;

			if(mousePressed)
			{
				circleCenterX = Math.abs((initX + currentX)/2);
				circleCenterY = Math.abs((initY + currentY)/2);

				circleRadiusX = Math.floor(Math.abs((currentX - initX) /2));
				circleRadiusY = Math.floor(Math.abs((currentY - initY)/2));

				radXSpan.innerHTML = circleRadiusX;
				radYSpan.innerHTML = circleRadiusY;

				if(circleRadiusX == circleRadiusY)
				{
					perfectCircle.innerHTML = "Yes";
				}
				else
				{
					perfectCircle.innerHTML = "No";
				}
				ctx.clearRect(0,0,canvas.width,canvas.height);
				redrawCanvas();

				ctx.strokeStyle = currentColor;
				ctx.lineWidth = currentWidth;
				ctx.beginPath();
				ctx.ellipse(circleCenterX,circleCenterY,circleRadiusX,circleRadiusY,0, 0, 2 * Math.PI);				
				ctx.stroke();							
			}
		}
		else if(currentTool == "crop")
		{

			cropCursor.x = e.pageX - this.offsetLeft;
			cropCursor.y = e.pageY - this.offsetTop;

			if(mousePressed)
			{
				if(updatingCropRect)
				{
					if(side == 'left')
					{
						cropRect.x = cropCursor.x;
						cropRect.width = cropRect.initW + (cropRect.initX - cropCursor.x);
					}
					else if(side == 'top')
					{
						cropRect.y = cropCursor.y;
						cropRect.height = cropRect.initH + (cropRect.initY - cropRect.y);
					}
					else if(side == 'right')
					{
						cropRect.width = cropCursor.x - cropRect.x;	
					}
					else if(side == 'bottom')
					{
						cropRect.height = cropCursor.y - cropRect.y;	
					}
					redrawCanvas();
					ctx.fillStyle = "rgba(120,120,120,0.2)";
					ctx.strokeStyle = "black";
					ctx.lineWidth = 4;
					ctx.fillRect(cropRect.x,cropRect.y,cropRect.width,cropRect.height);	
					ctx.strokeRect(cropRect.x,cropRect.y,cropRect.width,cropRect.height);					
				}
			}	
			else
			{	
				 if(cropCursor.y > cropRect.y && cropCursor.y < cropRect.y + cropRect.height && 
				 	(cropCursor.x == cropRect.x || cropCursor.x == cropRect.x + cropRect.width))
				{
					canvas.style.cursor = "ew-resize";
				}
				else if(cropCursor.x > cropRect.x && cropCursor.x < cropRect.x + cropRect.width && 
					(cropCursor.y == cropRect.y || cropCursor.y == cropRect.y + cropRect.height))
				{
					canvas.style.cursor = "ns-resize";	
				}
				else
				{
					canvas.style.cursor = "default";
				}
			}
			
		}
		else if(currentTool == "eraser")
		{
			var currentX = e.pageX - this.offsetLeft;
			var currentY = e.pageY - this.offsetTop;
			currentColor = "white";
			if(mousePressed)
			{
				addPencilDetails(currentX,currentY,true);
				redrawCanvas();
			}
		}
		else 
		{
			canvas.style.cursor = "default";
		}
	});
	canvas.addEventListener("mouseup",function(e){
			
		mousePressed = false;
			if(currentTool == "pencil")
			{
				if(!pencilSound.paused)
				{
					pencilSound.pause();
				}
			}
			else if(currentTool == "line")
			{
				let endLineX = e.pageX - this.offsetLeft;
				let endLineY = e.pageY - this.offsetTop;	

				let currentLine = {};
				currentLine.startX = lineStartX;
				currentLine.startY = lineStartY;
				currentLine.endX = endLineX;
				currentLine.endY = endLineY;
				currentLine.width = currentWidth;
				currentLine.color = currentColor;
				lines.push(currentLine); 

				// if(soundOn)
				// {
				// 	lineSound.play();
				// }
				
			}
			else if(currentTool == "rectangle")
			{
				let currentRec = {};
				currentRec.x = recStartFinalX;
				currentRec.y = recStartFinalY;
				currentRec.width = recCurrentWidth;
				currentRec.height = recCurrentHeight;
				currentRec.color = currentColor;
				currentRec.lineWidth = currentWidth;

				rectangles.push(currentRec);
			}
			else if(currentTool == "selection")
			{
				selection = {};
				selection.x = selectionStartX;
				selection.y = selectionStartY;
				selection.width = selectionCurrentWidth;
				selection.height = selectionCurrentHeight;	
				selection.color = "#aaaaaa";
				selection.lineWidth = "4";
				selection.active = true;
			}
			else if(currentTool == "move")
			{
				let finalLocationX = e.pageX - this.offsetLeft;
				let finalLocationY = e.pageY - this.offsetTop;
				redrawCanvas();
				ctx.putImageData(selection.content,finalLocationX - mouseOffsetXInsideSelection, finalLocationY - mouseOffsetYInsideSelection);
				finalSelectionLocation = {};
				finalSelectionLocation.active = true;
				finalSelectionLocation.x = finalLocationX - mouseOffsetXInsideSelection;
				finalSelectionLocation.y = finalLocationY - mouseOffsetYInsideSelection;
				finalSelectionLocation.width = selection.width;
				finalSelectionLocation.height = selection.height;
			}
			else if(currentTool == "circle")
			{
				let circle = {};
				circle.centerX = circleCenterX;
				circle.centerY = circleCenterY;
				circle.radiusX = circleRadiusX;
				circle.radiusY = circleRadiusY;
				circle.width = currentWidth;
				circle.color = currentColor;
				circles.push(circle);
				radXSpan.innerHTML = radYSpan.innerHTML = "-";
			}
			else if(currentTool == "crop")
			{
				cropRect.initX = cropRect.x;
				cropRect.initY = cropRect.y;
				cropRect.initW = cropRect.width;
				cropRect.initH = cropRect.height;
				updatingCropRect = false;
			}
	});
// 	canvas.addEventListener("mouseleave",function(){
// 			mousePressed = false;

// 			 if(currentTool == "circle" || currentTool == "rectangle")
// 			 {
// 			 	redrawCanvas();
// 			 }	
// 	});
}

//responsive canvas
function setCanvasDim()
{
	canvasWidth = 0.6*document.body.clientWidth;
	canvasHeight = 0.8*document.body.clientHeight;
	canvas.setAttribute("width",canvasWidth);
	canvas.setAttribute("height",canvasHeight);
	// redrawCanvas();
}
// var droppedImage;
//loading image to canvas
function loadImageToCanvas()
{	
	// if(file)
	// {
	// 	 droppedImage = new Image();		
	// 	// URL @ Mozilla, webkitURL @ Chrome
	// 	droppedImage.src = (window.webkitURL ? webkitURL : URL).createObjectURL(file);
	// 	droppedImage.onload = function() 
	// 	{
	//    		ctx.drawImage(droppedImage, 0, 0, droppedImage.width, droppedImage.height, 0, 0, canvas.width, canvas.height); // stretch the image
	// 	}
		
	// }
	if(image)
	{
		ctx.drawImage(image, 0,0,canvas.width,canvas.height);
	}
}

//toggle tools
function togglePencil(pencil)
{
	if(!pencil.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		pencil.classList.add("activeTool");
		currentTool = "pencil";
		circleInfo.style.display = "none";
		options.style.display = "block";
		scaleOptions.style.display = "none";
		cropButton.style.display = "none";
	}
	else
	{
		pencil.classList.remove("activeTool");
		currentTool = "";
	}	
	redrawCanvas();
}

function toggleLine(line)
{
	if(!line.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		line.classList.add("activeTool");
		currentTool = "line";
		circleInfo.style.display = "none";
		options.style.display = "block";
		scaleOptions.style.display = "none";
		cropButton.style.display = "none";
	}
	else
	{
		line.classList.remove("activeTool");
		currentTool = "";
	}
	redrawCanvas();
}

function toggleCircle(circle)
{
	
	if(!circle.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		circle.classList.add("activeTool");
		currentTool = "circle";
		circleInfo.style.display = "block";
		options.style.display = "block";
		scaleOptions.style.display = "none";
		cropButton.style.display = "none";
	}
	else
	{
		circle.classList.remove("activeTool");
		currentTool = "";
	}
	redrawCanvas();
}
function toggleSelection(selection)
{
	if(!selection.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		selection.classList.add("activeTool");
		currentTool = "selection";
		circleInfo.style.display = "none";
		options.style.display = "block";
		scaleOptions.style.display = "none";
		cropButton.style.display = "none";
	}
	else
	{
		selection.classList.remove("activeTool");
		currentTool = "";
	}
	redrawCanvas();
}
function toggleRectangle(rectangle)
{
	if(!rectangle.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		rectangle.classList.add("activeTool");
		currentTool = "rectangle";
		circleInfo.style.display = "none";
		options.style.display = "block";
		scaleOptions.style.display = "none";
		cropButton.style.display = "none";
	}
	else
	{
		rectangle.classList.remove("activeTool");
		currentTool = "";
	}
	redrawCanvas();
}
function toggleEraser(eraser)
{
	if(!eraser.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		eraser.classList.add("activeTool");
		currentTool = "eraser";
		circleInfo.style.display = "none";
		options.style.display = "block";
		scaleOptions.style.display = "none";
		cropButton.style.display = "none";
	}
	else
	{
		eraser.classList.remove("activeTool");
		currentTool = "";
	}
	redrawCanvas();
}

function toggleCrop(crop)
{
	if(!crop.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		crop.classList.add("activeTool");
		currentTool = "crop";
		cropRect.initX = cropRect.x = 20;
		cropRect.initY = cropRect.y = 20;
		cropRect.initW =  cropRect.width = canvas.width - 40;
		cropRect.initH = cropRect.height = canvas.height - 40;

		ctx.fillStyle = "rgba(120,120,120,0.2)";
		ctx.lineWidth = 4;
		ctx.strokeStyle = "black";
		ctx.fillRect(cropRect.x,cropRect.y,cropRect.width,cropRect.height);
		ctx.strokeRect(cropRect.initX,cropRect.initY,cropRect.initW,cropRect.initH);

		options.style.display = "block";
		scaleOptions.style.display = "none";

		cropButton.style.display = "block";
	}
	else
	{
		redrawCanvas();
		cropButton.style.display = "none";
		crop.classList.remove("activeTool");
		currentTool = "";
	}
}

function toggleScale(scale)
{
	if(!scale.classList.contains("activeTool"))
	{
		for(let i=0;i<tools.length;i++)
		{
			tools[i].classList.remove("activeTool");
		}
		scale.classList.add("activeTool");
		currentTool = "crop";
		options.style.display = "none";
		scaleOptions.style.display = "block";
	}
	else
	{
		scale.classList.remove("activeTool");
		currentTool = "";
		options.style.display = "block";
		scaleOptions.style.display = "none";
	}
	redrawCanvas();
}

function finishCropping()
{
	redrawCanvas();
	cropContent = ctx.getImageData(cropRect.x,cropRect.y,cropRect.width,cropRect.height);
	clearCanvas();
	cropX = canvas.width/2 - cropRect.width/2;
	cropY = canvas.height/2 - cropRect.height/2;
	ctx.putImageData(cropContent,cropX,cropY);
}

function soundOnOff(soundIcon)
{
	if(soundIcon.getAttribute("src") == "media/images/soundOn.jpg")
	{
		soundIcon.setAttribute("src","media/images/soundOff.jpg") ;
		soundOn = false;
	}
	else
	{
		soundIcon.setAttribute("src","media/images/soundOn.jpg") ;
		soundOn = true;
	}
}

// //pencil related functions
function drawPencilHistory() 
{
	
  	ctx.lineJoin = "round";
  	
  	for(let i=0;i<pencilTrack.length;i++)
  	{
  		ctx.beginPath();

  		if(pencilTrack[i].drag)
  		{
  			ctx.moveTo(pencilTrack[i-1].x,pencilTrack[i-1].y);
  		}
  		else
  		{
  			ctx.moveTo((pencilTrack[i]-1).x,pencilTrack[i].y);
  		}
  		ctx.lineTo(pencilTrack[i].x,pencilTrack[i].y);
  		ctx.closePath();
  		ctx.lineWidth = pencilTrack[i].width;
  		ctx.strokeStyle = pencilTrack[i].color;
  		ctx.stroke();	
  	}
}

function addPencilDetails(x,y,d) // x,y - coordinates, d - dragging
{
	var dot = {};
	dot.x = x;
	dot.y = y;
	dot.drag = d;
	dot.color = currentColor;
	dot.width = currentWidth;
	pencilTrack.push(dot);
}

//line related functions
function drawLineHistory()
{
	for(let i = 0;i<lines.length;i++)
	{
		ctx.beginPath();
		ctx.strokeStyle = lines[i].color;
		ctx.lineWidth = lines[i].width;
		ctx.lineCap = "round";
		ctx.moveTo(lines[i].startX,lines[i].startY);
		ctx.lineTo(lines[i].endX,lines[i].endY);
		ctx.stroke();
	}
}

function drawRectangleHistory()
{
	for(let i=0;i<rectangles.length;i++)
	{
		ctx.beginPath();
		ctx.strokeStyle = rectangles[i].color;
		ctx.lineWidth = rectangles[i].lineWidth;
		ctx.strokeRect(rectangles[i].x,rectangles[i].y,rectangles[i].width,rectangles[i].height);
	}
}
function drawCircleHistory()
{
	for(let i=0;i<circles.length;i++)
	{
		ctx.beginPath();
		ctx.ellipse(circles[i].centerX,circles[i].centerY,circles[i].radiusX,circles[i].radiusY,0,0,2 * Math.PI);
		ctx.strokeStyle = circles[i].color;
		ctx.lineWidth = circles[i].width;
		ctx.stroke();
	}
}

function drawSelectionHistory()
{
	for(finalSelectionLocation of selectionMovementHistory)
	{
		ctx.putImageData(finalSelectionLocation.content,finalSelectionLocation.x + 2,finalSelectionLocation.y + 2);
	}
}

function scale()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.scale(1.1,1.3);
	redrawCanvas();
}
function reset()
{
	ctx.clearRect(0,0,canvas.width,canvas.height);
	ctx.scale(0.9,0.7);
	redrawCanvas();

}

function redrawCanvas(){

	ctx.clearRect(0,0,canvas.width,canvas.height);
	if(cropContent)
	{
		ctx.putImageData(cropContent,cropX,cropY);
	}
	
	loadImageToCanvas();
	ctx.setLineDash([1,0]);
	drawPencilHistory(); // all coordinates added
    drawLineHistory(); //all start and end coordinates
	drawRectangleHistory(); //start coords (upper left corner), width, height
	drawCircleHistory();
	drawSelectionHistory();// center coords, radius
	// + current color (strokeStyle) and width

}

function saveImage()
{
	let saveImage = document.getElementById('saveImage');
	saveImage.addEventListener('click', function(ev) {
    saveImage.href = canvas.toDataURL();
    saveImage.download = "myedit.jpg";
}, false);
}

//clear canvas and all the history
function clearCanvas(includeCrop = false)
{
	pencilTrack = [];
	lines = [];
	rectangles = [];
	circles = [];
	fileKeeper = null;	
	image = null;
	selectionContentHistory = [];

	if(includeCrop)
	{
		cropRect = {};
		cropContent = null;
	}

	ctx.clearRect(0,0,canvas.width,canvas.height);
}



/*
crop tool

cand dam click pe crop se deseneaza un cropRect la coordonate prestabilite (la o anumita distanta de marginea canvas-ului)

if current tool crop
	la mousedown se verifica daca mouse-ul este la coordonatele uneia dintre laturile cropRect
			daca da => cropping = true else cropping = false
	la mousemove 
		if cropping true se modifica dimensiunile cropRect{
			se retine latura pe care s-a dat click initial (la mousedown)

			daca e latura din stanga => cropRect.x se modifica la coordonatele curente si cropRect.width se modifica
			la cropRect.width initial +- diferenta dintre cropRect.x initial si x curent
	

		}, altfel  se modifica cursorul
	la mouseup cropping = false -> cropRect ramane vizibil



*/
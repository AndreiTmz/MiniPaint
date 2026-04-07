document.addEventListener("DOMContentLoaded",app);

function app()
{
	const canvas = document.querySelector("canvas");
	const clearCanvas = document.getElementById("clearCanvas");
	const context = canvas.getContext("2d", { willReadFrequently: true });
	context.lineCap = "round";
	const tools = document.getElementsByClassName("tool");
	const color = document.querySelector("#color");
	var currentTool = "pencil";
	var isMouseDown = 0;
	var width = 5;
	context.lineWidth = width;
	const buttonSound = document.createElement("audio");
	buttonSound.src = "media/sounds/button.mp3";

	const pencilSound = document.createElement("audio");
	pencilSound.src = "media/sounds/pencil.mp3";
	
	const lineSound = document.createElement("audio");
	lineSound.src = "media/sounds/line.mp3";

	const toggleSound = document.querySelector("#toggleSound");
	const soundOffImgPath = "media/images/soundOff.jpg";
	const soundOnImgPath = "media/images/soundOn.jpg";
	var isSoundOn = true;
	
	const saveBtn = document.getElementById('saveImage');

	for(let i = 0; i < tools.length; i++) {
		tools[i].addEventListener("click", function() {
			if (isSoundOn) {
				buttonSound.currentTime = 0;
				buttonSound.play();
			}
			
			let toolName = tools[i].name;
			if (toolName != "clearCanvas" && toolName != "toggleSound" && toolName != "saveImage") {
				currentTool = tools[i].name;
				var activeElement = document.getElementsByClassName("active")[0];
				if (activeElement !== null && activeElement !== undefined) activeElement.classList.toggle("active");
				tools[i].classList.add("active");
			}
			
			context.strokeStyle = color.value;
		});
	}

	var canvasContent = context.getImageData(0, 0, canvas.width, canvas.height);
	var pencil = {};
	var eraser = {};
	var line = {};
	var ellipse = {};
	var rectangle = {};

	const widthRange = document.querySelector("#width");
	const widthRangeLabel = document.querySelector("#widthRangeLabel");

	color.onchange = function(){
		context.strokeStyle = this.value;
	}
	
	widthRange.onchange = function(e)
	{
		width = this.value;
		context.lineWidth = width;
		widthRangeLabel.innerText = e.target.value;
	}

	canvas.onmousedown = function(e){
		isMouseDown = 1;
		let x,y;
		x = e.pageX - this.getBoundingClientRect().left;
		y = e.pageY - this.getBoundingClientRect().top;

		switch(currentTool)
		{
			case "pencil":
			{
				if (isSoundOn) {
					pencilSound.play();
				}
				pencil = {x0:x, y0:y};
				context.beginPath();
				context.moveTo(pencil.x, pencil.y);
				break;
			}
			case "eraser":
			{
				eraser = {x0:x, y0:y};
				context.beginPath();
				context.moveTo(eraser.x, eraser.y);
				break;
			}
			case "line":
			{
				line = {x0 :x, y0 :y};
				context.moveTo(line.x0, line.y0);
				break;
			}
			case "ellipse": {
				ellipse = { x0: x, y0: y };
				isMouseDown = true;
			}
			case "rectangle":
			{
				rectangle = {x0:x, y0:y};
				break;	
			}
		}
	}

	canvas.onmousemove = function(e){
		let x,y;
		x = e.pageX - this.getBoundingClientRect().left;
		y = e.pageY - this.getBoundingClientRect().top;

		switch(currentTool)
		{
			case "pencil":
			{
				if(isMouseDown === 1)
				{
					pencil.xc = e.pageX - this.getBoundingClientRect().left;
					pencil.yc = e.pageY - this.getBoundingClientRect().top;
					context.lineTo(pencil.xc, pencil.yc);
					context.stroke();
					pencil.x0 = pencil.xc;
					pencil.y0 = pencil.yc;
				}
				
				break;
			}
			case "eraser":
			{
				if(isMouseDown === 1)
				{
					eraser.xc = e.pageX - this.getBoundingClientRect().left;
					eraser.yc = e.pageY - this.getBoundingClientRect().top;
					context.lineTo(eraser.xc, eraser.yc);
					context.strokeStyle = "#fff";
					context.stroke();
					eraser.x0 = eraser.xc;
					eraser.y0 = eraser.yc;
				}
				
				break;
			}
			case "line":
			{					
				if(isMouseDown === 1)
				{
					if (isSoundOn) {
						lineSound.play();
					}
					resetCanvas();
					context.beginPath();
					context.moveTo(line.x0, line.y0);
					context.lineTo(x, y);
					context.putImageData(canvasContent, 0, 0);
					context.stroke();
				}
				break;
			}
			case "ellipse":
			{
				if (isMouseDown) {
					resetCanvas();
					context.putImageData(canvasContent, 0, 0);
					const cx = (ellipse.x0 + x) / 2;
					const cy = (ellipse.y0 + y) / 2;
					const rx = Math.abs(x - ellipse.x0) / 2;
					const ry = Math.abs(y - ellipse.y0) / 2;

					context.beginPath();
					context.ellipse(cx, cy, rx, ry, 0, 0, 2 * Math.PI);
					context.stroke();
				}
				break;
			}
			case "rectangle":
			{
				if(isMouseDown)
				{
					resetCanvas();
					rectangle.xc = Math.min(rectangle.x0, x);
					rectangle.yc = Math.min(rectangle.y0, y);
					rectangle.width = Math.abs(x - rectangle.x0);
					rectangle.height = Math.abs(y - rectangle.y0);
					context.putImageData(canvasContent, 0, 0);
					context.beginPath();
					context.rect(rectangle.xc, rectangle.yc, rectangle.width, rectangle.height);
					context.stroke(); 
				}
				break;
			}
		}
	}
	
	canvas.onmouseup = function(e)
	{
		isMouseDown = 0;
		let x,y;
		x = e.pageX - this.getBoundingClientRect().left;
		y = e.pageY - this.getBoundingClientRect().top;

		if(currentTool !== "cropImage")
		{
			canvasContent = context.getImageData(0, 0, canvas.width, canvas.height);	
		}
		
		switch(currentTool)
		{
			case "pencil":
			{
				if (isSoundOn) {
					pencilSound.pause();
				}
			}
			case "line":
			{
				line.xf = x;
				line.yf = y;
				context.lineTo(line.xf, line.yf);
				context.stroke();
				break;
			}
			case "ellipse":
			{
				isMouseDown = false;
				canvasContent = context.getImageData(0, 0, canvas.width, canvas.height);
				break;
			}
		}
	}
	
	toggleSound.onclick = function() {
		if (isSoundOn) {
			toggleSound.src = soundOffImgPath;
			isSoundOn = false;
		}
		else {
			toggleSound.src = soundOnImgPath;
			isSoundOn = true;
		}
	}
	
	saveBtn.addEventListener('click', function() {
		const tmpCanvas = document.createElement('canvas');
		tmpCanvas.width = canvas.width;
		tmpCanvas.height = canvas.height;
		const tmpCtx = tmpCanvas.getContext('2d');

		tmpCtx.fillStyle = '#fff';
		tmpCtx.fillRect(0, 0, tmpCanvas.width, tmpCanvas.height);

		tmpCtx.drawImage(canvas, 0, 0);

		const link = document.createElement('a');
		link.download = 'myedit.jpg';
		link.href = tmpCanvas.toDataURL('image/jpeg', 0.9);
		link.click();
	});
	
	clearCanvas.onclick = function() {
		resetCanvas();
		canvasContent = context.getImageData(0, 0, canvas.width, canvas.height);
	}
	
	function resetCanvas(){
		context.clearRect(0, 0, canvas.width, canvas.height);
	}
}
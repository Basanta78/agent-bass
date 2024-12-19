var canvas = document.getElementById("canvas");
canvas.style.background = "#043a4a";
var ctx = canvas.getContext("2d");
var phase = 0;
var speed = 0.00001;
var frameCount= 0;
var maxCircleSize = 10;
var numRows =11;
var numCols =15;
function drawBall(){	
	ctx.clearRect(0,0,canvas.width,canvas.height);
	phase = frameCount * speed;
	for(let i =0; i<2;i++){
		if(i==0){var strandPhase = phase;}
		else{var strandPhase = phase +Math.PI};
			
		for(let col=0; col<numCols; col++){
			var colOffset = (col*Math.PI*2)/numCols;
			var x = canvas.width-(20*col)-100;	
			for(let row = 0; row <numRows;row++){
				ctx.beginPath();
				var y = canvas.height/2+row*10+	Math.sin(strandPhase+colOffset)*50;
				frameCount++;
				var sizeOffset = (Math.cos(strandPhase-(row/numRows)+colOffset)+1)*0.5;	
				var circleSize = sizeOffset * maxCircleSize;
				ctx.arc(x,y, circleSize, 0, Math.PI*2, false);		
				ctx.fillStyle = "#f59190";
				ctx.fill();
		
			}
		}
	}
		

	ctx.closePath();
}
drawBall();

setInterval (drawBall,1);

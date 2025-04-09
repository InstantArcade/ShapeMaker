var mX,mY;

var mXPressed,mYPressed;
var mXReleased,mYReleased;
var draggedIndex = -1;
var curShapeIndex = 0;

// range is 0-11, sub 5.5 to get -5.5 to 5.5

// array of verts - x,y positions
class vert
{
  constructor( x,y, shapeIndex )
  {
    this.x = x;
    this.y = y;
    this.shapeIndex = shapeIndex;
  }
};

var theVerts = [];
var numVerts = 0;

// array of faces - list of vert indexes that make each face
var theShapes = [];
var numShapes = 0;

var centerTrimX = 0;
var centerTrimY = 0;

function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(20);
  
  stroke(255,0,0,64);
  strokeWeight(1);
  line( 250,300,350,300);
  line( 300,250,300,350);
  
  // Draw dot grid
  for( var y  = 0; y < 12; y++ )
  {
    for( var x  = 0; x < 12; x++ )
    {
      noStroke();
      fill(128);
      circle(25+x*50,25+y*50,5);
    }
  }
  
  // find nearest and partially highlight
  mX = (int)((mouseX) /  50);
  mY = (int)((mouseY) /  50);
  
  fill(188,62,62);
  circle(25+mX*50, 25+mY*50,8);
  
  var startingShapeIndex = 0;
  var xA = 0;
  var yA = 0;
  
  // draw active verts
  for( var i = 0; i < theVerts.length; i++ )
  {
    noStroke();
    if( theVerts[i].shapeIndex == curShapeIndex )
      fill(0,255,0);
    else
      fill(0,96,0);
      
    circle( 25 + theVerts[i].x*50, 25+ theVerts[i].y*50, 12 );
    // draw vert number
    text(i, 30 + theVerts[i].x*50, 20+ theVerts[i].y*50 );

    xA += theVerts[i].x;
    yA += theVerts[i].y;

    // draw lines between verts?
    if( theVerts[i].shapeIndex == curShapeIndex )
      stroke(255);
    else
      stroke(96);

    if( i > 0 )
    {
      if( theVerts[i].shapeIndex == theVerts[i-1].shapeIndex )
      {
        var x =  25 + theVerts[i].x * 50;
        var y =  25 + theVerts[i].y * 50;
        var x2 = 25 + theVerts[i-1].x * 50;
        var y2 = 25 + theVerts[i-1].y * 50;
        line(x,y,x2,y2);
      }
      else
      {
         // draw closing line
        // stroke(255,0,0);
        if( theVerts[i].shapeIndex == curShapeIndex+1 )
          stroke(255);
        else
          stroke(96);
        
         var x =  25 + theVerts[i-1].x * 50;
         var y =  25 + theVerts[i-1].y * 50;
         var x2 = 25 + theVerts[startingShapeIndex].x * 50;
         var y2 = 25 + theVerts[startingShapeIndex].y * 50;
         line(x,y,x2,y2);
        log( "drawing closing line from node " + i + " to node " + startingShapeIndex );

         startingShapeIndex = i;
      }
      
      if( i == theVerts.length-1 ) // last vert
      {
          // draw closing line
          var x =  25 + theVerts[i].x * 50;
          var y =  25 + theVerts[i].y * 50;
          var x2 = 25 + theVerts[startingShapeIndex].x * 50;
          var y2 = 25 + theVerts[startingShapeIndex].y * 50;
          line(x,y,x2,y2);
      }   
    }
  }

  // draw actual center
  if( theVerts.length > 1 )
  {
    xA = (xA)/theVerts.length;
    yA = (yA)/theVerts.length;
    noStroke();
    fill(0,0,255);
    circle(25+xA*50,25+yA*50,12);
    centerTrimX = xA-5.5;
    centerTrimY = yA-5.5;
  }
  
  noFill();
  stroke(0,255,255);
  strokeWeight(1);
  text(curShapeIndex, 0,595);
}

function whichNode(x,y)
{
  var ni = -1;
  for( var i = 0; i < theVerts.length; i++ )
  {
    if( x == theVerts[i].x )
    {
      if( y == theVerts[i].y )
      {
        return i;
      }
    }
  }
  return ni;
}

function mousePressed()
{
  mXPressed = (int)((mouseX) / 50);
  mYPressed = (int)((mouseY) / 50);
  
  var ni = whichNode(mXPressed,mYPressed);
  draggedIndex = ni;
}

// range is 0-11, sub 5.5 to get -5.5 to 5.5
var outputOffsetX = -5.5;
var outputOffsetY = -5.5;

function dumpTheData( useTrim )
{
  log( "dumpData called!");
  var vertString = "verts = [\n\t";
  var faceString = "faces = [\n\t";
  
  var outString = "# Data\n\n";
  
  var oX = outputOffsetX;
  var oY = outputOffsetX;
  
  if( useTrim )
  {
    console.log( "Center trim is " + centerTrimX + "," + centerTrimY );
    oX -= centerTrimX;
    oY -= centerTrimY;
  }
  // Get all the verts (e.g. 
  var shapeIndex = -1;
  for( var v = 0; v < theVerts.length; v++ )
  {
    vertString += "[" + 
      (theVerts[v].x+oX) + "," + 
      (theVerts[v].y+oY) + ",0.0],\n\t"; 
    if( theVerts[v].shapeIndex != shapeIndex ) // new face
    {
      if( shapeIndex != -1 )
      {
        faceString = faceString.substring(0,faceString.length-1);
        faceString += "],\n\t";
      }
      faceString += "[";
      shapeIndex = theVerts[v].shapeIndex;
    }
    faceString += "" + v + ",";
  }
 
  vertString += "]\n\n";
  faceString = faceString.substring(0,faceString.length-1);
  faceString += "]\n\t]\n";
  
  outString += vertString;
  outString += faceString;
  
  console.log( outString );
  
  save( outString, "data.py" );
}

function scroll(x,y)
{
  for( var i = 0; i < theVerts.length; i++ )
  {
    theVerts[i].x += x;
    theVerts[i].y += y;
  }
}

function center()
{
  var xA = 0;
  var yA = 0;
  for( var i = 0; i < theVerts.length; i++ )
  {
    xA += theVerts[i].x;
    yA += theVerts[i].y;
  }
  
  xA = xA/theVerts.length;
  yA = yA/theVerts.length;
  // console.log("average xy " + xA + "," + yA );
  
  xA = 5.5-(int)((xA));
  yA = 5.5-(int)((yA));
  // console.log("adjust xy positions by " + xA + "," + yA );
  
  scroll(Math.round(xA-0.5),Math.round(yA-0.5));
}

function keyPressed()
{
  if( key == '=' )
  {
    // console.log( "Increase curShapeIndex to " + curShapeIndex );
    curShapeIndex++;
  }
  
  if( key == '-' && curShapeIndex > 0 )
  {
    curShapeIndex--;
  }
  
  if( key == 's' )
  {
    console.log("About to dump data");
    dumpTheData(false);
  }
  
  if( key == 'S' )
  {
    console.log("About to dump data");
    dumpTheData(true);
  }
  
  if( key == 'c' )
  {
    center();
  }
  
  if( keyCode == UP_ARROW )
  {
    scroll(0,-1);
  }
  
  if( keyCode == DOWN_ARROW )
  {
    scroll(0,1);
  }
  
  if( keyCode == LEFT_ARROW )
  {
    scroll(-1,0);
  }
  
  if( keyCode == RIGHT_ARROW )
  {
    scroll(1,0);
  }
}

function mouseReleased()
{
  mXReleased = (int)((mouseX) / 50);
  mYReleased = (int)((mouseY) / 50);
  var ni = whichNode(mXReleased,mYReleased);
  draggedIndex = -1;
}

function mouseDragged()
{
  var mXDragged = (int)((mouseX) / 50);
  var mYDragged = (int)((mouseY) / 50);
  
  var ni = whichNode(mXDragged,mYDragged);
  // console.log("NI:"+ni+", draggedIndex:" + draggedIndex);
  if( /*ni == -1 &&*/ draggedIndex != -1 && theVerts[draggedIndex].shapeIndex == curShapeIndex  )
  {
    theVerts[draggedIndex].x = mXDragged;
    theVerts[draggedIndex].y = mYDragged;
  }
}

function mouseClicked()
{
  if( mouseX >= 0 && mouseX < 600 && mouseY >=0 && mouseY < 600 )
  {
    // if we didn't change selection between pressing and releasing
    if( mXPressed == mXReleased && mYPressed == mYReleased )
    {
      // if there's not already a node there
      var ni = whichNode( mXReleased, mYReleased );
      if( ni == -1 ) 
      {
        theVerts.push( new vert(mX,mY,curShapeIndex) );
      }
      else if( keyIsDown(SHIFT) )// asssume we want to delete that node
      {
        theVerts.splice(ni,1);
      }
    }
  }  
}

function sketch3D(p,data)
{
  p.setup = function(){
    p.createCanvas(300,300, p.WEBGL);
    p.background(128);
    
  };
  p.draw = function(){
    p.background(64);
    p.orbitControl();
    p.fill(255);
    p.stroke(255);
    
    var scale = 22;
    var depth = 10;
    for( var s = 0; s < 2; s++ )
    {
      var startingShapeIndex = 0;
      p.push();
      p.translate(0,0,depth);
      depth *= -1;
      for( var i = 0; i < theVerts.length; i++ )
      {
        //p.circle(theVerts[i].x*10,theVerts[i].y*10,6);
        // p.push();
        // p.translate((theVerts[i].x-5.5)*10,(theVerts[i].y-5.5)*10,0);
        // p.sphere(2);
        // p.pop();
        var x = (theVerts[i].x-5.5)*scale;
        var y = (theVerts[i].y-5.5)*scale;
        p.circle(x,y,5);
        if( i > 0 )
        {
          if( theVerts[i].shapeIndex == theVerts[i-1].shapeIndex )
          {
            // var x1 = (theVerts[i].x-5.5)*10;
            // var y1 = (theVerts[i].y-5.5)*10;
            // p.line( x, y, x1, y1 );
            p.line(
              (theVerts[i].x-5.5)*scale,
              (theVerts[i].y-5.5)*scale,
              (theVerts[i-1].x-5.5)*scale,
              (theVerts[i-1].y-5.5)*scale
            );
          }
          else
          {
            p.line(
              (theVerts[i-1].x-5.5)*scale,
              (theVerts[i-1].y-5.5)*scale,
              (theVerts[startingShapeIndex].x-5.5)*scale,
              (theVerts[startingShapeIndex].y-5.5)*scale
            );
            startingShapeIndex = i;
          }
        }
        if( i == theVerts.length-1 )
        {
            p.line(
              (theVerts[theVerts.length-1].x-5.5)*scale,
              (theVerts[theVerts.length-1].y-5.5)*scale,
              (theVerts[startingShapeIndex].x-5.5)*scale,
              (theVerts[startingShapeIndex].y-5.5)*scale
            );
        }
      }
      p.pop();
    }
    
    // draw the lines between front and back
    for( var i = 0; i < theVerts.length; i++ )
    {
      p.push();
      p.translate((theVerts[i].x-5.5)*scale,(theVerts[i].y-5.5)*scale,0);
      p.rotateY(3.14159265/2);
      p.line(-depth,0,depth,0);
      p.pop();
    }
  };
}

new p5(sketch3D);
var mX,mY;

var mXPressed,mYPressed;
var mXReleased,mYReleased;
var draggedIndex = -1;
var curShapeIndex = 0;
var is3D = true;

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
var numShapes = 0;

var centerTrimX = 0;
var centerTrimY = 0;

var copybutton,clearbutton;
var button3D,button2D,buttonThickness;

function copyToClipboard (str) {
   // Create new element
   var el = document.createElement('textarea');
   // Set value (string to be copied)
   el.value = str;
   // Set non-editable to avoid focus and move outside of view
   el.setAttribute('readonly', '');
   el.style = {position: 'absolute', left: '-9999px'};
   document.body.appendChild(el);
   // Select text inside element
   el.select();
   // Copy text to clipboard
   document.execCommand('copy');
   // Remove temporary element
   document.body.removeChild(el);
}

function setup() {
  var c = createCanvas(600, 600);
  c.parent("griddiv");
  
  copybutton = createImg('copy.svg', 'Copy to clipboard');
  //createButton('Copy to Clipboard');
  copybutton.position(314,278);
  copybutton.mousePressed( () => {
    var ta=select("#output"); 
    copyToClipboard(ta.value()); } );
  
  clearbutton = createImg('delete.svg','Delete');
    //createButton('Clear');
  clearbutton.position(360,278);
  clearbutton.mousePressed( () => {
    console.log("Clearing all verts");
    theVerts = [];
    curShapeIndex = 0;
  });
  
  button3D = createImg('3d.svg','3D');
  button3D.position(400,278);
  button3D.mousePressed( ()=>{
    is3D = true; 
    button3D.hide();
    button2D.show();
    buttonThickness.show();
    depth = 10;
  });
  button3D.hide();
  
  button2D = createImg('2d.svg','3D');
  button2D.position(400,278);
  button2D.mousePressed( ()=>{
    is3D = false; 
    button2D.hide();
    button3D.show();
    buttonThickness.hide();
  });
  
  buttonThickness = createImg('line_weight.svg', 'Thickness');
  buttonThickness.position(440,278);
  buttonThickness.mousePressed( ()=>{
    depth += 10;
    if( depth > 50 ) depth = 10;
  });
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
  
  var xA = 0;
  var yA = 0;
  var startingShapeIndex = 0;
  
  for( var pass = 0; pass < 2; pass++ )
  {
    var si = -1;
    if( theVerts[0] ) si = theVerts[0].shapeIndex;

    for( var i = 0; i < theVerts.length; i++ )
    {
      noStroke();
      
      if( pass == 1 )
        fill(0,255,0);
      else
        fill(0,96,0);

      
      // pass 0 are verts & lines that are not the current shape
      // pass 1 are the current shapes verts and lines
      if( (pass == 0 && theVerts[i].shapeIndex != curShapeIndex) ||
          (pass == 1 && theVerts[i].shapeIndex == curShapeIndex) )
      {
        circle( 25 + theVerts[i].x*50, 25+ theVerts[i].y*50, 12 );
        // draw vert number
        text(i, 30 + theVerts[i].x*50, 20+ theVerts[i].y*50 );

        xA += theVerts[i].x;
        yA += theVerts[i].y;

        if( i > 0 )
        {
          // currently selected shape is white, others are grey
          if( theVerts[i-1].shapeIndex == curShapeIndex )
            stroke(255);
          else
            stroke(96);
          // still on same shape?
          if( theVerts[i].shapeIndex == theVerts[i-1].shapeIndex )
          {
            var x =  25 + theVerts[i].x * 50;
            var y =  25 + theVerts[i].y * 50;
            var x2 = 25 + theVerts[i-1].x * 50;
            var y2 = 25 + theVerts[i-1].y * 50;
            line(x,y,x2,y2);
          }
          else // current shape ended
          {
             // find starting shape index for current shape
            var ss = 0;
            for( var j = i-1; j>=0; j-- )
            {
              if( theVerts[j].shapeIndex != theVerts[i-1].shapeIndex )
              {
                ss = j+1;
                break;
              }
            }
             // draw closing line of previous shape
             var x =  25 + theVerts[i-1].x * 50;
             var y =  25 + theVerts[i-1].y * 50;
             var x2 = 25 + theVerts[ss].x * 50;
             var y2 = 25 + theVerts[ss].y * 50;
             line(x,y,x2,y2);
            // console.log( "drawing closing line from node " + (i-1) + " to node " + si );

             si = i;
          }

          if( i == theVerts.length-1 && si != -1 ) // last vert in entire array
          {
              // draw closing line
            if( theVerts[i] && theVerts[si] )
            {
              var x =  25 + theVerts[i].x * 50;
              var y =  25 + theVerts[i].y * 50;
              var x2 = 25 + theVerts[si].x * 50;
              var y2 = 25 + theVerts[si].y * 50;
              line(x,y,x2,y2);
              
            // console.log( "drawing last line from " + i + " to " +si );
            }
          }   
        } // vert index > 0
      } // pass filter
    } // vert loop
  } // pass loop
  // console.log("done\n\n");
  
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
        if( curShapeIndex == theVerts[i].shapeIndex )
        {
          return i;
        }
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
  // log( "dumpData called!");
  var ta = select("#output");
  var vertString = "verts = [\n\t";
  var faceString = "faces = [\n\t";
  
  var outString = "";//"# Data\n\n";
  
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
  var startIndex = 0;
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
        faceString += "," + startIndex + "],\n\t";
      }
      faceString += "[";
      shapeIndex = theVerts[v].shapeIndex;
      startIndex = v;
    }
    faceString += "" + v + ",";
  }
 
  vertString += "]\n\n";
  faceString = faceString.substring(0,faceString.length-1);
  faceString += "," + startIndex + "]\n\t]\n";
  
  outString += vertString;
  outString += faceString;
  
  ta.value(outString);
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
  
  xA = 5.5-(int)((xA));
  yA = 5.5-(int)((yA));
  
  scroll(Math.round(xA-0.5),Math.round(yA-0.5));
}

function keyPressed()
{
  if( key == '=' )
  {
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
  if( draggedIndex != -1 && theVerts[draggedIndex].shapeIndex == curShapeIndex  )
  {
    theVerts[draggedIndex].x = mXDragged;
    theVerts[draggedIndex].y = mYDragged;
    dumpTheData(false);
  }
}

function lastNodeInShape( sh )
{
  var nodeIndex = -1;
  for( var i = 0; i < theVerts.length; i++ )
  {
    if( theVerts[i].shapeIndex == sh )
    {
      nodeIndex = i+1;
    }
    else if( theVerts[i].shapeIndex == sh + 1 )
    {
       break;
    }
   }
  return nodeIndex;
 }

function mouseClicked()
{
  if( mouseX >= 0 && mouseX < 600 && mouseY >=0 && mouseY < 600 )
  {
    // if we didn't change selection between pressing and releasing
    if( mXPressed == mXReleased && mYPressed == mYReleased )
    {
      var ni = whichNode( mXReleased, mYReleased );
      var last = lastNodeInShape(curShapeIndex);
      
      if( !keyIsDown(SHIFT) )
      {
        if( ni == -1 ) // no node in the current shape on this spot
        {
          // push or splice?
          if( last != -1 )
          {
            // console.log( "inserting a new node at position " + last );
            theVerts.splice(last,0, new vert(mX,mY,curShapeIndex) );

          }
          else
          {
            // console.log( "Pushing a new node at the end of the array" );
            theVerts.push( new vert(mX,mY,curShapeIndex) );
          }
        }
      }      
      
      if( ni != -1 && theVerts[ni].shapeIndex == curShapeIndex && keyIsDown(SHIFT) )// asssume we want to delete that node
      {
        theVerts.splice(ni,1);
      }
    }
  }
 dumpTheData(false);
}

var depth = 10;

function sketch3D(p,data)
{
  p.setup = function(){
    var c = p.createCanvas(300,300, p.WEBGL);
    c.parent("3ddiv");
    p.background(128);
    
  };
  p.draw = function(){
    p.background(64);
    p.orbitControl();
    p.fill(255);
    p.stroke(255);
    
    var scale = 22;
    var passes = 2;
    if( !is3D )
    {
      passes = 1;
      depth = 0;
    }
    for( var s = 0; s < passes; s++ )
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
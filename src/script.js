var marg={top:150, right:20, bottom:50, left:60},
	w=1000-marg.left-marg.right;
	h=600-marg.top-marg.bottom,
	u=w+marg.left+marg.right+200,
	v=h+marg.top+marg.bottom+25;
var rawdata, maxval, lineGen, ch, newdata;
var mydate,dd,mm,yyyy, newdate;
var col1="Slots",col2="Data Size";		//names of the columns in csv file
var begname="";							
var p=d3.select("body").append("svg").attr("width", u).attr("height", v).append("g").attr("transform", "translate(" + marg.left + "," + marg.top + ")");
//for today's date
var today = new Date();
var td = today.getDate();
var tm = today.getMonth()+1; //January is 0!
var ty = today.getFullYear();

if(td<10) {
    td='0'+td
} 

if(tm<10) {
    tm='0'+tm
} 


$(document).ready(function(){
		$("#choice").hide();
		$("#mybutton").hide();
		filter();
	});	
function filter(){
	$("choice").hide();
	$("#mybutton").hide();
	
	$("#filter").click(function(){
		newdate=document.getElementById('inputField').value;
		var dataString='date1='+newdate;
		
		if (newdate == "")
		{
			alert("Please Select Date");
		}
		else if(newdate!="")
		{	
			$("#Nochoice").hide();
			$("#choice").show();
			$("#mybutton").show();
			// AJAX code to save date.
			$.ajax({
				type: "POST",
				url: "save.php",
				data: dataString,
				cache: false,
				success: function() {
					console.log("Date sent!!");
				}
			});
		}
	});
}

window.onload = function(){
		new JsDatePick({
	useMode:2,
	target:"inputField",
	isStripped:false,
        selectedDate:{
            year:ty,
            month:tm,
            day:td
       	},
        yearsRange: new Array(2014,2015),
        limitToToday:true,
		cellColorScheme:"orange"
});
};

function refilter(){
	ch = document.getElementById('choice').value;
	if(ch=="None")
	{
		alert("Select a Station!");
		p.selectAll("g").remove();
		p.selectAll("text").remove();
		p.selectAll("path").remove();
		p.selectAll("rect").remove();
	}
	else if(ch=="all")
	{
		var fname = begname.concat("allstations",".csv");
		d3.csv(fname, function(d){			
			newdata=d;
			allchart();
		});
	}
	else
	{
		var fname = begname.concat(ch,".csv");
		d3.csv(fname, function(d){			
			rawdata=d;
			chart();
		});
	}
}
			
function allchart()
{
	p.selectAll("g").remove();
	p.selectAll("text").remove();
	p.selectAll("path").remove();
	p.selectAll("rect").remove();
	
	var i;
	var stname=["DEMS","VABB","VABP","VANP","VEAT","VECC","VEPT","VEVZ","VICH","VIJP","VILK","VOHY","VOMM","VOMP","VEMN","VISR"];
	var color = d3.scale.category20();
	var legend_w=w+10;
	var legend_h=-100;
	
	//adding legend
	var legend=p.selectAll(".legend")
				.data(stname)
				.enter()
				.append("g")
				.attr("class", "legend")
				.each(function(d){
					var g = d3.select(this);
					for(i=0;i<=15;i++)
					{
						g.append("rect").attr("x", legend_w+12).attr("y", i*25-4).attr("width", 10).attr("height", 10).style("fill", color(i)).style("stroke", "black");
						g.append("text").attr("x", legend_w+30).attr("y", i*25+5).style("fill", stname[i]).text(stname[i]);
					}
					g.append("rect").attr("x",legend_w).attr("y", legend_h+40).attr("width", 120).attr("height", 460).style("fill", "none").style("stroke", "black");
					g.append("text").attr("x", legend_w+33).attr("y", legend_h+70).style("font-size","15px").style("fill","grey").text("Legend");
					
				});
	var xScale = d3.scale.ordinal().rangePoints([0, w],1);

var yScale = d3.scale.linear()
    .range([h, 0]);

var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient("bottom");

var yAxis = d3.svg.axis()
    .scale(yScale)
    .orient("left");

var lineGen = d3.svg.line()
    .interpolate("basis")
    .x(function(d) { return xScale(d.Time); })
    .y(function(d) { return yScale(d.stn); });

  color.domain(d3.keys(newdata[0]).filter(function(key) { return key !== "Time"; }));

  var stations = color.domain().map(function(x) {
    return { 
      name: x,
      values: newdata.map(function(d) {
        return {Time: d.Time, stn: +d[x]};
      })
    };
  });

  xScale.domain(newdata.map(function(d){return d.Time;}));
  var mymin=d3.min(stations, function(c) { return d3.min(c.values, function(v) { return v.stn; }); });
  var mymax=d3.max(stations, function(c) { return d3.max(c.values, function(v) { return v.stn; }); });
  yScale.domain([mymin,mymax]);

  p.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + h + ")")
      .call(xAxis)
	  .selectAll("text")
	  .style("text-anchor", "end")
	  .attr("dx", "-.8em")
	  .attr("dy", ".15em")
	  .attr("transform", function(d) {
	  		return "rotate(-65)" ;
	  });
p.append("text").attr("x",(w - marg.right)/2).attr("y",(h - marg.top+205)).style("font-size","12px").text("Time(in UTC)");
  p.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end")
      .text("Data Size (MBs)");

  var allstns = p.selectAll(".allstns")
      .data(stations)
    .enter().append("g")
      .attr("class", "allstns");

  allstns.append("path")
      .attr("class", "line")
      .attr("d", function(d) { return lineGen(d.values); })
      .style("stroke", function(d) { return color(d.name); })
      .attr("display", "none")
      .transition()
      .delay(function(d, i) { return i * 2000; })
      .duration(1950)
      .ease("linear")
      .attrTween("stroke-dasharray", animateLine)
      .attr("display", 1);							
}

function chart()
{	
	maxval=d3.max(rawdata, function(d){ return Math.max(d[col2]);});
	p.selectAll("g").remove();
	p.selectAll("text").remove();
	p.selectAll("path").remove();
	p.selectAll("rect").remove();
				
	if(isNaN(maxval))
	{
		p.append("text").attr("x",(w - marg.right)/2).attr("y",(h)/2).style("font-size","20px").style("fill","red").style("font-family","tahoma").text("NO DATA RECEIVED FOR THIS STATION!");
	}
	else
	{
		var rangeX=d3.scale.ordinal().rangePoints([0, w],1).domain(rawdata.map(function(d){return d[col1];}));
		var rangeY=d3.scale.linear().range([h,0]).domain([0,maxval+50]);
		var axisX=d3.svg.axis().scale(rangeX).orient("bottom").ticks(5);
		var axisY=d3.svg.axis().scale(rangeY).orient("left").ticks(12);
				
		//add axes
		p.append("g").attr("class", "axis").attr("transform","translate(0, "+h+")").call(axisX)
																					.selectAll("text")
																					.style("text-anchor", "end")
																					.attr("dx", "-.8em")
																					.attr("dy", ".15em")
																					.attr("transform", function(d) {
																						return "rotate(-65)" 
																					});
		p.append("g").attr("class", "axis").call(axisY).attr("transform","translate(0,0)");
	
		//add labels
		p.append("text").attr("x",(w - marg.right)/2).attr("y",(h - marg.top+205)).style("font-size","16px").text("Time(in UTC)");
		p.append("text").attr("transform", "rotate(-90)").attr("x",0-(h/2)-20).attr("y",(marg.left-105)).style("font-size","16px").text("Data Size(MBs)");
		p.append("text").attr("x",0).attr("y",(h - marg.top)+220).style("font-size","9px").text("*This graph depicts the amount of data received at a particular station on a particular date.");
				
		//adding legend
		var legend_w=w-50;
		var legend_h=-60;							
		p.append("text").attr("x", legend_w+8).attr("y", legend_h+40).style("font-size","10px").style("fill","black").style("font-family","verdana").text("Station Code Name:"+ch);
		p.append("text").attr("x", legend_w+8).attr("y", legend_h+70).style("font-size","10px").style("fill","black").style("font-family","verdana").text("Selected Date:"+newdate);
										
		//p.append("text").attr("x", legend_w+40).attr("y", legend_h+20).style("font-size","15px").style("fill","grey").text("Information");
		p.append("rect").attr("x",legend_w).attr("y", legend_h).attr("width", 160).attr("height", 100).style("fill", "none").style("stroke", "#000000");
										
		lineGen=d3.svg.line().x(function(d){return rangeX(d[col1]);}).y(function(d){return rangeY(d[col2]);});		
			
		p.append("path").attr("class", "line")
		.attr("d", lineGen(rawdata)).transition()
		.delay(function(d, i) { return i * 2000; })
		.duration(3000).ease("linear").attrTween('stroke-dasharray', animateLine);	
	}
}
// A line animation function (using interpolation)
function animateLine() {
      var l = this.getTotalLength();
      i = d3.interpolateString("0," + l, l + "," + l);
      return function(t) { return i(t); };
  }

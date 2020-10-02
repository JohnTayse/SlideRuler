var rule = {};

var CM_PER_INCH = 2.54;
var PIXELS_PER_INCH = 96;
var CM_RATIO = 6.5 / 25;
var CM_MARGIN = 1.875 / 25;
var INCHES_RATIO = 2 / 10;
var INCHES_MARGIN = 0.75 / 10;
var PRECISION_ROUGH = 'r';
var PRECISION_MEDIUM = 'm';
var PRECISION_FINE = 'f';


$(document).ready(function(){ 
	console.log("\t Welcome to the Slide Rule Generator │╵│╵│╵│╵│╵│╵│")
	//When document is loaded, call build once
	build()
	debug()//prints all values to browser console

	$('#lockAspect').change(function() {
        if(this.checked) {
            $('#ruleHeight').attr('disabled','disabled');
			
			rule.width = $('#ruleWidth').val();
			if(rule.units === 'centimeters'){
				$('#ruleHeight').val((Math.round(rule.width * CM_RATIO * 1000) / 1000).toFixed(3));
			}
			if(rule.units === 'inches'){
				$('#ruleHeight').val((Math.round(rule.width * INCHES_RATIO * 1000) / 1000).toFixed(3));
			}
        } else {
			$('#ruleHeight').removeAttr('disabled');
		}
	});
	
	$('input[type=radio][name=ruleUnits]').change(function(){
		if(rule.units == 'centimeters'){
			$('#ruleWidth').val((Math.round(rule.width / CM_PER_INCH * 1000) / 1000).toFixed(3));
			$('#ruleHeight').val((Math.round(rule.height / CM_PER_INCH * 1000) / 1000).toFixed(3));
			$('#ruleMargin').val((Math.round(rule.margin / CM_PER_INCH * 1000) / 1000).toFixed(3));
			$('#ruleSpacing').val((Math.round(rule.spacing / CM_PER_INCH * 1000) / 1000).toFixed(3));
		}
		if(rule.units == 'inches'){
			$('#ruleWidth').val((Math.round(rule.width * CM_PER_INCH * 1000) / 1000).toFixed(3));
			$('#ruleHeight').val((Math.round(rule.height * CM_PER_INCH * 1000) / 1000).toFixed(3));
			$('#ruleMargin').val((Math.round(rule.margin * CM_PER_INCH * 1000) / 1000).toFixed(3));
			$('#ruleSpacing').val((Math.round(rule.spacing * CM_PER_INCH * 1000) / 1000).toFixed(3));
		}
	})

	$('#ruleWidth').change(function(){
		rule.width = $('#ruleWidth').val();
		if($('#lockAspect').is(':checked')){
			if(rule.units === 'centimeters'){
				$('#ruleHeight').val((Math.round(rule.width * CM_RATIO * 1000) / 1000).toFixed(3));
				$('#ruleMargin').val((Math.round(rule.width * CM_MARGIN * 1000) / 1000).toFixed(3));
			}
			if(rule.units === 'inches'){
				$('#ruleHeight').val((Math.round(rule.width * INCHES_RATIO * 1000) / 1000).toFixed(3));
				$('#ruleMargin').val((Math.round(rule.width * INCHES_MARGIN * 1000) / 1000).toFixed(3));
			}
		}
	})

	$( "#ruleParameters" ).change(function(  ) {
		//anytime anything within the form is altered, call build again
		build()
		debug()//prints all values to browser console
	});

	exportSvg()
});

var build = function(){
	updateVariables()
	checkUnit()
	resizeCanvas()
	constructRule()
}

var debug = function(){
	console.info("--All the variables---")
	console.info(rule)//prints all attributes of ruler object
}

var exportSvg = function(){
	document.getElementById("svgexpbutton").onclick = 
	function(){
		var elem = document.getElementById("svgexpdata");
		elem.value = 'data:image/svg+xml;base64,' + btoa(rule.svg);
		//btoa Creates a base-64 encoded ASCII string from a "string" of binary data
		document.getElementById("svgexpform").submit();
	};
}

var updateVariables = function(){
	rule.width = $('#ruleWidth').val();
	rule.height = $('#ruleHeight').val();
	rule.margin = $('#ruleMargin').val();
	rule.spacing = $('#ruleSpacing').val();
	rule.lockAspect =  $("input:checkbox[name=lockAspect]:checked'").val();
	rule.showSlide =  $("input:checkbox[name=showSlide]:checked'").val();
	rule.units =  $("input:radio[name=ruleUnits]:checked'").val();
	rule.precision = $('#precision').val();
}

var checkUnit = function(){
    if (rule.units === "inches"){
        rule.pixelsPerUnit = PIXELS_PER_INCH
    }
    else if (rule.units === "centimeters"){
        rule.pixelsPerUnit = PIXELS_PER_INCH / CM_PER_INCH
    }
    rule.widthPixels = rule.height * rule.pixelsPerUnit
}

var resizeCanvas = function(){
    document.getElementById("myCanvas").width = rule.width * rule.pixelsPerUnit / 0.8;
    heightAddend = 15
	document.getElementById("myCanvas").height = heightAddend + rule.height * rule.pixelsPerUnit + rule.spacing * 2 * rule.pixelsPerUnit;
}

var constructRule = function(){
    const canvas = document.getElementById('myCanvas');
	const ctx = canvas.getContext('2d');

	var data = getRuleImage();

	rule.svg = data;

	var DOMURL = window.URL || window.webkitURL || window;

	var img = new Image();
	var svg = new Blob([data], {type: 'image/svg+xml;charset=utf-8'});
	var url = DOMURL.createObjectURL(svg);

	img.onload = function () {
		ctx.drawImage(img, 0, 0);
		DOMURL.revokeObjectURL(url);
	}

	img.src = url;
}

var getRuleImage = function(){
	var piSymbol = "&#928;"
	var tauSymbol = "&#932;"

	var min = 0.0;
	var max = rule.width * rule.pixelsPerUnit;
	var spacing = rule.height * rule.pixelsPerUnit * 0.05;
	var slide = rule.spacing * rule.pixelsPerUnit;
	var margin = rule.margin * rule.pixelsPerUnit;
	var sizeXL = spacing;	//RMF
	var sizeL = sizeXL / 2;	//RMF
	var sizeM = sizeXL / 3;	//MF
	var sizeS = sizeXL / 5;	//F

	var svgWidth = max + margin * 2;
	var svgHeight = sizeXL * 2 / 0.8;
	var startX = margin;
	var startYd = svgHeight * 0.01;	//lines down
	var startYu = svgHeight - svgHeight * 0.01;	//lines up

	var fontSize = spacing * 0.7;
	var strokeWidth = max * 0.00015;

	var svgParent = "";
	svgParent += '<svg xmlns="http://www.w3.org/2000/svg" width="' + svgWidth + '" height="' + (svgHeight * 7 + slide * 2) + '">';

	if(rule.showSlide){
		svgParent += '<rect x="0" y="0" width="' + svgWidth + '" height="' + (svgHeight * 7 + slide * 2) + '" style="stroke:black;fill:none;stroke-width:' + strokeWidth +'mm;"/>'
		svgParent += '<line x1="0" y1="' + (spacing * 4 + spacing / 2 + sizeS) + '" x2="' + svgWidth + '" y2="' + (spacing * 4 + spacing / 2 + sizeS) + '" style="stroke:black;fill:none;stroke-width:' + strokeWidth +'mm;"/>'
		svgParent += rule.slide === 0 ? '' : '<line x1="0" y1="' + (spacing * 4 + spacing / 2 + slide + sizeS) + '" x2="' + svgWidth + '" y2="' + (spacing * 4 + spacing / 2 + slide + sizeS) + '" style="stroke:black;fill:none;stroke-width:' + strokeWidth +'mm;"/>'
		svgParent += '<line x1="0" y1="' + (spacing * 12 + spacing / 4 + slide + sizeS * 2) + '" x2="' + svgWidth + '" y2="' + (spacing * 12 + spacing / 4 + slide + sizeS * 2) + '" style="stroke:black;fill:none;stroke-width:' + strokeWidth +'mm;"/>'
		svgParent += rule.slide === 0 ? '' : '<line x1="0" y1="' + (spacing * 12 + spacing / 4 + slide * 2 + sizeS * 2) + '" x2="' + svgWidth + '" y2="' + (spacing * 12 + spacing / 4 + slide * 2 + sizeS * 2) + '" style="stroke:black;fill:none;stroke-width:' + strokeWidth +'mm;"/>'
	}

	svgParent += '<g transform="translate(' + (startX - sizeXL) + ',0)">'
	svgParent += '<text x="0" y="' + (spacing * 1.5) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">K</text>'
	svgParent += '<text x="0" y="' + (spacing * 3.5) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">A</text>'
	svgParent += '<text x="0" y="' + (spacing * 5.5 + slide + sizeS * 2) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">B</text>'
	svgParent += '<text x="0" y="' + (spacing * 8.5 + slide) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">CI</text>'
	svgParent += '<text x="0" y="' + (spacing * 11.5 + slide) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">C</text>'
	svgParent += '<text x="0" y="' + (spacing * 13.5 + slide * 2 + sizeS * 2) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">D</text>'
	svgParent += '<text x="0" y="' + (spacing * 16 + slide * 2 + sizeS * 2) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">L</text>'
	svgParent += '</g>'

	svgParent += '<g transform="translate(' + (startX + max + sizeXL) + ',0)">'
	svgParent += '<text x="0" y="' + (spacing * 1.5) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">K</text>'
	svgParent += '<text x="0" y="' + (spacing * 3.5) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">A</text>'
	svgParent += '<text x="0" y="' + (spacing * 5.5 + slide + sizeS * 2) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">B</text>'
	svgParent += '<text x="0" y="' + (spacing * 8.5 + slide) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">CI</text>'
	svgParent += '<text x="0" y="' + (spacing * 11.5 + slide) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">C</text>'
	svgParent += '<text x="0" y="' + (spacing * 13.5 + slide * 2 + sizeS * 2) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">D</text>'
	svgParent += '<text x="0" y="' + (spacing * 16 + slide * 2 + sizeS * 2) + '" font-family="Helvetica" text-anchor="middle" dominant-baseline="central" font-size="' + fontSize +'" style="fill:black;">L</text>'
	svgParent += '</g>'

	// C/D/CI scales
	var cscale = "";	//lines up
	var dscale = "";	//lines down
	var ciscale = "";	//lines up
	var clabels = {};
	var dlabels = {};
	var cilabels = {};

	cscale += '<g transform="translate(0, ' + (spacing * 10 + slide + sizeS) + ')">';
	dscale += '<g transform="translate(0, ' + (spacing * 12 + slide * 2 + sizeS * 3) + ')">';
	ciscale += '<g transform="translate(0, ' + (spacing * 7 + slide + sizeS) + ')">';

	cscale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';
	dscale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';
	ciscale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';

	var cdiPi = Math.log10(Math.PI);
	var cdiTau = Math.log10(Math.PI * 2);

	cscale += ' M' + (max * cdiPi + startX) + ',' + (startYu)
	cscale += ' L' + (max * cdiPi + startX) + ',' + (startYu - sizeL)
	dscale += ' M' + (max * cdiPi + startX) + ',' + (startYd)
	dscale += ' L' + (max * cdiPi + startX) + ',' + (startYd + sizeL)
	ciscale += ' M' + (max - max * cdiPi + startX) + ',' + (startYu)
	ciscale += ' L' + (max - max * cdiPi + startX) + ',' + (startYu - sizeL)

	cscale += ' M' + (max * cdiTau + startX) + ',' + (startYu)
	cscale += ' L' + (max * cdiTau + startX) + ',' + (startYu - sizeL)
	dscale += ' M' + (max * cdiTau + startX) + ',' + (startYd)
	dscale += ' L' + (max * cdiTau + startX) + ',' + (startYd + sizeL)
	ciscale += ' M' + (max - max * cdiTau + startX) + ',' + (startYu)
	ciscale += ' L' + (max - max * cdiTau + startX) + ',' + (startYu - sizeL)

	clabels[piSymbol] = (max  * cdiPi + startX);
	dlabels[piSymbol] = (max * cdiPi + startX);
	cilabels[piSymbol] = (max - max * cdiPi + startX);
	clabels[tauSymbol] = (max  * cdiTau + startX);
	dlabels[tauSymbol] = (max * cdiTau + startX);
	cilabels[tauSymbol] = (max - max * cdiTau + startX);

	for(var i = 100; i < 200; i += 1){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100);

		if(i % 10 == 0){
			size = sizeXL;
			clabels[(i / 100)] = (max  * decimal + startX);
			dlabels[(i / 100)] = (max * decimal + startX);
			cilabels[(i / 100)] = (max - max * decimal + startX);
			draw = true;
		} else if (i % 5 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 1 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw) {
			cscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			cscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			dscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			dscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
			ciscale += ' M' + (max - max * decimal + startX) + ',' + (startYu)
			ciscale += ' L' + (max - max * decimal + startX) + ',' + (startYu - size)
		}
	}
	for(var i = 200; i < 400; i += 2){
		var draw = false
		var size = 0;
		var decimal = Math.log10(i / 100);

		if(i % 100 == 0){
			size = sizeXL;
			clabels[(i / 100)] = (max  * decimal + startX);
			dlabels[(i / 100)] = (max * decimal + startX);
			cilabels[(i / 100)] = (max - max * decimal + startX);
			draw = true;
		} else if (i % 50 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 20 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			cscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			cscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			dscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			dscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
			ciscale += ' M' + (max - max * decimal + startX) + ',' + (startYu)
			ciscale += ' L' + (max - max * decimal + startX) + ',' + (startYu - size)
		}
	}
	for(var i = 400; i < 1005; i += 5){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100);

		if(i % 100 == 0){
			size = sizeXL;
			clabels[(i / 100)] = (max  * decimal + startX);
			dlabels[(i / 100)] = (max * decimal + startX);
			cilabels[(i / 100)] = (max - max * decimal + startX);
			draw = true;
		} else if (i % 50 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 10 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			cscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			cscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			dscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			dscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
			ciscale += ' M' + (max - max * decimal + startX) + ',' + (startYu)
			ciscale += ' L' + (max - max * decimal + startX) + ',' + (startYu - size)
		}
	}
	cscale += '"/>'
	dscale += '"/>'
	ciscale += '"/>'
	for(var key in clabels){
		var label = key
		var xPosition = clabels[key];
		if(label == 10){ label = 1; }
		cscale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + sizeXL + '">' + label + '</text>'
	}
	for(var key in dlabels){
		var label = key
		var xPosition = dlabels[key];
		if(label == 10){ label = 1; }
		dscale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + (sizeXL * 2) + '">' + label + '</text>'
	}
	for(var key in cilabels){
		var label = key
		var xPosition = cilabels[key];
		if(label == 10){ label = 1; }
		ciscale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + sizeXL + '">' + label + '</text>'
	}

	cscale += '</g>'
	dscale += '</g>'
	ciscale += '</g>'

	svgParent += cscale
	svgParent += dscale
	svgParent += ciscale

	// A/B scales
	var ascale = "";	//lines up
	var bscale = "";	//lines down
	var alabels = {};
	var blabels = {};

	ascale += '<g transform="translate(0, ' + (spacing * 2 + spacing / 4) + ')">';
	bscale += '<g transform="translate(0, ' + (spacing * 4 + spacing / 4 + slide + sizeS * 2) + ')">';

	ascale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';
	bscale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';

	var abPi = Math.log10(Math.PI) / 2;
	var abTau = Math.log10(Math.PI * 2) / 2;

	ascale += ' M' + (max * abPi + startX) + ',' + (startYu)
	ascale += ' L' + (max * abPi + startX) + ',' + (startYu - sizeL)
	bscale += ' M' + (max * abPi + startX) + ',' + (startYd)
	bscale += ' L' + (max * abPi + startX) + ',' + (startYd + sizeL)

	ascale += ' M' + (max * abTau + startX) + ',' + (startYu)
	ascale += ' L' + (max * abTau + startX) + ',' + (startYu - sizeL)
	bscale += ' M' + (max * abTau + startX) + ',' + (startYd)
	bscale += ' L' + (max * abTau + startX) + ',' + (startYd + sizeL)

	alabels[piSymbol] = (max  * abPi + startX);
	blabels[piSymbol] = (max * abPi + startX);
	alabels[tauSymbol] = (max  * abTau + startX);
	blabels[tauSymbol] = (max * abTau + startX);

	for(var i = 100; i < 200; i += 2){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 2;

		if(i % 100 == 0){
			size = sizeXL;
			alabels[(i / 100)] = (max  * decimal + startX);
			blabels[(i / 100)] = (max * decimal + startX);
			draw = true;
		} else if (i % 10 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 5 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			ascale += ' M' + (max * decimal + startX) + ',' + (startYu)
			ascale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			bscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			bscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	for(var i = 200; i < 500; i += 5){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 2;

		if(i % 100 == 0){
			size = sizeXL;
			alabels[(i / 100)] = (max  * decimal + startX);
			blabels[(i / 100)] = (max * decimal + startX);
			draw = true;
		} else if (i % 50 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 10 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			ascale += ' M' + (max * decimal + startX) + ',' + (startYu)
			ascale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			bscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			bscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	for(var i = 500; i < 1000; i += 10){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 2;

		if(i % 100 == 0){
			size = sizeXL;
			alabels[(i / 100)] = (max  * decimal + startX);
			blabels[(i / 100)] = (max * decimal + startX);
			draw = true;
		} else if (i % 50 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 20 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			ascale += ' M' + (max * decimal + startX) + ',' + (startYu)
			ascale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			bscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			bscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	for(var i = 1000; i < 2000; i += 20){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 2;

		if(i % 1000 == 0){
			size = sizeXL;
			alabels[(i / 100)] = (max  * decimal + startX);
			blabels[(i / 100)] = (max * decimal + startX);
			draw = true;
		} else if (i % 100 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 50 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			ascale += ' M' + (max * decimal + startX) + ',' + (startYu)
			ascale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			bscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			bscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	for(var i = 2000; i < 5000; i += 50){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 2;

		if(i % 1000 == 0){
			size = sizeXL;
			alabels[(i / 100)] = (max  * decimal + startX);
			blabels[(i / 100)] = (max * decimal + startX);
			draw = true;
		} else if (i % 500 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 100 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			ascale += ' M' + (max * decimal + startX) + ',' + (startYu)
			ascale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			bscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			bscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	for(var i = 5000; i < 10100; i += 100){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 2;

		if(i % 1000 == 0){
			size = sizeXL;
			alabels[(i / 100)] = (max  * decimal + startX);
			blabels[(i / 100)] = (max * decimal + startX);
			draw = true;
		} else if (i % 500 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 200 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			ascale += ' M' + (max * decimal + startX) + ',' + (startYu)
			ascale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
			bscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			bscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	ascale += '"/>'
	bscale += '"/>'

	for(var key in alabels){
		var label = 0;
		var xPosition = alabels[key];
		if (key >= 100){
			label = key / 100
		} else if(key >= 10){
			label = key / 10
		} else {
			label = key;
		}
		ascale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + sizeXL + '">' + label + '</text>'
	}
	for(var key in blabels){
		var label = 0
		var xPosition = blabels[key];
		if (key >= 100){
			label = key / 100
		} else if(key >= 10){
			label = key / 10
		} else {
			label = key;
		}
		bscale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + (sizeXL * 2) + '">' + label + '</text>'
	}

	ascale += '</g>'
	bscale += '</g>'

	svgParent += ascale
	svgParent += bscale

	var lscale = "";	//lines down
	var llabels = {};

	lscale += '<g transform="translate(0, ' + (spacing * 15 + slide * 2 + sizeS) + ')">';

	lscale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';
	for(var i = 0; i < 1001; i += 2){
		var draw = false;
		var size = 0;
		var decimal = i / 1000;
		if(i % 100 == 0){
			size = sizeXL;
			llabels[decimal] = (max  * decimal + startX);
			draw = true;
		} else if (i % 50 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 10 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			lscale += ' M' + (max * decimal + startX) + ',' + (startYd)
			lscale += ' L' + (max * decimal + startX) + ',' + (startYd + size)
		}
	}
	lscale += '"/>'
	for(var key in llabels){
		var label = key
		var xPosition = llabels[key];
		if(label == 10) { label = 1}
		else { label = (key + "").replace("0.", ".")}
		lscale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + (sizeXL * 2) + '">' + label + '</text>'
	}

	lscale += '</g>'

	svgParent += lscale

	var kscale = "";	//lines up
	var klabels = {};

	kscale += '<g transform="translate(0, 0)">';

	kscale += '<path stroke-width="' + strokeWidth +'mm" stroke="black" d="';
	// 1, .02
	for(var i = 100; i < 200; i += 2){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 100 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 20 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 2-3, .05
	for(var i = 200; i < 400; i += 5){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 100 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 20 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 4-9, .1
	for(var i = 400; i < 1000; i += 10){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 100 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 50 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 10-19, .2
	for(var i = 1000; i < 2000; i += 20){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 1000 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 200 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 20-39, .5
	for(var i = 2000; i < 4000; i += 50){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 1000 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 200 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 40-99, 1
	for(var i = 4000; i < 10000; i += 100){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 1000 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 500 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 100-198, 2
	for(var i = 10000; i < 20000; i += 200){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 10000 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 1000 == 0){
			size = sizeL;
			draw = true;
		} else if (i % 500 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 200-395, 5
	for(var i = 20000; i < 40000; i += 500){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 10000 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 2000 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	// 400-1000, 10
	for(var i = 40000; i <= 100000; i += 1000){
		var draw = false;
		var size = 0;
		var decimal = Math.log10(i / 100) / 3;

		if(i % 10000 == 0){
			size = sizeXL;
			klabels[(i / 100)] = (max  * decimal + startX);
			draw = true;
		} else if (i % 2000 == 0){
			size = sizeM;
			draw = rule.precision === PRECISION_MEDIUM || rule.precision === PRECISION_FINE;
		} else {
			size = sizeS;
			draw = rule.precision === PRECISION_FINE;
		}

		if(draw){
			kscale += ' M' + (max * decimal + startX) + ',' + (startYu)
			kscale += ' L' + (max * decimal + startX) + ',' + (startYu - size)
		}
	}
	kscale += '"/>'
	for(var key in klabels){
		var label = 0;
		if(key >= 1000){
			label = key / 1000
		} else if (key >= 100){
			label = key / 100
		} else if(key >= 10){
			label = key / 10
		} else {
			label = key;
		}
		var xPosition = klabels[key];

		kscale += '<text text-anchor="middle" font-family="Helvetica" font-size="' + fontSize +'" x="' + xPosition + '" y="' + sizeXL + '">' + label + '</text>'
	}

	kscale += '</g>'

	svgParent += kscale
	svgParent += '</svg>'


	return svgParent;
}
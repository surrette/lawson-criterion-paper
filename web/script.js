// script.js

const schema = [
  { name: 'Year', index: 0, text: 'Year' },
  { name: 'nTtauEstar_max', index: 1, text: 'Triple Product' },
  { name: 'Project Displayname', index: 2, text: 'Project' },
  { name: 'Concept Displayname', index: 3, text: 'Concept' },
  { name: 'Name Project', index: 4, text: 'Project Name' },
  { name: 'Link to Wikipedia Page', index: 5, text: 'Wikipedia' },
  { name: 'Year Experiments Began', index: 6, text: 'Begin' },
  { name: 'Year Experiments Ended', index: 7, text: 'End' },
  { name: 'Shot', index: 8, text: 'Shot' },
  { name: 'Description Project', index: 9, text: 'Description Project' },
  { name: 'Description Concept', index: 10, text: 'Description Concept' },
  { name: 'Experimental Identifier', index: 11, text: 'Experimental Identifier' },
  { name: 'Photograph', index: 12, text: 'Photograph' },
  { name: 'Photograph Attribution', index: 13, text: 'Photograph Attribution' },
  { name: 'Project Website', index: 14, text: 'Project Website' },
  { name: 'Cost', index: 15, text: 'Cost' },
  { name: 'Cost Notes', index: 16, text: 'Cost Notes' },
  { name: 'Name Concept', index: 17, text: 'Name Concept' },
  { name: 'Title', index: 18, text: 'Title' },
  { name: 'Link to Publication', index: 19, text: 'Link to Publication' },
  { name: 'Publication Type', index: 20, text: 'Publication Type' },
  { name: 'is_concept_record', index: 21, text: 'is_concept_record' },
  { name: 'T_i_max', index: 22, text: 'T_i_max' },
  { name: 'n_i_max', index: 23, text: 'n_i_max' },
  { name: 'tau_E_star', index: 24, text: 'tau_E_star' },
  { name: 'p_stag', index: 25, text: 'p_stag' },
  { name: 'tau_stag', index: 26, text: 'tau_stag' },
  { name: 'Year', index: 27, text: 'Year' }, //duplicate Year and T
  { name: 'nTtauEstar_max', index: 28, text: 'Triple Product' },
];

function getOption(TripleProduct, scaleType, selectX, selectY, checkIsConcept) {
	if(checkIsConcept.checked){ //filter to IsConcept=1
		TripleProduct=TripleProduct.filter(v => v[21]==true);
	}
	var g = Object.groupBy(TripleProduct, (v => v[3]))
	
	const itemStyle = {
	  opacity: 0.8,
	  shadowBlur: 10,
	  shadowOffsetX: 0,
	  shadowOffsetY: 0,
	  shadowColor: 'rgba(0,0,0,0.3)'
	};
	
	//set X axis data based on select dropdown
	var xUnits = "";
	var scaleTypeX = scaleType //by default, scale type should be used for both X and Y axis
	if(selectX.value=="Year") {
		var xIndex = 27; 
		scaleTypeX='value'; //log of Year doesn't make sense in this context so use value for x-axis even if Log scaleType is selected
	} else { //Temperature
		var xIndex = 22;
		xUnits = "(keV)";
		
	}
	
	var YUnits = "";
	var toExp = true; //display exponential notiation except edge cases
	//set Y axis data based on select dropdown
	if(selectY.value=="Triple Product") {
		var yIndex = 28; 
		yUnits = " (m-3keV)"
	} else if (selectY.value=="Temperature"){
		var yIndex = 22;
		yUnits = " (keV)";
		toExp=false; 
	} else if (selectY.value=="Density"){
		var yIndex = 23;
		yUnits = " (ions/cubic meter)";
	} else { //Time
		var yIndex=24;
		yUnits = " (seconds)";
		if(selectType=="Value"){
			toExp=false;
		}
	}
	
	var m = Object.entries(g).map(v =>  ({'name': v[0]
										, 'type': 'scatter' 
										//, 'type': 'line'
										, 'itemStyle': itemStyle
										, 'data': v[1].sort()
										, 'roam': true
										, 'symbolSize': 20
										, 'label': {show: true, 'fontSize': 18, 'position': 'top', formatter: function (params) {return params.data[2];}}
										, 'color':  concept_dict[v[0]].color
										, 'symbol':  concept_dict[v[0]].marker
										//, 'moveOverlap': 'shiftY'
										, 'labelLayout': { hideOverlap: true, dy: 0 }
										}))
	var minX;
	//set the first two indexes of series data to be selected X and Y axis data
	TripleProduct.forEach(function(part, index) { 
		part[0] = part[xIndex];
		part[1] = part[yIndex];
		if(index==0) { 
			minX= part[0];
		} else {
			if(part[0] < minX) {
				minX= part[0];
			}
		}
	})
	//sort data from smallest to largest (more important for line series type compared to scatter)
	TripleProduct=m.sort((a, b) => b.data.length - a.data.length);
	  
	var option = {
	  color: ['darkred', '#fec42c', '#80F1BE'],
	  methods: {
		getDataSubset() {
		  this.$refs.barChart.chart.on('click', (params) => {
			this.subset = params.data;
		  });
		},
	  },
	  legend: {
		top: 10,
		textStyle: {
		  fontSize: 16
		}
	  },
	  grid: {
		left: '10%',
		right: 150,
		top: '18%',
		bottom: '10%'
	  },
	  tooltip: {
		backgroundColor: 'rgba(255,255,255,0.7)',
		confine: 'true',
		extraCssText: "width:550px; white-space:pre-wrap;",  //required to prevent long descriptions from expanding tooltip beyond view.
		textStyle: {
			overflow: 'truncate'		
		},
		formatter: function (param) {
		  return getDetailsHTML(param.value);
		}
	  },
	  xAxis: {
		type: scaleTypeX, //'log' or 'value'
		name: selectX.value,
		nameGap: 16,
		nameTextStyle: {
		  fontSize: 16
		},
		min: minX,
		//max: maxX,
		splitLine: {
		  show: false
		},
		axisLabel: {
		  formatter: function (params) {
			return params.toString();
		  }
		}
	  },
	  yAxis: {
		type: scaleType, //'log' or 'value'
		name: selectY.value + yUnits,
		nameLocation: 'end',
		nameGap: 20,
		nameTextStyle: {
		  fontSize: 16
		},
		splitLine: {
		  show: false
		},
		axisLabel: {
		  formatter: function (params) {
			  if(toExp){  
				return params.toExponential();
			  }
			  return params;
		  }
		}
	  },
	  series: TripleProduct
	};
	console.log("option:");
	console.log(option);
	return option;
}

//capture selected options and rebuild chart on any change
function chartChange(TripleProduct) {
		var selectX = document.getElementById('selectX');
		var selectY = document.getElementById('selectY');
		var selectType = document.getElementById('selectType').value;
		if(selectType=="Log"){
			var scaleType="log";
		} else {
			var scaleType="value";
		}
		var checkIsConcept = document.getElementById('checkIsConcept');
		var option = getOption(TripleProduct, scaleType, selectX, selectY, checkIsConcept);
		this.myChart.setOption(option); //dynamically update chart with new options.
		return;
	}

//get HTML for tooltip and popup modal which includes more detail.
function getDetailsHTML(value, addDetails) {
	const conceptImages = {
		Tokamak: 'https://www.energy.gov/sites/default/files/styles/full_article_width/public/2024-07/doe-explains-tokamaks.jpg?itok=TfoOG8ar',
		"Laser ICF": "data:image/jpeg;base64,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",
		FRC: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f8/Field-Reversed_Configuration.svg/300px-Field-Reversed_Configuration.svg.png",
		RFP: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e2/Rfp_q_profile.png/220px-Rfp_q_profile.png",
		Stellarator: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b3/W7X-Spulen_Plasma_blau_gelb.jpg/360px-W7X-Spulen_Plasma_blau_gelb.jpg",
		MagLIF: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbRN_VZ-9uR8Q8gKoyDR85_mfZUTy87FaQkQ&s",
		"Spherical Tokamak": "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1d/Tokamak_ST40_engineering_drawing.jpg/220px-Tokamak_ST40_engineering_drawing.jpg",
		Mirror: "https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Basic_Magnetic_Mirror.jpg/220px-Basic_Magnetic_Mirror.jpg",
		"Z Pinch": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRNpEy9zC2VZjfrHo903Vg7LmgcHF23WM68_w&s",
		Spheromak: "https://upload.wikimedia.org/wikipedia/en/7/7d/A_comparison_of_an_FRC_and_A_Spheromak.png",
		Pinch: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRpJemhtIVeEaIJJsyxqNAkn_YaCU6gj8dDvw&s",
	};
	var html =  ((value[8]=="Projected") ? '* Projected<br>' : '')
				+ '<i>' + schema[27].text + '：</i><b>' + value[27] + '</b>   (' + ((value[6]==null) ? '?' : value[6]) + ' - ' + ((value[7]==null) ? '?' : value[7]) + ')<br>' //Year + Year Experiments date range
				+ '<i>' + schema[28].text + '：</i><b>' + value[28].toExponential(2) + '</b> m<sup>-3</sup>keV'  //Triple product
				+ '<ul><li>n = ' + ((value[23] == null) ? '?' : value[23].toExponential(2) + ' (ions/cubic meter) - plasma density</li>') //Units explanation
				+ 	'<li>T = ' + value[22] + ' (keV) - the temperature of those ions</li>' //Temperature
				+ 	'<li>τ = ' + ((value[24] == null) ? '' : value[24] + ' (seconds) - energy confinement time</li></ul>')  //Time
				//+ ((value[15] == null) ? '' : ('<i>' + schema[15].text + ':</i> $' + Intl.NumberFormat("en", {notation: "compact", compactDisplay: "long"}).format(value[15]))) //Cost 
				//+ ((value[16] == null) ? '<br>' : ('   (<small>' + value[16] + '</small>)<br>')) // //Cost Notes
				+ '<i>Id：</i>' + value[11] + '<br>' //Experimental Identifier
				//ACTION: Add experiment images when available
				//+ '<img class="img-fluid" src="' + ((value[12] == null) ? conceptImages[value[3]] : value[12]) +'"><br><br>' // Photograph
				+ '<img class="img-fluid" src="' + conceptImages[value[3]] +'"><br><br>' // Photograph
				+ ((value[9] == null) ? '' : '<div class="text-break"><p class="word-wrap">' + value[9] + '</p></div>') // Description Project
				//+ '<i>' + schema[8].text + '：</i>' + value[8] + '<br>' //Shot (excluding since it is included at the end of Experimental Identifier
	if(addDetails){ //for modal only, not tooltip
		html += ((value[14] == null || value[14] == 0) ? '' : '<a target="_blank" href="' + value[14] + '">Project Website</a><br>') //Project Website
				+ ((value[10] == null) ? '' : '<i>' + (schema[10].text + '：</i><br>' + value[10] + '<br>')) // Description Concept
				+ ((value[5] == null) ? '' : ('<a target="_blank" href="' + value[5] + '">Wikipedia: ' + value[3] + '</a><br>')) //Wikipedia
				+ ((value[19] == null) ? '' : ((value[20] == null) ? '' : value[20] + ': ')  + ('<a target="_blank" href="' + value[19] + '">' + value[18] + '</a><br>')) //Link to Publication*/
	} else {
		html = '<h4><b>'+ value[4] + '</b><br>' + value[17]+ '</h4>' + html + '<i>  ... click for more detail</i>';
	}
	
	return html;
}
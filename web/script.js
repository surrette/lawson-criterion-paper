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
										, 'symbolSize': 20
										, 'label': {show: true, 'fontSize': 18, 'position': 'top', formatter: function (params) {return params.data[2];}}
										, 'color':  concept_dict[v[0]].color
										, 'symbol':  concept_dict[v[0]].marker
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
	var html =  ((value[8]=="Projected") ? '* Projected<br>' : '')
				+ '<i>' + schema[27].text + '：</i><b>' + value[27] + '</b>   (' + ((value[6]==null) ? '?' : value[6]) + ' - ' + ((value[7]==null) ? '?' : value[7]) + ')<br>' //Year + Year Experiments date range
				+ '<i>' + schema[28].text + '：</i><b>' + value[28].toExponential(2) + '</b> m<sup>-3</sup>keV'  //Triple product
				+ '<ul><li>n = ' + ((value[23] == null) ? '?' : value[23].toExponential(2) + ' (ions/cubic meter) - plasma density</li>') //Units explanation
				+ 	'<li>T = ' + value[22] + ' (keV) - the temperature of those ions</li>' //Temperature
				+ 	'<li>τ = ' + ((value[24] == null) ? '' : value[24] + ' (seconds) - energy confinement time</li></ul>')  //Time
				//+ ((value[15] == null) ? '' : ('<i>' + schema[15].text + ':</i> $' + Intl.NumberFormat("en", {notation: "compact", compactDisplay: "long"}).format(value[15]))) //Cost 
				//+ ((value[16] == null) ? '<br>' : ('   (<small>' + value[16] + '</small>)<br>')) // //Cost Notes
				+ '<i>Id：</i>' + value[11] + '<br>' //Experimental Identifier
				//ACTION: Add Images
				//+ ((value[12] == null) ? '' : '<img class="img-fluid" src="https://upload.wikimedia.org/wikipedia/commons/thumb/0/00/2017_TOCAMAC_Fusion_Chamber_N0689.jpg/330px-2017_TOCAMAC_Fusion_Chamber_N0689.jpg"><br><br>') // Photograph
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
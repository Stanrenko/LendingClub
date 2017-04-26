queue()
    .defer(d3.json, "/lendingclub/loans")
    .defer(d3.json, "static/geojson/us-states.json")
    .await(makeGraphs);

function makeGraphs(error, projectsJson, statesJson) {

	//Clean projectsJson data
	var lendingclubLoans = projectsJson;
  var dateFormat = d3.time.format("%b-%Y");
	lendingclubLoans.forEach(function(d) {
    d["issue_d"]= dateFormat.parse(d["issue_d"]);
    d["issue_d"].setDate(1);
		d["loan_amnt"] = +d["loan_amnt"];
	});

	//Create a Crossfilter instance
	var ndx = crossfilter(lendingclubLoans);

	//Define Dimensions
  var issueDate = ndx.dimension(function(d) { return d["issue_d"]; });
	var loanAmnt = ndx.dimension(function(d) { return d["loan_amnt"]; });
	var intRate = ndx.dimension(function(d) { return d["int_rate"]; });
	var grade = ndx.dimension(function(d) { return d["grade"]; });
  var loanStatus = ndx.dimension(function(d) { return d["loan_status"]; });
  var addrState = ndx.dimension(function(d) { return d["addr_state"]; });


	//Calculate metrics
	var numLoansByDate = issueDate.group();
	var numLoansByGrade = grade.group();
  var numLoansByLoanStatus = loanStatus.group();
  var numLoansByIntRate = intRate.group();
	var loanAmntByState = addrState.group().reduceSum(function(d) {
		return d["loan_amnt"];
	});

	var all = ndx.groupAll();
	var totalLoanAmnt = ndx.groupAll().reduceSum(function(d) {return d["loan_amnt"];});

	var max_state = loanAmntByState.top(1)[0].value;

	//Define values (to be used in charts)
	var minDate = issueDate.bottom(1)[0]["issue_d"];
	var maxDate = issueDate.top(1)[0]["issue_d"];

    //Charts
	var timeChart = dc.barChart("#time-chart");
	var gradeTypeChart = dc.rowChart("#grade-type-row-chart");
	var loanStatusChart = dc.rowChart("#loan-status-row-chart");
	var usChart = dc.geoChoroplethChart("#us-chart");
  var boxChart = dc.boxPlot("#box-test");
	var numberLoansND = dc.numberDisplay("#number-loans-nd");
	var totalLoansND = dc.numberDisplay("#total-loans-nd");

	numberLoansND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(all);

	totalLoansND
		.formatNumber(d3.format("d"))
		.valueAccessor(function(d){return d; })
		.group(totalLoanAmnt)
		.formatNumber(d3.format(".3s"));

	timeChart
		.width(600)
		.height(160)
		.margins({top: 10, right: 50, bottom: 30, left: 50})
		.dimension(issueDate)
		.group(numLoansByDate)
		.transitionDuration(500)
		.x(d3.time.scale().domain([minDate, maxDate]))
		.elasticY(true)
		.xAxisLabel("Year")
		.yAxis().ticks(4);

	gradeTypeChart
        .width(300)
        .height(250)
        .dimension(grade)
        .group(numLoansByGrade)
        .xAxis().ticks(4);

	loanStatusChart
		.width(300)
		.height(250)
        .dimension(loanStatus)
        .group(numLoansByLoanStatus)
        .xAxis().ticks(4);


	usChart.width(1000)
		.height(330)
		.dimension(addrState)
		.group(loanAmntByState)
		.colors(["#E2F2FF", "#C4E4FF", "#9ED2FF", "#81C5FF", "#6BBAFF", "#51AEFF", "#36A2FF", "#1E96FF", "#0089FF", "#0061B5"])
		.colorDomain([0, max_state])
		.overlayGeoJson(statesJson["features"], "state", function (d) {
			return d.properties.name;
		})
		.projection(d3.geo.albersUsa()
    				.scale(600)
    				.translate([340, 150]))
		.title(function (p) {
			return "State: " + p["key"]
					+ "\n"
					+ "Total Loans: " + Math.round(p["value"]) + " $";
		})

    dc.renderAll();

};

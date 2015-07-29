var fs = require('fs');
var path = require('path');
var byline = require('byline');

module.exports = loadGraph;

function loadGraph(doneCallback, fileName) {
	fileName = fileName || process.argv[2] || path.join('data', 'packages');
	if (!fs.existsSync(fileName)) {
		throw new Error('Make sure to download packages first with `download.sh`')
	}


	var graph = require('ngraph.graph')({
		uniqueLinkId: false
	});
	var pkgs = fs.readdirSync(fileName);

	function parsePkgName(foldername) {
		return foldername.match(/(.*)-[^-]+-[^-]+/)[1];
	}
	function parseDepends(line) {
		return line.match(/([_a-zA-Z0-9-]+).*/)[1];
	}

	pkgs.forEach(function(foldername) {
		var pkgname = parsePkgName(foldername);
		graph.addNode(pkgname);
		console.log(fileName, foldername, "depends");
		var depends = fs.readFileSync(path.join(fileName, foldername, "depends"), {
			encoding: 'utf8'
		}).split('\n');
		var reading = true;
		for(var i = 0; i < depends.length; i++) {
			var line = depends[i];
			if(line.length==0) continue;
			if(line[0]=='%') {
				if(line == '%DEPENDS%')
					reading = true;
				else reading = false;
			} else if(reading) {
				graph.addLink(pkgname, parseDepends(line));
				console.log("adding link "+pkgname+" - "+parseDepends(line));
			}
		}
	});
	doneCallback(graph);
}

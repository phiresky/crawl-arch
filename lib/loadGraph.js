var fs = require('fs');
var path = require('path');
var byline = require('byline');

module.exports = loadGraph;

function loadGraph(doneCallback, fileName) {
	fileName = fileName || process.argv[2] || path.join('data');
	if (!fs.existsSync(fileName)) {
		throw new Error('Make sure to download packages first with `download.sh`')
	}


	var graph = require('ngraph.graph')({
		uniqueLinkId: false
	});
	var pkgs = fs.readdirSync(path.join(fileName, 'packages'));

	function parsePkgName(foldername) {
		return foldername.match(/(.*)-[^-]+-[^-]+/)[1];
	}
	function parseDepends(line) {
		return line.match(/([_a-zA-Z0-9-]+).*/)[1];
	}

	pkgs.forEach(function(foldername) {
		var pkgname = parsePkgName(foldername);
		graph.addNode(pkgname);
		console.log("adding package "+pkgname);
		var depends = fs.readFileSync(path.join(fileName, 'packages', foldername, "depends"), {
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
			}
		}
	});

	var aurPkgs = fs.readdirSync(path.join(fileName, 'aur-mirror'));
	
	aurPkgs.forEach(function(pkgname) {
		graph.addNode(pkgname);
		console.log("adding package "+pkgname);
		var srcpath = path.join(fileName, 'aur-mirror', pkgname, ".SRCINFO");
		var srcinfo;
		try {
			srcinfo = fs.readFileSync(srcpath, {
				encoding: 'utf8'
			}).split('\n');
		} catch(e) {
			console.log("can't read "+srcpath);
			return;
		}
		for(var i = 0; i < srcinfo.length; i++) {
			var line = srcinfo[i].trim();
			var match = line.match(/depends = ([^><:]+).*/);
			if(match) {
				graph.addLink(pkgname, match[1]);
			}
		}
	});
	doneCallback(graph);
}

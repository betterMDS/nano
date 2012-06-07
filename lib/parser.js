var fs = require("./fs").fs;
var log = require("./log").log('PRS', 1);

var parser = {
	copyStructure: function(struct, root, dest){
		//	summary:
		//		Key method. Use an object structure to determine which files
		//		from root shoud be copied to destination.
		//
		var paths = parser.resolvePaths(struct, '');
		console.log('paths\n', paths);
		paths.forEach(function(p){
			var src = root +  p;
			var dst = dest +  p;
			log('   copy:', src, ' -- ', dst)
			fs.copy(src, dst);
		});
	},

	resolvePaths: function(obj, path){
		//	summary:
		//		Recursively loops through an object and resolves
		//		properties into a flattened array of file paths.
		//		path arg usually starts with "".
		//
		path = path || '';
		var a = [];
		if(Array.isArray(obj)){
			obj.forEach(function(fn){
				var result = parser.resolvePaths(fn, path);
				a = a.concat(result);
			});
			return a.length == 1 ? a[0] : a;

		}else if(typeof obj == 'object'){
			for(var nm in obj){
				var result = parser.resolvePaths(obj[nm], path + '/' + nm);
				a = a.concat(result);
			}

			return a.length == 1 ? a[0] : a;
		}
		log('  path:', path + ' ---- ' + obj)
		return fs.isFile(path) ? path :  path + '/' + obj;
	},

	getDeployFolderName: function(filename, deployFolderPrefix, incrementVersion){
		//	summary:
		//		Pull a folder name variable ending in vNN (string v, number N)
		//		from a file. Optionally increment the version.
		//
		var str = fs.readFile(filename);
		var a = str.split('\n');
		var line;
		for(var i = 0; i<a.length;i++){
			if(a[i].indexOf(deployFolderPrefix) > -1){
				line = a[i];
				break;
			}
		}
		if(incrementVersion){
			var oldLine = line;
			line = line.replace(/v\d+/, function(vstr){
				var v = Number(vstr.substr(1));
				return 'v' + (v+1);
			});
			str = str.replace(oldLine, line);
			fs.writeFile(filename, str);

		}
		console.log('line:::', line);

		var name = line.split('=')[1].trim().replace(/\;|\,|\'|\"/g, '');
		if(/\//.test(name)){
			name = name.split('/');
			name = name[name.length-1];
		}
		console.log('folder name:::', name);
		return name;
	}
};

exports.parser = parser;
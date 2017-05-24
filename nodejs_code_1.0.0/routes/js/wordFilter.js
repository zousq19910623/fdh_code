var fs = require('fs');
var util = require("util");

var path = __dirname + '/keywords';

var map = {};

var lineReader = require('readline').createInterface({
	input: require('fs').createReadStream(path, { encoding: 'UTF-8' })
});

lineReader.on('line', function(line) {
	if(!line)
		return;
	WordFilter.prototype.addWord(line);
});

function WordFilter() {
	
};

WordFilter.prototype.addWord = function(word) {
	var parent = map;

	for(var i = 0; i < word.length; i++) {
		if(!parent[word[i]]) {
			parent[word[i]] = {};
		}
		parent = parent[word[i]];
	}
	parent.isEnd = true;
};

WordFilter.prototype.filter = function(s, cb) {
	for(var i = 0; i < s.length; i++) {
		parent = map;
		if(s[i] == '*') {
			continue;
		}

		var found = false;
		var skip = 0;
		var sWord = '';
		for(var j = i; j < s.length; j++) {
			if(!parent[s[j]]) {
				found = false;
				skip = j - i;
				break;
			}

			sWord = sWord + s[j];
			
			if(parent[s[j]].isEnd) {
				found = true;
				skip = j - i;
				break;
			}
			
			parent = parent[s[j]];
		}

		if(skip > 1) {
			i += skip;
		}

		if(!found) {
			continue;
		} 

		var stars = '*';
		for(var k = 0; k < skip; k++) {
			stars = stars + '*';
		}

		var reg = new RegExp(sWord, 'g')
		s = s.replace(reg, stars);
	}

	if(typeof cb === 'function') {
		cb(null, s);
	}

	return s;
};

module.exports = new WordFilter();
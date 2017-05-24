var log4js = require("log4js");
var cluster = require("cluster");
var logger = null;
var config = require("./config.js");

if(config.Server.isCluster) {
	if(cluster.isMaster) {
		// Init master logger
		log4js.configure({
			appenders: [{
				// Adding only one, "clustered" appender.
				type: "clustered",

				// Add as many "normal" appenders as you like.
				// They will all be used once the "clustered" master appender receives a loggingEvent
				appenders: [{
					type: "console"
				}, {
					"type": "dateFile",
					"filename": "logs/access.log",
					"pattern": "-yyyy-MM-dd",
					"alwaysIncludePattern": true
				},
				{
					"type": "dateFile",
					"filename": "logs/pay.log",
					"pattern": "-yyyy-MM-dd",
					"alwaysIncludePattern": true,
					"category": "pay-logger"
				}]
			}]
		});

		// Init logger like you used to
		logger = log4js.getLogger();
		logger.setLevel(config.Server.logLevel);
	}
	else {
		// Init worker loggers, adding only the clustered appender here.
		log4js.configure({
			appenders: [{
				type: "clustered"
			}]
		});

		// Init logger like you used to
		logger = log4js.getLogger("worker_" + cluster.worker.id);
		logger.setLevel(config.Server.logLevel);
	}
}
else {
	log4js.configure({
		appenders: [
			{
				type: "console"
			},
			{
				"type": "dateFile",
				"filename": "logs/access.log",
				"pattern": "-yyyy-MM-dd",
				"alwaysIncludePattern": true,
				"backups": 10
			},
			{
				"type": "dateFile",
				"filename": "logs/fdh.log",
				"pattern": "-yyyy-MM-dd",
				"alwaysIncludePattern": true,
				"category": "fdh-logger"
			}
		]
	});
	logger = log4js.getLogger();
	logger.setLevel(config.Server.logLevel);
}

module.exports = logger;

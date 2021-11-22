module.exports = {
	apps : [{
	  name: "push-server",
	  script: "./server.js",
	  env: {
		NODE_ENV: "production",
	  }
	}]
  }
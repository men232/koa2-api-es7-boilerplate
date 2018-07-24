module.exports = {
	httpServer: {
		proxy: true
	},
	mongo: {
		hosts: [process.env.MONGODB_URI],
		options: {
			connectTimeoutMS: 1000 * 15, // 15 sec.
			socketTimeoutMS: 1000 * 20 // 20 sec.
		}
	}
};

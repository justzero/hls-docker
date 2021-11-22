const ffmpeg = require('fluent-ffmpeg');
setTimeout(() => {
	(new ffmpeg())
		.input('./video.mp4')
		.inputOptions('-stream_loop 5')
		.input('http://cctvalih5ca.v.myalicdn.com/live/cctv1_2/index.m3u8')
		.complexFilter([
			{
				filter: 'scale2ref',
				options: {
					w: 'iw/3',
					h: 'ih/3'
				},
				inputs: ['1:v', '0:v'],
				outputs: ['wm', 'base']
			},
			// Overlay 'green' onto 'padded', moving it to the center,
			// and name output 'redgreen' 
			{
				filter: 'overlay',
				options: 'W-w',
				inputs: ['base', 'wm'],
				outputs: 'op'
			},
			{
				filter: 'amix',
				options: {
					inputs: 2,
					duration: 'longest'
				},
				volume: 1,
			},
			{
				filter: 'drawtext',
				options: {
					fontfile: '/vagrant/fonts/LucidaGrande.ttc',
					text: 'THIS IS TEXT',
					fontsize: 20,
					fontcolor: 'white',
					x: '(main_w/2-text_w/2)',
					y: 50,
					shadowcolor: 'black',
					shadowx: 2,
					shadowy: 2,
					enable: 'lt(mod(t\, 3)\, 1)'
				},
				inputs: 'op',
				outputs: 'vc'
			},

		], 'vc')
		.on('start', () => {
			console.log('Push start...')
		})
		.on('error', function (err) {
			console.log('Push : An error occurred: ' + err.message)
		})
		.on('end', function () {
			console.log('Push finished !')
		})
		// .output('./1.mp4')
		.format('flv')
		// .output('rtmp://live-server/live/video', { end: true })
		.output('rtmp://localhost:1935/live/video', { end: true })
		.duration(600)
		.run()

	// http://live-server:80/live/video.m3u8
}, 0)


// setTimeout(() => {
// 	// const time = 20
// 	(new ffmpeg())
// 		// .input('http://live-server/hls/video.m3u8')
// 		.input('http://localhost:8080/hls/video.m3u8')
// 		.output('./out-201.mp4')
// 		.duration(20)
// 		.on('start', () => {
// 			console.log('Download start...')
// 		})
// 		.on('error', function (err) {
// 			console.log('Download : An error occurred: ' + err.message)
// 		})
// 		.on('end', function () {
// 			console.log('Download finished !')
// 		})
// 		.run()
// }, 11000)

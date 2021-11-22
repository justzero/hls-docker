const ffmpeg = require('fluent-ffmpeg')
const _ = require('lodash')
const m = require('moment')
const base = (process.env.NODE_ENV === 'production') ? 'live-server' : 'localhost'

const WIDTH = 960
const HEIGHT = 540
const OPTS = [{
	color: 'red',
	num: 12,
	time: 15
}, {
	color: 'blue',
	num: 10,
	time: 37
}, {
	color: 'green',
	num: 7,
	time: 49
}, {
	color: 'blue',
	num: 10,
	time: 71
}, {
	color: 'green',
	num: 7,
	time: 93
}, {
	color: 'red',
	num: 15,
	time: 125
}]
const filterFactor = (w, h, opts) => {
	const def = [
		{
			filter: 'scale',
			options: {
				w: w,
				h: h
			},
			inputs: '0:v',
			outputs: 'base'
		},
		{
			filter: 'scale',
			options: {
				w: w / 4,
				h: h / 4
			},
			inputs: '1:v',
			outputs: 'wm'
		},
		{
			filter: 'overlay',
			options: 'W-w',
			inputs: ['base', 'wm'],
			outputs: 'out-0'
		},
		{
			filter: 'amix',
			options: {
				inputs: 2,
				duration: 'longest'
			},
			volume: 1,
		},
	]
	_.each(opts, ({ color, time, num }, index) => {
		def.push({
			filter: 'movie',
			options: `./src/${color}.png`,
			outputs: `next-1-${index}`
		})
		def.push({
			filter: 'overlay',
			options: {
				x: `(main_w/2-195 + 65 * ${index})`,
				y: `if(lte(t, ${time}), -100, 30)`,
			},
			inputs: [`out-${index}`, `next-1-${index}`],
			outputs: `next-2-${index}`
		})
		def.push({
			filter: 'drawtext',
			options: {
				fontfile: './src/FiraCode-Light.ttf',
				text: num,
				fontsize: 30,
				fontcolor: color,
				x: `(main_w/2-195 + 65 * ${index} + 40 - text_w/2)`,
				y: 55,
				enable: `gte(t, ${time})`
			},
			inputs: `next-2-${index}`,
			outputs: `out-${index + 1}`
		})
	})
	return def
}

const main = () => {
	console.log('run main ...')
}

const livePush = (fileName, cctv1Live, time) => {
	const liveUri = '/live/l' + m().format('YYYYMMDD')
	new ffmpeg()
		.input(fileName)
		.inputOptions('-stream_loop 20')
		.input(cctv1Live)
		.complexFilter(filterFactor(WIDTH, HEIGHT, OPTS), `out-${OPTS.length}`)
		.on('start', () => {
			console.log('Push start...')
		})
		.on('error', function (err) {
			console.log('Push : An error occurred: ' + err.message)
		})
		.on('end', function () {
			console.log('Push finished !')
		})
		.format('flv')
		// .output('rtmp://live-server:1935/live/video', { end: false, autoClose: false })
		// .output('rtmp://live-server:1935/live/video', { end: true })
		.output(`rtmp://${base}:1935` + liveUri, { end: true, autoClose: false })
		.duration(time)
		.run()
		return liveUri
}

const liveDown = (liveUri, fileName, time) => {
	(new ffmpeg())
		// .input('rtmp://live-server:1935/live/video')
		.input(`rtmp://${base}:1935` + liveUri)
		.output(fileName)
		.duration(time)
		.on('start', () => {
			console.log('Download start...')
		})
		.on('error', function (err) {
			console.log('Download : An error occurred: ' + err.message)
		})
		.on('end', function () {
			console.log('Download finished !')
		})
		.run()
}


module.exports = { main, liveDown, livePush }
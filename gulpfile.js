var gulp = require('gulp'),
    initGulpTasks = require('react-component-gulp-tasks');

var taskConfig = {

	component: {
		name: 'ProgressButton',
		dependencies: [
			'blacklist',
			'react',
			'react/addons'
		],
		less: {
			path: 'less',
			entry: 'component.less'
		}
	},

	example: {
		src: 'example/src',
		dist: 'example/dist',
		files: [
			'index.html',
			'.gitignore'
		],
		scripts: [
			'example.js'
		],
		less: [
			'example.less'
		]
	}

};

initGulpTasks(gulp, taskConfig);

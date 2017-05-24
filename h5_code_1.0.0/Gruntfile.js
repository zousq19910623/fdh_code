var cmdFiles = ['src/index.js', 'src/invitation.js', 'src/report.js',
	"src/toolkit.js", "src/config.js", "src/homePage.js",
	"src/myfans.js", "src/myloves.js", "src/postdetail.js", "src/detailcomment.js",
	"src/mycollections.js", "src/myattentions.js", "src/detaillike.js", "src/mycomments.js",
	"src/message.js", "src/messageComment.js", "src/messageFas.js", "src/messageLove.js", "src/messageSystem.js",
	"src/personalinfo.js", "src/sharetootherplatforms.js", "src/welcome.js", "src/welcome2.js", "src/hotpost.js"
];
var tmpFiles = [];
for(var i = 0; i < cmdFiles.length; i++) {
	var file = cmdFiles[i];
	tmpFiles.push("build/tmp/" + file);
	//console.log(tmpFiles[i]);
}

module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		//清除目录
		clean: {
			build: {
				src: "build/"
			},
			tmp: {
				src: "build/tmp/"
			}
		},
		copy: {
			build: {
				files: [
					//{expand: true, src: ['src/**/*.js'], dest: 'build'},
					{ expand: true, src: ['css/**/*.min.css'], dest: 'build' },
					{ expand: true, src: ['lib/**/*.min.js'], dest: 'build' },
					{ expand: true, src: ['fonts/**/*'], dest: 'build' },
					{ expand: true, src: ['images/**/*'], dest: 'build' },
					{ src: './first.html', dest: 'build/first.html' },
					{ src: './index.html', dest: 'build/index.html' },
					{ src: './homepage.html', dest: 'build/homepage.html' },
					{ src: './invitation.html', dest: 'build/invitation.html' },
					{ src: './report.html', dest: 'build/report.html' },
					{ src: './message.html', dest: 'build/message.html' },
					{ src: './myfans.html', dest: 'build/myfans.html' },
					{ src: './mycollections.html', dest: 'build/mycollections.html' },
					{ src: './myloves.html', dest: 'build/myloves.html' },
					{ src: './myattentions.html', dest: 'build/myattentions.html' },
					{ src: './postdetail.html', dest: 'build/postdetail.html' },
					{ src: './detailcomment.html', dest: 'build/detailcomment.html' },
					{ src: './detaillike.html', dest: 'build/detaillike.html' },
					{ src: './mycomments.html', dest: 'build/mycomments.html' },
					{ src: './messageComments.html', dest: 'build/messageComments.html' },
					{ src: './messageFas.html', dest: 'build/messageFas.html' },
					{ src: './messageLove.html', dest: 'build/messageLove.html' },
					{ src: './messageSystem.html', dest: 'build/messageSystem.html' },
					{ src: './personalinfo.html', dest: 'build/personalinfo.html' },
					{ src: './sharetootherplatforms.html', dest: 'build/sharetootherplatforms.html' },
					{ src: './welcome.html', dest: 'build/welcome.html' },
					{ src: './welcome2.html', dest: 'build/welcome2.html' },
					{ src: './hotpost.html', dest: 'build/hotpost.html' },
				]
			},
			debug: {
				files: [
					//{expand: true, src: ['src/**/*.js'], dest: 'build'},
					{ expand: true, src: ['css/**/*.css'], dest: 'build' },
					{ expand: true, src: ['lib/**/*.js'], dest: 'build' },
					{ expand: true, src: ['fonts/**/*'], dest: 'build' },
					{ expand: true, src: ['images/**/*'], dest: 'build' },
					{ expand: true, src: ['src/**/*'], dest: 'build' },
					{ src: './first.html', dest: 'build/first.html' },
					{ src: './index.html', dest: 'build/index.html' },
					{ src: './homepage.html', dest: 'build/homepage.html' },
					{ src: './invitation.html', dest: 'build/invitation.html' },
					{ src: './report.html', dest: 'build/report.html' },
					{ src: './message.html', dest: 'build/message.html' },
					{ src: './myfans.html', dest: 'build/myfans.html' },
					{ src: './mycollections.html', dest: 'build/mycollections.html' },
					{ src: './myloves.html', dest: 'build/myloves.html' },
					{ src: './myattentions.html', dest: 'build/myattentions.html' },
					{ src: './postdetail.html', dest: 'build/postdetail.html' },
					{ src: './detailcomment.html', dest: 'build/detailcomment.html' },
					{ src: './detaillike.html', dest: 'build/detaillike.html' },
					{ src: './detailcomment.html', dest: 'build/detailcomment.html' },
					{ src: './detaillike.html', dest: 'build/detaillike.html' },
					{ src: './mycomments.html', dest: 'build/mycomments.html' },
					{ src: './messageComments.html', dest: 'build/messageComments.html' },
					{ src: './messageFas.html', dest: 'build/messageFas.html' },
					{ src: './messageLove.html', dest: 'build/messageLove.html' },
					{ src: './messageSystem.html', dest: 'build/messageSystem.html' },
					{ src: './personalinfo.html', dest: 'build/personalinfo.html' },
					{ src: './sharetootherplatforms.html', dest: 'build/sharetootherplatforms.html' },
					{ src: './welcome.html', dest: 'build/welcome.html' },
					{ src: './welcome2.html', dest: 'build/welcome2.html' },
					{ src: './hotpost.html', dest: 'build/hotpost.html' },
				]
			}
		},
		useminPrepare: {
			build: 'index.html',
			options: {
				dest: 'build'
			}
		},

		transport: {
			build: {
				options: {
					// 是否采用相对地址
					relative: true,
					// 生成具名函数的id的格式 默认值为 {{family}}/{{name}}/{{version}}/{{filename}}
					format: '../src/hellosea/{{filename}}'
				},
				files: [{
					// 相对路径地址
					'expand': true,
					'cwd': './',
					// 需要生成具名函数的文件集合
					'src': cmdFiles,
					// 生成存放的文件目录。里面的目录结构与 src 里各个文件名带有的目录结构保持一致
					'dest': 'build/tmp/'
				}]
			}
		},

		// 文件合并
		concat: {
			build: {
				options: {
					// 是否采用相对地址
					//relative: true
					noncmd: false
				},
				files: [{
						// 合并后的文件地址
						'build/tmp/src/main.min.js': ['build/tmp/src/index.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/homePage.min.js': ['build/tmp/src/homePage.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/invitation.min.js': ['build/tmp/src/invitation.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					}, {
						// 合并后的文件地址
						'build/tmp/src/mycollections.min.js': ['build/tmp/src/mycollections.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/report.min.js': ['build/tmp/src/report.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/message.min.js': ['build/tmp/src/message.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/myfans.min.js': ['build/tmp/src/myfans.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/myloves.min.js': ['build/tmp/src/myloves.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/myattentions.min.js': ['build/tmp/src/myattentions.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/postdetail.min.js': ['build/tmp/src/postdetail.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/detailcomment.min.js': ['build/tmp/src/detailcomment.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/detaillike.min.js': ['build/tmp/src/detaillike.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/mycomments.min.js': ['build/tmp/src/mycomments.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/messageComments.min.js': ['build/tmp/src/messageComments.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/messageFas.min.js': ['build/tmp/src/messageFas.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/messageLove.min.js': ['build/tmp/src/messageLove.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/messageSystem.min.js': ['build/tmp/src/messageSystem.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/personalinfo.min.js': ['build/tmp/src/personalinfo.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/sharetootherplatforms.min.js': ['build/tmp/src/sharetootherplatforms.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/welcome.min.js': ['build/tmp/src/welcome.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/welcome2.min.js': ['build/tmp/src/welcome2.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					},
					{
						// 合并后的文件地址
						'build/tmp/src/hotpost.min.js': ['build/tmp/src/hotpost.js', "build/tmp/src/toolkit.js", "build/tmp/src/config.js"]
					}

				]

			}
		},
		//压缩JS
		uglify: {
			build: {
				files: [{
						src: ["lib/mui.zoom.js", "lib/mui.previewimage.js",
							"lib/mui.pullToRefresh.js", "lib/mui.pullToRefresh.material.js",
							"lib/lanren.js",
						],
						dest: 'build/src/index.min.js'
					},
					{
						src: ["lib/mui.zoom.js", "lib/mui.previewimage.js"],
						dest: 'build/src/homePage.min.js'
					},
					{
						src: ["src/common.js", "src/diyUpload.js", "src/webiaoqin.js", "src/FLJPlugin.js"],
						dest: 'build/src/invitation.min.js'
					},
					{
						src: ["lib/mui.zoom.js", "lib/mui.previewimage.js"],
						dest: 'build/src/mycollections.min.js'
					},
					{
						src: ["lib/mui.zoom.js", "lib/mui.previewimage.js"],
						dest: 'build/src/myloves.min.js'
					},
					{
						src: ["src/diyUpload.js", "src/webiaoqin.js"],
						dest: 'build/src/invitationcomment.min.js'
					},
					{
						src: ["lib/mui.picker.js", "lib/mui.poppicker.js", "lib/city.data.js"],
						dest: 'build/src/personalinfo.min.js'
					},
					{
						src: ["lib/moment.js", "lib/mui.picker_welcome.js", "lib/mui.poppicker_welcome.js"],
						dest: 'build/src/welcome2.min.js'
					},
					{
						src: ["lib/mui.zoom.js", "lib/mui.previewimage.js"],
						dest: 'build/src/hotpost.min.js'
					},
					{
						src: ["lib/mui.zoom.js", "lib/mui.previewimage.js"],
						dest: 'build/src/detailcomment.min.js'
					},
				]
			},
			cmdBuild: {
				files: [{
						src: ['build/tmp/src/main.min.js'],
						dest: 'build/src/index.js'
					}, {
						src: ['build/tmp/src/homePage.min.js'],
						dest: 'build/src/homePage.js'
					}, {
						src: ['build/tmp/src/invitation.min.js'],
						dest: 'build/src/invitation.js'
					}, {
						src: ['build/tmp/src/mycollections.min.js'],
						dest: 'build/src/mycollections.js'
					}, {
						src: ['build/tmp/src/report.min.js'],
						dest: 'build/src/report.js'
					}, {
						src: ['build/tmp/src/message.min.js'],
						dest: 'build/src/message.js'
					}, {
						src: ['build/tmp/src/myfans.min.js'],
						dest: 'build/src/myfans.js'
					}, {
						src: ['build/tmp/src/myloves.min.js'],
						dest: 'build/src/myloves.js'
					}, {
						src: ['build/tmp/src/myattentions.min.js'],
						dest: 'build/src/myattentions.js'
					}, {
						src: ['build/tmp/src/postdetail.min.js'],
						dest: 'build/src/postdetail.js'
					}, {
						src: ['build/tmp/src/detailcomment.min.js'],
						dest: 'build/src/detailcomment.js'
					}, {
						src: ['build/tmp/src/detaillike.min.js'],
						dest: 'build/src/detaillike.js'
					}, {
						src: ['build/tmp/src/mycomments.min.js'],
						dest: 'build/src/mycomments.js'
					}, {
						src: ['build/tmp/src/messageComments.min.js'],
						dest: 'build/src/messageComments.js'
					}, {
						src: ['build/tmp/src/messageFas.min.js'],
						dest: 'build/src/messageFas.js'
					}, {
						src: ['build/tmp/src/messageLove.min.js'],
						dest: 'build/src/messageLove.js'
					}, {
						src: ['build/tmp/src/messageSystem.min.js'],
						dest: 'build/src/messageSystem.js'
					}, {
						src: ['build/tmp/src/personalinfo.min.js'],
						dest: 'build/src/personalinfo.js'
					}, {
						src: ['build/tmp/src/sharetootherplatforms.min.js'],
						dest: 'build/src/sharetootherplatforms.js'
					}, {
						src: ['build/tmp/src/welcome.min.js'],
						dest: 'build/src/welcome.js'
					}, {
						src: ['build/tmp/src/welcome2.min.js'],
						dest: 'build/src/welcome2.js'
					},
					{
						src: ['build/tmp/src/hotpost.min.js'],
						dest: 'build/src/hotpost.js'
					},
				]
			},
			options: {
				stripBanners: true,
				banner: '/*! <%=pkg.name%>-<%=pkg.version%>.js <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			}
		},

		//压缩CSS
		cssmin: {
			build: {
				files: [{
						cwd: './',
						src: ['css/index.css', 'css/common.css', 'css/iconfont.css'],
						dest: './build/css/index.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/index.css', 'css/iconfont.css', 'css/homepage.css'],
						dest: './build/css/homePage.min.css'
					},
					{
						cwd: './',
						src: ['css/webiaoqing.css', 'css/webuploader.css', 'css/diyUpload.css', 'css/invitation.css', 'css/common.css'],
						dest: './build/css/invitation.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/report.css'],
						dest: './build/css/report.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/message.css'],
						dest: './build/css/message.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/myfans.css'],
						dest: './build/css/myfans.min.css'
					}, {
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/myattentions.css'],
						dest: './build/css/myattentions.min.css'
					},
					{
						cwd: './',
						src: ['css/mycollections.css', 'css/common.css', 'css/iconfont.css'],
						dest: './build/css/mycollections.min.css'
					},
					{
						cwd: './',
						src: ['css/index.css', 'css/common.css', 'css/iconfont.css'],
						dest: './build/css/myloves.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/detailcomment.css'],
						dest: './build/css/detailcomment.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/mycomments.css', 'css/report.css'],
						dest: './build/css/mycomments.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/messageComments.css', 'css/report.css'],
						dest: './build/css/messageComments.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/messageFas.css', 'css/report.css'],
						dest: './build/css/messageFas.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/messageLove.css', 'css/report.css'],
						dest: './build/css/messageLove.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/messageSystem.css', 'css/report.css'],
						dest: './build/css/messageSystem.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/mui.picker.css', 'css/mui.poppicker.css', 'css/personalinfo.css'],
						dest: './build/css/personalinfo.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/iconfont.css', 'css/sharetootherplatforms.css'],
						dest: './build/css/sharetootherplatforms.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/welcome.css'],
						dest: './build/css/welcome.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/welcome.css', 'css/mui.picker_welcome.css', 'css/mui.poppicker_welcome.css'],
						dest: './build/css/welcome2.min.css'
					},
					{
						cwd: './',
						src: ['css/common.css', 'css/hotpost.css', 'css/iconfont.css'],
						dest: './build/css/hotpost.min.css'
					}

				]
			}
		},
		// 处理html中css、js 引入合并问题
		usemin: {
			build: ['build/index.html', 'build/homePage.html',
				'build/invitation.html',
				'build/report.html', 'build/message.html', 'build/myfans.html',
				'build/mycollections.html', 'build/myloves.html', 'build/myattentions.html',
				'build/detailcomment.html', 'build/detaillike.html',
				'build/mycomments.html', 'build/messageComment.html', 'build/messageFas.html',
				'build/messageLove.html', 'build/messageSystem.html', 'build/personalinfo.html',
				'build/sharetootherplatforms.html', 'build/welcome.html', 'build/welcome2.html',
				'build/hotpost.html'
			]
		},
		csslint: {
			build: ['css/**/*.css'],
			options: {
				csslintrc: 'csslintrc'
			}
		},

		eslint: {
			build: {
				src: ["src/toolkit.js"]
			},
			options: {
				"config": '.eslintrc.js',
				fix: true
			}
		},

		//	    watch:{
		//	   		build:{
		//	   			files: ['src/**/*.js','css/**/*.css'],
		//	   			task: ['jshint','csslint','uglify']
		//	   		},
		//	   		options: { 
		//	   			spawn: false
		//	   		}
		//	    }

	});

	//load plugin
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-csslint');
	grunt.loadNpmTasks("grunt-contrib-eslint");
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks('grunt-cmd-transport');
	grunt.loadNpmTasks('grunt-cmd-concat');
	grunt.loadNpmTasks("grunt-usemin");

	//config task
	grunt.registerTask('default', ['clean:build',
		'copy:build',
		'useminPrepare:build',
		'transport:build',
		'concat:build',
		'uglify:build',
		'uglify:cmdBuild',
		'clean:tmp',
		'cssmin:build',
		'usemin:build'
	]);

	grunt.registerTask('debug', [
		'clean:build',
		'copy:debug',
	]);
};
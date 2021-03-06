'use strict';
var yeoman = require('yeoman-generator');

var Generator = yeoman.generators.Base.extend({
  constructor: function(args, options) {
    yeoman.generators.Base.apply(this, arguments);

    console.log(this.yeoman);

    this.pkg = require('../package.json');

    this.on('end', function () {
      this.installDependencies({ skipInstall: options['skip-install'] });
    });
  },

  askForApplicationType: function() {
    var cb = this.async();

    var prompts = [
      {
        type: 'list',
        name: 'type',
        message: 'Select your project type:',
        choices: ['Landing page', 'Web Application']
      }
    ];

    this.prompt(prompts, function(props) {
      this.type = props.type;

      cb();
    }.bind(this));
  },

  askForMetatags: function() {
    var cb = this.async();

    var prompts = [
      {
        type: 'list',
        name: 'stylesPreprocessor',
        message: 'Which preprocessor do you use?',
        choices: ['Less', 'Sass']
      },
      {
        type: 'confirm',
        name: 'baseStyleStructure',
        message: 'Will you use styles directory structure based on SMACSS?'
      },
      {
        type: 'confirm',
        name: 'metatags',
        message: 'Do you want to include meta tags for social networks?'
      },
      {
        type: 'confirm',
        name: 'analytics',
        message: 'Should I generate Google Analytics code?'
      }
    ];

    this.prompt(prompts, function(props) {
      this.less = props.stylesPreprocessor === 'Less';
      this.sass = props.stylesPreprocessor === 'Sass';

      this.baseStyleStructure = props.baseStyleStructure;
      this.metatags = props.metatags;
      this.analytics = props.analytics;

      cb();
    }.bind(this));
  },

  askForAngular: function() {
    var cb = this.async();

    var prompts = [];

    this.angular = false;

    if (this.type === 'Web Application') {
      this.angular = true;
      prompts = [
        {
          type: 'confirm',
          name: 'tests',
          message: 'Do you want to include tests?'
        },
        {
          type: 'confirm',
          name: 'unit',
          message: 'Should I set up unit testing with Jasmine?',
          when: function(props) {
            return props.tests;
          }
        },
        {
          type: 'confirm',
          name: 'e2e',
          message: 'Will you use end to end testing (using CasperJS) as well?',
          when: function(props) {
            return props.tests;
          }
        }
      ];
    }

    this.prompt(prompts, function(props) {
      this.tests = props.tests;
      this.unit = props.unit;
      this.e2e = props.e2e;

      cb();
    }.bind(this));
  },

  projectFiles: function() {
    this.copy('bowerrc', '.bowerrc');
    this.copy('gitignore', '.gitignore');
    this.copy('editorconfig', '.editorconfig');
    this.copy('jshintrc', '.jshintrc');
    this.copy('jscsrc', '.jscsrc');
    this.copy('_bower.json', 'bower.json');
    this.copy('substitute-config.js', 'substitute-config.js');
    this.copy('post-deploy.sh', 'post-deploy.sh');
    this.copy('_package.json', 'package.json');
    this.copy('src/humans.txt', 'src/humans.txt');
  },

  app: function() {
    this.mkdir('src/images/sprites');
    this.mkdir('dist');

    this.copy('src/scripts/main.js', 'src/scripts/main.js');

    this.copy('gulpfile.js', 'gulpfile.js');
    this.copy('gulpfile-production.js', 'gulpfile-production.js');

    this.template('src/index.html', 'src/index.html');

    if (this.angular) {
      this.copy('src/scripts/home/index.js', 'src/scripts/home/index.js');
      this.copy('src/scripts/home/HomeCtrl.js', 'src/scripts/home/HomeCtrl.js');
    }
  },

  styles: function() {
    var ext;
    
    if (this.less) {
      ext = 'less';
    }
    else if (this.sass) {
      ext = 'scss';
      this.copy('sass-support.js', 'sass-support.js');
    }
    
    this.copy('src/styles/main.less', 'src/styles/main.' + ext);

    if (this.baseStyleStructure) {
      this.copy('src/styles/base/fonts.less', 'src/styles/base/fonts.' + ext);
      this.copy('src/styles/base/global.less', 'src/styles/base/global.' + ext);
      this.copy('src/styles/base/links.less', 'src/styles/base/links.' + ext);
      this.copy('src/styles/base/normalize.css', 'src/styles/base/normalize.' + ext);
      this.copy('src/styles/components/column.less', 'src/styles/components/column.' + ext);
      this.copy('src/styles/components/component.less', 'src/styles/components/component.' + ext);
      this.copy('src/styles/modules/module.less', 'src/styles/modules/module.' + ext);
      this.copy('src/styles/animations.less', 'src/styles/animations.' + ext);
      this.copy('src/styles/helpers.less', 'src/styles/helpers.' + ext);
      this.copy('src/styles/main.less', 'src/styles/main.' + ext);
    }
  },

  tests: function() {
    if (this.e2e || this.unit) {
      this.mkdir('spec');

      if (this.e2e) {
        this.mkdir('spec/e2e');
        this.copy('spec/e2e/example.js', 'spec/e2e/example.js');
      }

      if (this.unit) {
        this.copy('karma.conf.js', 'karma.conf.js');

        this.mkdir('spec/unit');
        this.copy('spec/unit/exampleSpec.js', 'spec/unit/exampleSpec.js');
      }
    }
  }
});

module.exports = Generator;


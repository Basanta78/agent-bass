const scanner = require('sonarqube-scanner').default;

scanner(
    {
        serverUrl: 'http://localhost:9000',
        token: "sqp_e5f906869c713f405ac0129512928ec61be2b503",
        options: {
            'sonar.projectName': 'sonarqube-nodejs-project',
            'sonar.projectDescription': 'Node.js project with SonarQube integration',
            'sonar.projectKey': 'sonarqube-nodejs-project',
            'sonar.projectVersion': '0.0.1',
            'sonar.projectBaseDir': './agent-bass',
            'sonar.sources': './src',
            'sonar.exclusions': '**/node_modules/**',
            'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
            'sonar.sourceEncoding': 'UTF-8',
            'sonar.login': 'sqp_e5f906869c713f405ac0129512928ec61be2b503',
            'sonar.cpd.minLines': '1'
        }
    },
    error => {
        if (error) {
            console.error(error);
        }
        process.exit();
    }
);

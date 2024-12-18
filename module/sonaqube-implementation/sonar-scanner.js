const scanner = require('sonarqube-scanner').default;

scanner(
    {
        serverUrl: 'http://localhost:9000',
        token: "sqp_f66398cd2b7636357a9d6520a32b60d02cb85517",
        options: {
            'sonar.projectName': 'sonarqube-nodejs-project',
            'sonar.projectDescription': 'Node.js project with SonarQube integration',
            'sonar.projectKey': 'sonarqube-nodejs-project',
            'sonar.projectVersion': '0.0.1',
            'sonar.sources': './src',
            'sonar.tests': './tests',
            'sonar.exclusions': '**/node_modules/**',
            'sonar.javascript.lcov.reportPaths': 'coverage/lcov.info',
            'sonar.sourceEncoding': 'UTF-8',
            'sonar.login':'sqp_f66398cd2b7636357a9d6520a32b60d02cb85517',
            'sonar.cpd.minLines':'1'
        }
    },
    error => {
        if (error) {
            console.error(error);
        }
        process.exit();
    }
);

module.exports = {
  ci: {
    collect: {
      extends: 'lighthouse:default',
      startServerCommand: 'yarn start', // 서버를 키는 명령어를 통해서도 실행 가능
      url: ['http://localhost:3000'],
      numberOfRuns: 3,
    },
    upload: {
      target: 'filesystem',
      outputDir: './lhci_reports',
      reportFilenamePattern: '%%PATHNAME%%-%%DATETIME%%-report.%%EXTENSION%%',
    },
    assert: {
      assertions: {
        'first-contentful-paint': ['error', { minScore: 0.6 }],
      },
    },
  },
}

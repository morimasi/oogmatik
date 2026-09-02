const { execSync } = require('child_process');
const fs = require('fs');
const path = 'C:/Users/Administrator/Desktop/oogmatik/tests-report.json';
const txt = fs.readFileSync(path, 'utf8');
const start = txt.indexOf('{');
const data = JSON.parse(txt.slice(start));
const failed = [];
for (const suite of (data.testResults || [])) {
  for (const r of (suite.assertionResults || [])) {
    if (r.status !== 'passed') failed.push({suite: suite.name, test: r.fullName, status: r.status, messages: r.failureMessages || []});
  }
}
console.log('failed_count', failed.length);
for (const item of failed.slice(0,80)) {
  console.log('SUITE:', item.suite);
  console.log('TEST:', item.test);
  console.log('STATUS:', item.status);
  for (const m of item.messages.slice(0,2)) console.log('MSG:', String(m).slice(0,400));
  console.log('---');
}

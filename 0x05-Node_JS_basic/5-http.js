const http = require('http');
const fs = require('fs');
const url = require('url');

const PORT = 1245;
const HOST = 'localhost';
const DB_FILE = process.argv.length > 2 ? process.argv[2] : '';

const countStudents = (dataPath) => new Promise((resolve, reject) => {
  fs.readFile(dataPath, 'utf-8', (err, data) => {
    if (err) {
      reject(new Error('Cannot load the database'));
    }
    if (data) {
      const fileLines = data
        .toString('utf-8')
        .trim()
        .split('\n');
      const studentGroups = {};
      const dbFieldNames = fileLines[0].split(',');
      const studentPropNames = dbFieldNames.slice(0, dbFieldNames.length - 1);

      for (const line of fileLines.slice(1)) {
        if (line.trim()) { // Skip empty lines
          const studentRecord = line.split(',');
          const studentPropValues = studentRecord.slice(0, studentRecord.length - 1);
          const field = studentRecord[studentRecord.length - 1];
          if (!Object.keys(studentGroups).includes(field)) {
            studentGroups[field] = [];
          }
          const studentEntries = studentPropNames
            .map((propName, idx) => [propName, studentPropValues[idx]]);
          studentGroups[field].push(Object.fromEntries(studentEntries));
        }
      }

      const totalStudents = Object
        .values(studentGroups)
        .reduce((pre, cur) => pre + cur.length, 0);
      const reportParts = [`Number of students: ${totalStudents}`];
      for (const [field, group] of Object.entries(studentGroups)) {
        reportParts.push(`Number of students in ${field}: ${group.length}. List: ${group.map((student) => student.firstname).join(', ')}`);
      }
      resolve(reportParts.join('\n'));
    }
  });
});

const app = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url);
  if (parsedUrl.pathname === '/') {
    const responseText = 'Hello Holberton School!';
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.write(responseText);
    res.end();
  } else if (parsedUrl.pathname === '/students') {
    countStudents(DB_FILE)
      .then((report) => {
        const responseText = `This is the list of our students\n${report}`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(responseText);
        res.end();
      })
      .catch((err) => {
        const responseText = `This is the list of our students\n${err.message}`;
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write(responseText);
        res.end();
      });
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.write('Not Found');
    res.end();
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Server listening at http://${HOST}:${PORT}`);
});

module.exports = app;

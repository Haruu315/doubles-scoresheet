const http = require('node:http');
const pug = require('pug');

const matches = [];

function getScore(match) {
  const scoreA = match.points.filter((p) => p === 'A').length;
  const scoreB = match.points.filter((p) => p === 'B').length;
  let winner = null;
  if (scoreA >= 21) {
    winner = match.teamA;
  } else if (scoreB >= 21) {
    winner = match.teamB;
  }
  return { scoreA, scoreB, winner };
}

function notFound(res) {
  res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end('<h1>ページが見つかりません</h1>');
}

const server = http.createServer((req, res) => {
  console.info(`[${new Date()}] ${req.method} ${req.url}`);

  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(pug.renderFile('./views/setup.pug'));
  } else if (req.method === 'POST' && req.url === '/matches') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      const match = {
        teamA: params.get('teamA'),
        teamB: params.get('teamB'),
        points: [],
      };
      matches.push(match);
      const id = matches.length - 1;
      console.info(`試合開始: id=${id} ${match.teamA} 対 ${match.teamB}`);
      res.writeHead(303, { Location: `/matches/${id}` });
      res.end();
    });
  } else if (req.method === 'POST' && req.url.startsWith('/matches/') && req.url.endsWith('/points')) {
    const id = Number(req.url.split('/')[2]);
    const match = matches[id];
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });
    req.on('end', () => {
      const team = new URLSearchParams(body).get('team');
      if (match && (team === 'A' || team === 'B')) {
        if (getScore(match).winner === null) {
          match.points.push(team);
          console.info(`得点: id=${id} ${team}  ${match.points.join('')}`);
        }
        res.writeHead(303, { Location: `/matches/${id}` });
        res.end();
      } else {
        notFound(res);
      }
    });
  } else if (req.method === 'POST' && req.url.startsWith('/matches/') && req.url.endsWith('/undo')) {
    const id = Number(req.url.split('/')[2]);
    const match = matches[id];
    if (match) {
      const removed = match.points.pop();
      console.info(`1点戻す: id=${id} ${removed}  ${match.points.join('')}`);
      res.writeHead(303, { Location: `/matches/${id}` });
      res.end();
    } else {
      notFound(res);
    }
  } else if (req.method === 'GET' && req.url.startsWith('/matches/')) {
    const id = Number(req.url.split('/')[2]);
    const match = matches[id];
    if (match) {
      const { scoreA, scoreB, winner } = getScore(match);
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(pug.renderFile('./views/match.pug', {
        id: id,
        teamA: match.teamA,
        teamB: match.teamB,
        scoreA: scoreA,
        scoreB: scoreB,
        winner: winner,
      }));
    } else {
      notFound(res);
    }
  } else {
    notFound(res);
  }
});

const port = 8000;
server.listen(port, () => {
  console.info(`http://localhost:${port} で起動しました`);
});

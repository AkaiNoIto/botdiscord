const http = require('http');
const url = require('url');

module.exports = (client) => {
    const server = http.createServer((req, res) => {
        // Basic CORS headers
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            return res.end();
        }

        const parsedUrl = url.parse(req.url, true);
        const pathname = parsedUrl.pathname;
        const query = parsedUrl.query;

        if (pathname === '/api/music') {
            const guildId = query.guildId;
            if (!guildId) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Missing guildId' }));
            }

            // Using useQueue (from discord-player) safely
            const queue = client.player.nodes.get(guildId);
            
            if (req.method === 'GET') {
                if (!queue || !queue.currentTrack) {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ playing: false }));
                }

                const track = queue.currentTrack;
                // Get progress using Discord Player's node
                const progress = queue.node.getTimestamp();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({
                    playing: !queue.node.isPaused(),
                    track: {
                        title: track.title,
                        author: track.author,
                        url: track.url,
                        thumbnail: track.thumbnail,
                        duration: track.duration
                    },
                    progress: progress ? progress.progress : 0,
                    volume: queue.node.volume
                }));
            }

            if (req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', () => {
                    try {
                        const data = JSON.parse(body || '{}');
                        const action = data.action;

                        if (!queue || !queue.currentTrack) {
                            res.writeHead(400, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'No music playing' }));
                        }

                        if (action === 'pause') {
                            queue.node.setPaused(true);
                        } else if (action === 'resume') {
                            queue.node.setPaused(false);
                        } else if (action === 'skip') {
                            queue.node.skip();
                        } else if (action === 'stop') {
                            queue.node.stop();
                        } else if (action === 'volume' && data.volume !== undefined) {
                            const vol = parseInt(data.volume);
                            if (vol >= 0 && vol <= 100) {
                                queue.node.setVolume(vol);
                            }
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ success: true }));
                    } catch (e) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: e.message }));
                    }
                });
                return;
            }
        }

        res.writeHead(404);
        res.end();
    });

    server.listen(3001, () => {
        console.log('🎵 Music API Internal Server listening on port 3001');
    });
};

const BencodeDecoder = require('./Bencoding-decoder/decoder.js');
const TorrentFileParser = require('./Bencoding-decoder/torrent-file-parser.js');

/**
 * Executes the 'decode' command, decoding and logging a B-encoded value.
 *
 * @param {string} bencodedValue - The B-encoded value to decode.
 */
function executeDecodeCommand(bencodedValue) {
    // Decode and log the result
    console.log(BencodeDecoder.decode(bencodedValue));
}

/**
 * Executes the 'info' command, parsing a torrent file and logging its information.
 *
 * @async
 * @param {string} filePath - The path to the torrent file.
 */
async function executeInfoCommand(filePath) {
    try {
        const torrentData = await TorrentFileParser.parse(filePath);
        const torrentInfo = TorrentFileParser.info(torrentData);

        console.log(`Tracker URL: ${torrentInfo.trackURL}`);
        console.log(`Length: ${torrentInfo.length}`);
        console.log(`Info Hash: ${torrentInfo.infoHash}`);
        console.log(`Piece Length: ${torrentInfo.pieceLength}`);
        console.log('Piece Hashes:');
        torrentInfo.pieces.forEach(hash => console.log(hash));
    } catch (error) {
        console.error(error);
    }
}

module.exports = {
    executeDecodeCommand,
    executeInfoCommand,
};

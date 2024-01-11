const { promisify } = require('util');
const crypto = require('crypto');
const fs = require('fs');
const BencodeDecoder = require('./decoder.js');
const bencode = require('bncode');

const readFileAsync = promisify(fs.readFile);

/**
 * TorrentFileParser class for parsing and displaying information about torrent files.
 */
class TorrentFileParser {
    /**
     * Creates a new TorrentFileParser instance.
     */
    constructor() {
        /**
         * Converts binary data to hexadecimal representation.
         *
         * @private
         * @param {string} binary - The binary data to convert.
         * @returns {string} - The hexadecimal representation of the binary data.
         */
        const binaryToHex = (binary) => {
            return Buffer.from(binary, 'binary').toString('hex');
        };

        /**
         * Splits pieces string into an array of hexadecimal hashes.
         *
         * @private
         * @param {string} pieces - The pieces string from torrent data.
         * @returns {string[]} - An array of hexadecimal hashes representing pieces.
         */
        const splitPieces = (pieces) => {
            let hashes = [];
            for (let i = 0; i < pieces.length; i += 20) {
                const piece = pieces.substring(i, i + 20);
                hashes.push(binaryToHex(piece));
            }
            return hashes;
        };

        /**
         * Creates a SHA-1 hash (info hash) for the torrent information.
         *
         * @private
         * @param {Object} info - The torrent information object.
         * @returns {string} - The SHA-1 hash (info hash) of the torrent information.
         */
        const createHash = (info) => {
            const sha1 = crypto.createHash('sha1');
            const bencodedInfo = bencode.encode(info);
            sha1.update(bencodedInfo);
            const infoHash = sha1.digest('hex');
            return infoHash;
        };

        /**
         * Parses the content of a torrent file.
         *
         * @param {string} path - The path to the torrent file.
         * @returns {Promise<Object>} - A promise that resolves with the parsed torrent data.
         * @throws {Error} - Throws an error if there is any issue during parsing.
         */
        this.parse = async (path) => {
            try {
                // Read the file asynchronously
                const data = await readFileAsync(path);

                // Decode the Bencode-encoded data and return the result
                const torrent = BencodeDecoder.decode(data.toString('utf-8'));
                return torrent;
            } catch (error) {
                // Propagate any errors that occur during the parsing process
                throw error;
            }
        };

        /**
         * Retrieves and formats information about the parsed torrent data.
         *
         * @param {Object} torrentData - The parsed torrent data.
         * @returns {Object} - An object containing various details about the torrent.
         * @property {string} trackURL - The tracker URL associated with the torrent.
         * @property {number} length - The length of the torrent content.
         * @property {string} infoHash - The SHA-1 hash (info hash) of the torrent information.
         * @property {number} pieceLength - The length of each piece in the torrent.
         * @property {string[]} pieces - An array of hexadecimal hashes representing pieces in the torrent.
         */
        this.info = (torrentData) => {
            // Calculate the info hash of the torrent data
            const infoHash = createHash(torrentData.info);

            // Extract relevant information and return as an object
            const formattedInfo = {
                'trackURL': torrentData.announce,
                'length': torrentData.info.length,
                'infoHash': infoHash,
                'pieceLength': torrentData.info['piece length'],
                'pieces': splitPieces(torrentData.info.pieces),
            };

            return formattedInfo;
        };
    }
}

module.exports = new TorrentFileParser();

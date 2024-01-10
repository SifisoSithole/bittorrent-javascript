// Import the BencodeDecoder module
const BencodeDecoder = require('./Bencoding-decoder/decoder.js');

// Get the command from the command-line arguments
const command = process.argv[2];

// Check if the command is 'decode'
if (command === "decode") {
    // Extract the B-encoded value from the command-line arguments
    const bencodedValue = process.argv[3];

    // Decode and log the result
    console.log(BencodeDecoder.decode(bencodedValue));
} else {
    // Throw an error for an unknown command
    throw new Error(`Unknown command ${command}. Please use 'decode' command.`);
}

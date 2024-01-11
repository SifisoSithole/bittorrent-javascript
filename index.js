const { executeDecodeCommand, executeInfoCommand } = require('./commands');

/**
 * Main entry point for the script.
 */
function main() {
    // Get the command from the command-line arguments
    const command = process.argv[2];

    // Check the command and execute the corresponding action
    switch (command) {
        case 'decode':
            // Extract the B-encoded value from the command-line arguments
            const bencodedValue = process.argv[3];
            executeDecodeCommand(bencodedValue);
            break;

        case 'info':
            const filePath = process.argv[3];
            executeInfoCommand(filePath);
            break;

        default:
            // Throw an error for an unknown command
            throw new Error(`Unknown command '${command}'. Please use 'decode' or 'info' command.`);
    }
}

// Execute the main function
main();

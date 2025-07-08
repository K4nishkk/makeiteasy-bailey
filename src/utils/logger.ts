import { createLogger, format, Logger, transports } from "winston";

const logger: Logger = createLogger({
    level: "info",
    format: format.combine(
        format.timestamp(),
        format.colorize(),
        format.printf(({ level, message, timestamp, ...meta }) => {
            const metaString = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : "";
            return `${timestamp} [${level}]: ${message}${metaString}`;
        })
    ),
    transports: [new transports.Console()],
});

export default logger;
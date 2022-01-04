import { createLogger, format, transports } from "winston";
import { LOGFILE } from "@constants";

const logger = createLogger({
  transports: new transports.File({
    filename: LOGFILE,
    format: format.combine(
      format.timestamp({ format: "MMM-DD-YYYY HH:mm:ss" }),
      format.align(),
      format.printf(
        (info) => `${info.level}: ${[info.timestamp]}: ${info.message}`
      )
    ),
  }),
});

if (process.env.NODE_ENV !== "production") {
  logger.add(new transports.Console());
}

export default logger;

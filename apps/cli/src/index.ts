import { hideBin } from "yargs/helpers";
import { createParser } from "./cli.js";

const parser = createParser();
await parser.parse(hideBin(process.argv));

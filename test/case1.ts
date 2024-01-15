import * as fs from "fs";
import * as path from "path";

import "./install_jsdom_document";
import { JSDOM } from "jsdom";

import { nodeToSExpr } from "../src/main";
import { install_jsdom_document } from "./install_jsdom_document";

const main = async () => {
  const htmlTextContent = fs.readFileSync(
    path.join(__dirname, "./index.html"),
    "utf-8"
  );
  const dom = new JSDOM(htmlTextContent);
  install_jsdom_document(dom);

  const sExpr = nodeToSExpr(document.body.parentElement!, 2);

  console.log(sExpr);
};
main().catch(console.error);

import { nodeToSExpr } from "../src/nodeToSExpr";

import { JSDOM } from "jsdom";
import { install_jsdom_document } from "./install_jsdom_document";

describe("nodeToSExpr", () => {
  it("should convert a DOM node to an S-expression", () => {
    const dom = new JSDOM(`
        <head>
            <title>Test Page</title>
        </head>
        <div id="foo" class="bar baz">
            <img src="https://example.com/image.png" />
            <a href="https://example.com">example.com</a>
        </div>
        `);
    install_jsdom_document(dom);
    const sExpr = nodeToSExpr(document.body.parentElement!, 0);
    expect(sExpr).toEqual(
      `(html (title "Test Page")(div.bar.baz#foo (img src="https://example.com/image.png" )(a href="https://example.com/" "example.com")))`
    );
  });
});

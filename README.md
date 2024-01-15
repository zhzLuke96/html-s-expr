# @zzkit/html-s-expr

This library provides function to convert HTML DOM nodes to S-expressions.

## Features

- Supports browser and Node.js
- Generate compact S-expressions where possible
- Preserves element id and class attributes
- 
## Installation

```
npm install @zzkit/html-s-expr
```

## Usage 

In browser:

```js
import { nodeToSExpr } from "@zzkit/html-s-expr";

const sExpr = nodeToSExpr(document.body.parentElement);
```

In Node.js (requires jsdom):

```js 
import { JSDOM } from "jsdom";
import { nodeToSExpr } from "@zzkit/html-s-expr";

const dom = new JSDOM(`...html...`);
nodeToSExpr(dom.window.document.body.parentElement);
```

Full example:

```js
import { nodeToSExpr } from "@zzkit/html-s-expr";
import { JSDOM } from "jsdom";

const dom = new JSDOM(`
  <html>
    <head>
      <title>Test Page</title> 
    </head>
    <body>
      <div id="foo" class="bar baz"> 
        <img src="image.png">
        <a href="#">Link</a>   
      </div>
    </body>
  </html>
`);

const sExpr = nodeToSExpr(dom.window.document.body); 

console.log(sExpr);
// (html (head (title "Test Page"))(body (div#foo.bar.baz (img src="image.png")(a href="#/" "Link"))))  
```

The `nodeToSExpr` function takes two arguments:

- `node` - The DOM node to convert
- `indent` - Number of spaces to indent (default 0)

It will recursively traverse the DOM nodes to generate the S-expression.


## License

MIT
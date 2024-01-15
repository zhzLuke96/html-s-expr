// 即使不可见也要保留
const hidden_keep_tags = ["title", "head"];
const keep_tags = [
  "title",
  "input",
  "textarea",
  "button",
  "select",
  "option",
  "form",
  "video",
  "img",
  "a",
];
const ignore_tags = ["script", "style", "meta", "template"];
const is_useless_cls = (cls: string) => {
  // 以数字结尾的
  if (cls.match(/\d$/)) {
    return true;
  }
  const tailwind_prefix = [
    "--",
    "bg",
    "w",
    "h",
    "scroll",
    "outline",
    "transition",
    "sticky",
    "theme",
    "ratio",
    "object",
    "pointer",
    "visible",
    "invisible",
    "opacity",
    "relative",
    "inline",
    "absolute",
    "router-link",
    "flex",
    "justify",
    "items",
    "content",
    "self",
    "order",
    "text",
    "border",
    "rounded",
    "shadow",
    "hover",
    "focus",
    "active",
    "disabled",
    "group",
    "focus-within",
    "first",
    "last",
    "odd",
    "even",
    "visited",
    "checked",
    "empty",
    "read-only",
    "read-write",
    "hover",
    "focus",
    "active",
    "visited",
    "disabled",
    "checked",
    "motion",
    "not",
  ];
  if (tailwind_prefix.some((x) => cls.startsWith(x))) {
    return true;
  }
  if (cls.includes("[") || cls.includes("]") || cls.includes(":")) {
    return true;
  }

  return false;
};

type VNode = {
  type: string;
  props?: Record<string, string>;
  children?: VNode[];
  text?: string;
};

export class HTMLConverter {
  constructor(readonly root: Node) {}

  /**
   * Converts a DOM node to a virtual DOM node.
   *
   * @param {Node} node - The DOM node to convert.
   * @param {(node: Node) => boolean} [filter] - An optional filter function to determine if a node should be converted.
   * @param {(vnode: VNode) => VNode | null} [process] - An optional process function to modify the converted virtual DOM node.
   * @return {VNode | null} The converted virtual DOM node, or null if the node is filtered out.
   */
  convertToVNode(
    node: Node,
    filter?: (node: Node) => boolean,
    process?: (vnode: VNode) => VNode | null
  ): VNode | null {
    process ||= (vnode) => vnode;
    if (filter && !filter(node)) {
      return null;
    }
    if (node instanceof Text) {
      return process({
        type: "#text",
        text: node.textContent?.trim() || "",
      });
    }
    if (node instanceof HTMLElement) {
      const props = Array.from(node.attributes).reduce(
        (acc, { name, value }) => {
          acc[name] = value;
          return acc;
        },
        {} as Record<string, string>
      );
      if ("value" in node && node.value) {
        props.value = node.value as string;
      }
      if ("src" in node && node.src) {
        props.src = node.src as string;
      }
      if ("href" in node && node.href) {
        props.href = node.href as string;
      }
      const children = Array.from(node.childNodes)
        .map((child) => this.convertToVNode(child, filter, process))
        .filter(Boolean) as VNode[];
      return process({
        type: node.tagName.toLowerCase(),
        props,
        children,
      });
    }
    console.log({ node }, 1);
    return null;
  }

  convertToSExpr(node: Node, space = 2): string {
    const rootVNode = this.convertToVNode(
      node,
      (node) => {
        if (node instanceof HTMLElement) {
          const tagName = node.tagName.toLowerCase();
          if (ignore_tags.includes(tagName)) {
            return false;
          }
          const is_hidden_keep_node = hidden_keep_tags.includes(tagName);
          // is hidden node
          if (node.hidden && !is_hidden_keep_node) {
            return false;
          }
          // is display none
          if (
            !is_hidden_keep_node &&
            node instanceof Element &&
            window.getComputedStyle(node).display === "none"
          ) {
            return false;
          }
        }
        if (node instanceof Text && node.textContent?.trim() === "") {
          return false;
        }
        return true;
      },
      (vnode) => {
        const is_keep_node = keep_tags.includes(vnode.type);
        const no_payload =
          !vnode.props?.value && !vnode.props?.src && !vnode.props?.href;
        if (no_payload) {
          if (
            !is_keep_node &&
            vnode.children?.length === 1 &&
            vnode.children[0].type !== "#text"
          ) {
            return vnode.children[0];
          }
          if (vnode.children?.length === 0) {
            return null;
          }
        }
        return vnode;
      }
    );
    if (!rootVNode) {
      return "";
    }

    const convert = (vnode: VNode, depth = 0): string => {
      if ("text" in vnode) {
        if (vnode.text?.trim() === "") {
          return "";
        }
        // TODO: text node should indent like dom
        return JSON.stringify(vnode.text);
      }

      // when base64 image, remove src
      if (vnode.props?.src?.startsWith('src="data:image')) {
        vnode.props.src = "";
      }

      const no_payload =
        !vnode.props?.value && !vnode.props?.src && !vnode.props?.href;
      const id = vnode.props?.id ? `#${vnode.props.id}` : "";

      if (no_payload && !id) {
        if (
          !vnode.props?.value &&
          vnode.children?.length === 1 &&
          vnode.children[0].type !== "#text"
        ) {
          return convert(vnode.children[0], depth);
        }
        if (vnode.children?.length === 0) {
          return "";
        }
      }

      const className =
        vnode.props?.class
          ?.split(" ")
          .filter((x) => !is_useless_cls(x))
          .map((x) => `.${x}`)
          .join("") || "";
      const selector = `${vnode.type}${className}${id}`;
      const children = (
        vnode.children?.map((child) => convert(child, depth + 1)) || []
      ).filter(Boolean);
      const no_children = children.length === 0;
      const only_text_children = children.every((x) => x.startsWith('"'));

      // format s-expression
      // TODO more format option
      const indent = " ".repeat(depth * space);
      let sExpr = `${indent}(${selector} `;
      for (const [k, v] of Object.entries(vnode.props || {})) {
        if (k === "class" || k === "id") {
          continue;
        }
        sExpr += `${k}=${JSON.stringify(v)} `;
      }
      if (no_children) {
        sExpr += ")";
      } else if (only_text_children) {
        sExpr += `${children.join(" ")})`;
      } else {
        const enter_indent = space === 0 ? "" : `\n${indent}`;
        sExpr += enter_indent;
        sExpr += children.join(enter_indent);
        sExpr += `${enter_indent})`;
      }
      return sExpr;
    };
    return convert(rootVNode);
  }
}

/**
 * Converts a DOM node to an S-expression.
 *
 * @param {Node} node - The DOM node to convert.
 * @param {number} [space=2] - The number of spaces to use for indentation.
 * @return {string} The S-expression representation of the DOM node.
 *
 * @example
 * ```ts
 * import { JSDOM } from "jsdom";
 * import { nodeToSExpr } from "node-to-sexpr";
 *
 * const dom = new JSDOM(`
 *    <head>
 *       <title>Test Page</title>
 *   </head>
 *  <div id="foo" class="bar baz">
 *     <img src="https://example.com/image.png" />
 *    <a href="https://example.com">example.com</a>
 * </div>
 * `);
 * const sExpr = nodeToSExpr(document.body.parentElement!, 2);
 * console.log(sExpr);
 * ```
 */
export function nodeToSExpr(node: Node, space = 2) {
  return new HTMLConverter(node).convertToSExpr(node, space);
}

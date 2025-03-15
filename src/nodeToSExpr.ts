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
    "motion",
    "not",
    "max",
    "min",
    "rounded",
    "border",
    "bg-",
    "mb-",
    "mr-",
    "px-",
    "py-",
    "text-",
    "block",
    "inline-block",
    "absolute",
    "relative",
    "fixed",
    "sticky",
    "z",
    "top",
    "right",
    "bottom",
    "left",
    "w",
    "h",
    "min-w",
    "max-w",
    "min-h",
    "max-h",
    "shadow",
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
  text?: string;
  props?: Record<string, string>;
  children?: VNode[];
};

function getVNodeKey(vnode: VNode, depth = 3): string {
  if (depth === 0) return "";
  // 忽略文本
  if (vnode.type === "#text") return "";
  // 输出 vnode 结构
  let body = "(" + vnode.type;
  if (vnode.props?.class) {
    body += `"${vnode.props?.class}"`;
  }
  if (vnode.children) {
    body += vnode.children
      .map((n) => getVNodeKey(n, depth - 1))
      .join(" ")
      .trim();
  }
  body += ")";
  return body;
}

class ComponentDetector {
  constructor(private depthThreshold: number) {}

  areSimilar(a: VNode, b: VNode, depth = 0): boolean {
    if (!b || !a) return false;
    if (depth >= this.depthThreshold) return true;
    if (a.type !== b.type || a.type === "#text" || b.type === "#text")
      return false;
    if (
      (a.children?.filter((child) => child.type !== "#text").length || 0) !==
      (b.children?.filter((child) => child.type !== "#text").length || 0)
    ) {
      return false;
    }
    return (a.children || []).every(
      (child, index) =>
        child.type === "#text" ||
        this.areSimilar(child, (b.children || [])[index], depth + 1)
    );
  }
}

export class HTMLConverter {
  constructor(readonly root: Node, private depthThreshold = 2) {}

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
      return { type: "#text", text: node.nodeValue || "" };
    }
    if (node instanceof HTMLElement) {
      if (ignore_tags.includes(node.tagName.toLowerCase())) {
        return null;
      }
      const props = Array.from(node.attributes).reduce(
        (acc, { name, value }) => {
          if (name === "class" && is_useless_cls(value)) {
            return acc;
          }
          acc[name] = value;
          return acc;
        },
        {} as Record<string, string>
      );
      const children = Array.from(node.childNodes)
        .map((child) => this.convertToVNode(child, filter, process))
        .filter(Boolean) as VNode[];
      if (
        !keep_tags.includes(node.tagName.toLowerCase()) &&
        children.length === 0
      ) {
        return null;
      }
      return process({
        type: node.tagName.toLowerCase(),
        props,
        children,
      });
    }
    return null;
  }

  convertToSExpr(node: Node, space = 2, compressThreshold = 2): string {
    const rootVNode = this.convertToVNode(node);
    if (!rootVNode) {
      return "";
    }

    const detector = new ComponentDetector(this.depthThreshold);

    const convert = (
      vnode: VNode,
      siblings: VNode[],
      depth = 0,
      // 保存 components 的key用于压缩显示
      components: string[] = []
    ): string => {
      if (vnode.type === "#text") {
        if (!vnode.text || vnode.text.trim() === "") {
          return "";
        }
        return `${" ".repeat(depth * space)}${JSON.stringify(vnode.text)}`;
      }
      const similarNodes = siblings.filter((s) =>
        detector.areSimilar(vnode, s)
      );
      const key = getVNodeKey(vnode);
      if (similarNodes.length > compressThreshold) {
        const hit_count = components.reduce(
          (acc, k) => acc + (k === key ? 1 : 0),
          0
        );
        if (hit_count < compressThreshold) {
          // 添加到列表
          components.push(key);
        } else if (hit_count === compressThreshold) {
          // 压缩一次
          console.log(
            `Compress ${vnode.type} count=${similarNodes.length} key=${key}`
          );
          components.push(key);
          return `${" ".repeat(depth * space)}(COMPRESSED ${vnode.type} count=${
            similarNodes.length
          })`;
        } else {
          // 其余情况不用打印
          return "";
        }
      }
      const childrenComponents: string[] = [];
      const children = (
        vnode.children?.map((child) =>
          convert(child, vnode.children!, depth + 1, childrenComponents)
        ) || []
      ).filter(Boolean);
      const indent = " ".repeat(depth * space);
      let sExpr = `${indent}(${vnode.type} `;
      for (const [k, v] of Object.entries(vnode.props || {})) {
        if (k === "class" || k === "id") {
          continue;
        }
        sExpr += `${k}=${JSON.stringify(v)} `;
      }
      if (children.length === 0) {
        sExpr += ")";
      } else {
        const enter_indent = space === 0 ? "" : `\n${indent}`;
        sExpr += enter_indent;
        sExpr += children.join(enter_indent);
        sExpr += `${enter_indent})`;
      }
      return sExpr;
    };
    return convert(rootVNode, [rootVNode], 0);
  }
}

/**
 * Converts a given node to an S-expression.
 *
 * @param node - The node to convert.
 * @param space - The number of spaces to use for indentation. Defaults to 2.
 * @param compressThreshold - The threshold to compress similar nodes. Defaults to 2.
 * @param depthThreshold - The threshold to detect similar nodes. Defaults to 2.
 * @return The S-expression representation of the node.
 */
export function nodeToSExpr(
  node: Node,
  space = 2,
  compressThreshold = 2,
  depthThreshold = 2
) {
  return new HTMLConverter(node, depthThreshold).convertToSExpr(
    node,
    space,
    compressThreshold
  );
}

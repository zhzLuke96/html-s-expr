export { nodeToSExpr } from "./nodeToSExpr";
import { nodeToSExpr } from "./nodeToSExpr";

/**
 * Converts a document object into an S-expression.
 *
 * @param {number} space - The number of spaces to use for indentation. Defaults to 2.
 * @return {string} - The S-expression representation of the document.
 */
export function documentToExpr(space = 2) {
  return nodeToSExpr(document.body.parentElement!, space);
}

export default {
  nodeToSExpr,
  documentToExpr,
};

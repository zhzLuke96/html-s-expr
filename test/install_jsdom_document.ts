import { JSDOM } from "jsdom";

export function install_jsdom_document(instance: JSDOM) {
  const document = instance.window.document;
  const win = instance.window;

  globalThis.window = win as any;
  globalThis.document = document;
  globalThis.Element = win.Element;
  globalThis.Node = win.Node;
  globalThis.HTMLElement = win.HTMLElement;
  globalThis.Text = win.Text;
  globalThis.HTMLAnchorElement = win.HTMLAnchorElement;
  globalThis.HTMLAreaElement = win.HTMLAreaElement;
  globalThis.HTMLAudioElement = win.HTMLAudioElement;
  globalThis.HTMLBaseElement = win.HTMLBaseElement;
  globalThis.HTMLQuoteElement = win.HTMLQuoteElement;
  globalThis.HTMLBodyElement = win.HTMLBodyElement;
  globalThis.HTMLBRElement = win.HTMLBRElement;
  globalThis.HTMLButtonElement = win.HTMLButtonElement;
  globalThis.HTMLCanvasElement = win.HTMLCanvasElement;
  globalThis.HTMLTableCaptionElement = win.HTMLTableCaptionElement;
  globalThis.HTMLTableColElement = win.HTMLTableColElement;
  globalThis.HTMLDataElement = win.HTMLDataElement;
  globalThis.HTMLDataListElement = win.HTMLDataListElement;
  globalThis.HTMLModElement = win.HTMLModElement;
  globalThis.HTMLDetailsElement = win.HTMLDetailsElement;
  globalThis.HTMLDialogElement = win.HTMLDialogElement;
  globalThis.HTMLDivElement = win.HTMLDivElement;
  globalThis.HTMLDListElement = win.HTMLDListElement;
  globalThis.HTMLEmbedElement = win.HTMLEmbedElement;
  globalThis.HTMLFieldSetElement = win.HTMLFieldSetElement;
  globalThis.HTMLFormElement = win.HTMLFormElement;
  globalThis.HTMLFrameElement = win.HTMLFrameElement;
  globalThis.HTMLFrameSetElement = win.HTMLFrameSetElement;
  globalThis.HTMLHeadingElement = win.HTMLHeadingElement;
  globalThis.HTMLHeadElement = win.HTMLHeadElement;
  globalThis.HTMLHRElement = win.HTMLHRElement;
  globalThis.HTMLHtmlElement = win.HTMLHtmlElement;
  globalThis.HTMLIFrameElement = win.HTMLIFrameElement;
  globalThis.HTMLImageElement = win.HTMLImageElement;
  globalThis.HTMLInputElement = win.HTMLInputElement;
  globalThis.HTMLLabelElement = win.HTMLLabelElement;
  globalThis.HTMLLegendElement = win.HTMLLegendElement;
  globalThis.HTMLLIElement = win.HTMLLIElement;
  globalThis.HTMLLinkElement = win.HTMLLinkElement;
  globalThis.HTMLMapElement = win.HTMLMapElement;
  globalThis.HTMLMetaElement = win.HTMLMetaElement;
  globalThis.HTMLMeterElement = win.HTMLMeterElement;
  globalThis.HTMLModElement = win.HTMLModElement;
  globalThis.HTMLObjectElement = win.HTMLObjectElement;
  globalThis.HTMLOListElement = win.HTMLOListElement;
  globalThis.HTMLOptGroupElement = win.HTMLOptGroupElement;
  globalThis.HTMLOptionElement = win.HTMLOptionElement;
  // ...
}

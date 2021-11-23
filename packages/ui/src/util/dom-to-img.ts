const domtoimage = require("dom-to-image");

export const toImg = async (
  button: HTMLElement,
  target: HTMLElement,
  name: string
) => {
  // hack around download bug
  var map: Partial<
    Record<keyof CSSStyleDeclaration, { wip: string | number; prev?: any }>
  > = {
    margin: { wip: 0 },
    position: { wip: "fixed" },
    top: { wip: 0 },
    background: { wip: "white" },
    zIndex: { wip: 10 },
  };
  var buttonDisplay = button.style.display;
  button.style.display = "none";
  for (var k in map) {
    map[k]!.prev = target.style[k as keyof CSSStyleDeclaration];
    target.style[k as any] = map[k as any]!.wip as any;
  }
  var dataUrl = await domtoimage.toPng(target, {
    bgcolor: "white",
  });
  // unhack download bug
  for (k in map) target.style[k] = map[k]!.prev;
  button.style.display = buttonDisplay;
  var link = document.createElement("a");
  link.download = name;
  link.href = dataUrl;
  link.click();
};

import { SAPCbasic } from "./spac_calculator";

figma.showUI(__html__, { height: 500 });

figma.on("selectionchange", () => {
  updateFrame();
});

figma.ui.onmessage = (msg) => {
  if (msg.type === "update") {
    console.log("onUpdate");
    if (msg.category == "frame") {
      updateFrame();
    }
  }
};

let blackTextSolidPaint: SolidPaint = {
  type: "SOLID",
  color: {
    r: 51 / 255,
    g: 51 / 255,
    b: 51 / 255,
  
  },
};

let whiteTextSolidPaint: SolidPaint = {
  type: "SOLID",
  color: {
    r: 1,
    g: 1,
    b: 1,
  },
};

function updateFrame() {
  figma.loadFontAsync({ family: "SF Pro Display", style: "Medium" }).then(() => {
    figma.loadFontAsync({ family: "SF Pro Display", style: "Semibold" }).then(() => {
      figma.loadFontAsync({ family: "PingFang TC", style: "Medium" }).then(() => {
        const selection = figma.currentPage.selection;
        console.log(`selection length ${selection.length}, selection is ${selection[0].type}`)
        if (selection.length == 1) {
          if (selection[0].type == "FRAME") {
            updateColorComponentInFrame(selection[0] as FrameNode);
          } else if(selection[0].type == "INSTANCE") {
            updateColorComponent(selection[0] as InstanceNode);
          }
        }
      });
    });
  });
}

function updateColorComponent(colorSingle: InstanceNode){
  console.log("there are color single")
  // Color Child out of Frame
  const colorChilren = colorSingle
    .findChildren((child) => child.type == "INSTANCE")
    .map((child) => child as InstanceNode)
    .filter(
      (child) =>
        child.mainComponent.name == "ColorPalette/Children"
    );

    if(colorSingle.mainComponent.name == "ColorPalette/Children"){
      updateColor(colorSingle);
    }

  // Update all colorChild
  colorChilren.forEach((colorChild) => {
    updateColor(colorChild);
  });
}

function updateColorComponentInFrame(frame: FrameNode) {
  console.log("update color palette");
  const instances = frame.findChildren((child) => child.type == "INSTANCE");
  const allColorSingle = instances
    .map((instance) => instance as InstanceNode)
    .filter((instance) => instance.mainComponent.name == "ColorPalette/Color")
    .forEach((colorSingle) => {
        updateColorComponent(colorSingle)
    });
}

function updateColor(colorChild) {
  const childrenOfColorChild = colorChild.children;
  const colorShape = childrenOfColorChild.find(
    (child) => child.type == "RECTANGLE"
  ) as RectangleNode;
  var allText = childrenOfColorChild
    .filter((child) => child.type == "TEXT")
    .map((child) => child as TextNode);

  childrenOfColorChild
    .filter((child) => child.type == "FRAME")
    .map((child) => child as FrameNode)
    .forEach((frame) =>
      frame
        .findChildren((child) => child.type == "TEXT")
        .forEach((text) => allText.push(text as TextNode))
    );

  const hexText = allText.find(
    (text) => text.name.startsWith("#") || text.name == "Color Hex"
  );
  console.log(`textNode: ${hexText}, shapeNode: ${colorShape}`)
  const textRgb = getRGB(hexText);
  const shapeRgb = getRGB(colorShape);
  const hex = convertRGBToHex(shapeRgb);
  const textHex = convertRGBToHex(textRgb);

  console.log(`hex: ${hex}, textHex: ${textHex}`);
  hexText.deleteCharacters(0, hexText.characters.length);
  hexText.insertCharacters(0, hex);

  const ratioText = allText.find((text) => text.name == "Contrast Ratio");
  const whiteRatio = SAPCbasic(
    shapeRgb.r,
    shapeRgb.g,
    shapeRgb.b,
    whiteTextSolidPaint.color.r,
    whiteTextSolidPaint.color.g,
    whiteTextSolidPaint.color.b
  );
  const blackRatio = SAPCbasic(
    shapeRgb.r,
    shapeRgb.g,
    shapeRgb.b,
    blackTextSolidPaint.color.r,
    blackTextSolidPaint.color.g,
    blackTextSolidPaint.color.b
  );
  // const floatOfRatio = parseFloat(ratio.substring(0, ratio.length - 1)); // ratio = "29.0%"

  let ratio: string;
  let paint: SolidPaint;
  let stroke: SolidPaint;

  let floatOfWhiteRatio = parseFloat(
    whiteRatio.substring(0, whiteRatio.length - 1)
  );
  let floatOfBlackRatio = parseFloat(
    blackRatio.substring(0, blackRatio.length - 1)
  );
  if (
    Math.abs(floatOfWhiteRatio) == Math.abs(floatOfBlackRatio) ||
    (Math.abs(floatOfWhiteRatio) >= 80 && Math.abs(floatOfBlackRatio) >= 80)
  ) {
    ratio = blackRatio;
    paint = whiteTextSolidPaint;
    stroke = blackTextSolidPaint;
  } else if (Math.abs(floatOfWhiteRatio) > Math.abs(floatOfBlackRatio)) {
    ratio = whiteRatio;
    paint = whiteTextSolidPaint;
  } else {
    ratio = blackRatio;
    paint = blackTextSolidPaint;
  }

  ratioText.deleteCharacters(0, ratioText.characters.length);
  ratioText.insertCharacters(0, ratio);
  console.log(`all text ${allText}`)
  allText.forEach((text) => {
    console.log(text.characters.length);
    try {
      text.setRangeFills(0, text.characters.length, [paint]);
      if (stroke) {
        text.strokes = [stroke];
      }
    } catch (e) {
      console.log(e);
    }
  });

  console.log(
    `hex ${hex}, ratio: ${ratio}, paint: ${
    paint.color.r == 1 ? "White" : "Black"
    }`
  );
}

function clone(val) {
  return JSON.parse(JSON.stringify(val));
}

function getRGB(geometry: GeometryMixin): RGBA {
  return geometry.fills[0].color;
}

function convertRGBToHex(rgb: RGBA): string {
  const red: number = Math.round(rgb.r * 255);
  const green: number = Math.round(rgb.g * 255);
  const blue: number = Math.round(rgb.b * 255);
  const hex =
    "#" +
    red.toString(16).padStart(2, "0").padStart(2, "0") +
    green.toString(16).padStart(2, "0") +
    blue.toString(16).padStart(2, "0");
  return hex;
}

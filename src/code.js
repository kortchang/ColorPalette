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
let blackTextSolidPaint = {
    type: "SOLID",
    color: {
        r: 26 / 255,
        g: 26 / 255,
        b: 26 / 255,
    },
};
let whiteTextSolidPaint = {
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
            const selection = figma.currentPage.selection;
            if (selection.length == 1) {
                if (selection[0].type == "FRAME") {
                    updateColorComponentInFrame(selection[0]);
                }
            }
        });
    });
}
function updateColorComponentInFrame(frame) {
    const instances = frame.findChildren((child) => child.type == "INSTANCE");
    const allColorSingle = instances
        .map((instance) => instance)
        .filter((instance) => instance.mainComponent.name == "ColorPalette/Color")
        .forEach((colorSingle) => {
        // Color Child out of Frame
        const colorChilren = colorSingle
            .findChildren((child) => child.type == "INSTANCE")
            .map((child) => child)
            .filter((child) => child.mainComponent.name == "ColorPalette/Children" ||
            child.mainComponent.name == "ColorPalette/Main");
        // Color Child in Frame
        const colorChildrenOfColorSingle = colorSingle
            .findChildren((child) => child.type == "FRAME")
            .map((child) => child)
            .forEach((frame) => {
            frame
                .findChildren((child) => child.type == "INSTANCE")
                .map((child) => child)
                .filter((instance) => instance.mainComponent.name == "ColorPalette/Children")
                .forEach((colorChild) => colorChilren.push(colorChild));
        });
        // Update all colorChild
        colorChilren.forEach((colorChild) => {
            updateColor(colorChild);
        });
    });
}
function updateColor(colorChild) {
    const childrenOfColorChild = colorChild.children;
    const colorShape = childrenOfColorChild.find((child) => child.type == "RECTANGLE");
    var allText = childrenOfColorChild
        .filter((child) => child.type == "TEXT")
        .map((child) => child);
    childrenOfColorChild
        .filter((child) => child.type == "FRAME")
        .map((child) => child)
        .forEach((frame) => frame
        .findChildren((child) => child.type == "TEXT")
        .forEach((text) => allText.push(text)));
    const hexText = allText.find((text) => text.name.startsWith("#") || text.name == "Color Hex");
    const textRgb = getRGB(hexText);
    const shapeRgb = getRGB(colorShape);
    const hex = convertRGBToHex(shapeRgb);
    const textHex = convertRGBToHex(textRgb);
    console.log(`hex: ${hex}, textHex: ${textHex}`);
    hexText.deleteCharacters(0, hexText.characters.length);
    hexText.insertCharacters(0, hex);
    const ratioText = allText.find((text) => text.name == "Contrast Ratio");
    const whiteRatio = SAPCbasic(shapeRgb.r, shapeRgb.g, shapeRgb.b, whiteTextSolidPaint.color.r, whiteTextSolidPaint.color.g, whiteTextSolidPaint.color.b);
    const blackRatio = SAPCbasic(shapeRgb.r, shapeRgb.g, shapeRgb.b, blackTextSolidPaint.color.r, blackTextSolidPaint.color.g, blackTextSolidPaint.color.b);
    // const floatOfRatio = parseFloat(ratio.substring(0, ratio.length - 1)); // ratio = "29.0%"
    let ratio;
    let paint;
    let stroke;
    let floatOfWhiteRatio = parseFloat(whiteRatio.substring(0, whiteRatio.length - 1));
    let floatOfBlackRatio = parseFloat(blackRatio.substring(0, blackRatio.length - 1));
    if (Math.abs(floatOfWhiteRatio) == Math.abs(floatOfBlackRatio) ||
        (Math.abs(floatOfWhiteRatio) >= 80 && Math.abs(floatOfBlackRatio) >= 80)) {
        ratio = blackRatio;
        paint = whiteTextSolidPaint;
        stroke = blackTextSolidPaint;
    }
    else if (Math.abs(floatOfWhiteRatio) > Math.abs(floatOfBlackRatio)) {
        ratio = whiteRatio;
        paint = whiteTextSolidPaint;
    }
    else {
        ratio = blackRatio;
        paint = blackTextSolidPaint;
    }
    ratioText.deleteCharacters(0, ratioText.characters.length);
    ratioText.insertCharacters(0, ratio);
    allText.forEach((text) => {
        console.log(text.characters.length);
        try {
            text.setRangeFills(0, text.characters.length, [paint]);
            if (stroke) {
                text.strokes = [stroke];
            }
        }
        catch (e) {
            console.log(e);
        }
    });
    console.log(`hex ${hex}, ratio: ${ratio}, paint: ${paint.color.r == 1 ? "White" : "Black"}`);
}
function clone(val) {
    return JSON.parse(JSON.stringify(val));
}
function getRGB(geometry) {
    return geometry.fills[0].color;
}
function convertRGBToHex(rgb) {
    const red = Math.round(rgb.r * 255);
    const green = Math.round(rgb.g * 255);
    const blue = Math.round(rgb.b * 255);
    const hex = "#" +
        red.toString(16).padStart(2, "0").padStart(2, "0") +
        green.toString(16).padStart(2, "0") +
        blue.toString(16).padStart(2, "0");
    return hex;
}

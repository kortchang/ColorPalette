figma.showUI(__html__);
figma.on("selectionchange", () => {
    figma.loadFontAsync({ family: "Colfax", style: "Regular" }).then(() => {
        const selection = figma.currentPage.selection;
        if (selection.length == 1) {
            if (selection[0].type == "FRAME") {
                updateColorComponentInFrame(selection[0]);
            }
        }
    });
});
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
let grayTextSolidPaint = {
    type: "SOLID",
    color: {
        r: 177 / 255,
        g: 177 / 255,
        b: 177 / 255,
    },
};
function updateColorComponentInFrame(frame) {
    const instances = frame.findChildren((child) => child.type == "INSTANCE");
    const allColorSingle = instances
        .map((instance) => instance)
        .filter((instance) => instance.masterComponent.name == "ColorPalette/Color")
        .forEach((colorSingle) => {
        const colorChilren = colorSingle
            .findChildren((child) => child.type == "INSTANCE")
            .map((child) => child)
            .filter((child) => child.masterComponent.name == "ColorPalette/Children" ||
            child.masterComponent.name == "ColorPalette/Main")
            .forEach((colorChild) => {
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
                (Math.abs(floatOfWhiteRatio) >= 80 &&
                    Math.abs(floatOfBlackRatio) >= 80)) {
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
        });
    });
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
const sRGBtrc = 2.218; // Gamma for sRGB linearization. 2.223 could be used instead
// 2.218 sets unity with the piecewise sRGB at #777
const Rco = 0.2126; // sRGB Red Coefficient
const Gco = 0.7156; // sRGB Green Coefficient
const Bco = 0.0722; // sRGB Blue Coefficient
const scaleBoW = 161.8; // Scaling for dark text on light (phi * 100)
const scaleWoB = 161.8; // Scaling for light text on dark — same as BoW, but
// this is separate for possible future use.
const normBGExp = 0.38; // Constants for Power Curve Exponents.
const normTXTExp = 0.43; // One pair for normal text,and one for REVERSE
const revBGExp = 0.5; // FUTURE: These will eventually be dynamic
const revTXTExp = 0.43; // as a function of light adaptation and context
const blkThrs = 0.02; // Level that triggers the soft black clamp
const blkClmp = 1.75; // Exponent for the soft black clamp curve
function SAPCbasic(Rbg, Gbg, Bbg, Rtxt, Gtxt, Btxt) {
    var SAPC = 0.0;
    // Find Y by applying coefficients and sum.
    // This REQUIRES linearized R,G,B 0.0-1.0
    var Ybg = Rbg * Rco + Gbg * Gco + Bbg * Bco;
    var Ytxt = Rtxt * Rco + Gtxt * Gco + Btxt * Bco;
    console.log(`YText: ${Ytxt}`);
    /////	INSERT COLOR MODULE HERE	/////
    // Now, determine polarity, soft clamp black, and calculate contrast
    // Finally scale for easy to remember percentages
    // Note that reverse (white text on black) intentionally
    // returns a negative number
    if (Ybg > Ytxt) {
        ///// For normal polarity, black text on white
        // soft clamp darkest color if near black.
        Ytxt = Ytxt > blkThrs ? Ytxt : Ytxt + Math.pow(Math.abs(Ytxt - blkThrs), blkClmp);
        SAPC = (Math.pow(Ybg, normBGExp) - Math.pow(Ytxt, normTXTExp)) * scaleBoW;
        return SAPC < 15 ? "0%" : SAPC.toPrecision(3) + "%";
    }
    else {
        ///// For reverse polarity, white text on black
        Ybg = Ybg > blkThrs ? Ybg : Ybg + Math.pow(Math.abs(Ybg - blkThrs), blkClmp);
        SAPC = (Math.pow(Ybg, revBGExp) - Math.pow(Ytxt, revTXTExp)) * scaleWoB;
        return SAPC > -15 ? "0%" : SAPC.toPrecision(3) + "%";
    }
    // If SAPC's more than 15%, return that value, otherwise clamp to zero
    // this is to remove noise and unusual behavior if the user inputs
    // colors too close to each other.
    // This will be more important with future modules. Nevertheless
    // In order to simplify code, SAPC will not report accurate contrasts
    // of less than approximately 15%, so those are clamped.
    // 25% is the "point of invisibility" for many people.
}

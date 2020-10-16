var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import * as ReactDOM from "react-dom";
import { DefaultButton, PrimaryButton, Pivot, PivotItem, TextField, } from "@fluentui/react";
const groupDiv = {
    display: "grid",
    rowGap: 8,
};
const pivotItem = {
    paddingTop: 24,
};
class App extends React.Component {
    render() {
        return (React.createElement("div", null,
            React.createElement("h2", null, "Color Palette Manager"),
            React.createElement(Pivot, null,
                React.createElement(PivotItem, { headerText: "All", style: pivotItem },
                    React.createElement("p", null, "Please select the color palette FRAME"),
                    React.createElement(UpdateButton, { style: {
                            marginRight: 8,
                        } })),
                React.createElement(PivotItem, { headerText: "Single", style: pivotItem },
                    React.createElement("div", { style: {
                            display: "grid",
                            rowGap: 16,
                        } },
                        React.createElement("div", { style: groupDiv },
                            React.createElement(Header, { text: "Main Color" }),
                            React.createElement(TextField, { label: "Link" })),
                        React.createElement("div", { style: groupDiv },
                            React.createElement(Header, { text: "Accent Color" }),
                            React.createElement(TextField, { label: "Link" }))),
                    React.createElement("div", { style: { display: "grid", columnGap: 8 } },
                        React.createElement(UpdateButton, null),
                        React.createElement(NewButton, null))))));
    }
}
function Header(props) {
    let { text } = props, rest = __rest(props, ["text"]);
    return (React.createElement("h6", { color: "#0178D4", style: {
            fontSize: 16,
            margin: 0,
        } }, text));
}
function UpdateButton(props) {
    let onUpdateFrame = () => {
        parent.postMessage({ pluginMessage: { type: "update", category: "frame" } }, "*");
    };
    let { style } = props;
    return (React.createElement(DefaultButton, { onClick: onUpdateFrame, style: style }, "Update"));
}
function NewButton(props) {
    return React.createElement(PrimaryButton, Object.assign({}, props), " New ");
}
ReactDOM.render(React.createElement(App, null), document.getElementById("react-page"));

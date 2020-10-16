import * as React from "react";
import * as ReactDOM from "react-dom";
import {
  DefaultButton,
  PrimaryButton,
  Pivot,
  PivotItem,
  TextField,
} from "@fluentui/react";

declare function require(path: string): any;

const groupDiv = {
  display: "grid",
  rowGap: 8,
};

const pivotItem = {
  paddingTop: 24,
};

class App extends React.Component {
  render() {
    return (
      <div>
        <h2>Color Palette Manager</h2>
        <Pivot>
          <PivotItem headerText="All" style={pivotItem}>
            <p>Please select the color palette FRAME</p>
            <UpdateButton
              style={{
                marginRight: 8,
              }}
            />
          </PivotItem>
          <PivotItem headerText="Single" style={pivotItem}>
            <div
              style={{
                display: "grid",
                rowGap: 16,
              }}
            >
              <div style={groupDiv}>
                <Header text="Main Color" />
                <TextField label="Link" />
              </div>
              <div style={groupDiv}>
                <Header text="Accent Color" />
                <TextField label="Link" />
              </div>
            </div>
            <div style={{ display: "grid", columnGap: 8 }}>
              <UpdateButton />
              <NewButton />
            </div>
          </PivotItem>
        </Pivot>
      </div>
    );
  }
}

function Header(props) {
  let { text, ...rest } = props;
  return (
    <h6
      color="#0178D4"
      style={{
        fontSize: 16,
        margin: 0,
      }}
    >
      {text}
    </h6>
  );
}

function UpdateButton(props) {
  let onUpdateFrame = () => {
    parent.postMessage(
      { pluginMessage: { type: "update", category: "frame" } },
      "*"
    );
  };

  let { style } = props;

  return (
    <DefaultButton onClick={onUpdateFrame} style={style}>
      Update
    </DefaultButton>
  );
}

function NewButton(props) {
  return <PrimaryButton {...props}> New </PrimaryButton>;
}

ReactDOM.render(<App />, document.getElementById("react-page"));

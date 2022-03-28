import { ActionPanel, Detail, List, Action, CopyToClipboardAction } from "@raycast/api";

import { ReactElement, useEffect, useState } from "react";

export default function Command() : ReactElement {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ text: string; unit: string }[]>([]);

  function isNumeric(value) {
    return /^-?\d+$/.test(value);
  }

  useEffect(() => {
    if (input === "") {
      return;
    }
    var value;
    if (isNumeric(input)) {
      value = parseInt(input);
    } else if (input.startsWith("0b")) {
      value = parseInt(input.substring(2), 2);
    } else if (input.startsWith("0x")) {
      value = parseInt(input.substring(2), 16);
    }
    setResults([
        {text: value.toString(2), unit: "BIN"},
        {text: value.toString(8), unit: "OCT"},
        {text: value.toString(10), unit: "DEC"},
        {text: value.toString(16), unit: "HEX"}
    ]);
  }, [input]);

  return (
    <List
      searchBarPlaceholder="Enter number to convert"
      onSearchTextChange={setInput}
      throttle
    >
      {results.map((r, index) => (
        <List.Item
          key={index}
          title={r.text}
          accessoryTitle={r.unit}
          actions={
            <ActionPanel>
              <ActionPanel.Section>
                <CopyToClipboardAction title="Copy" content={r.text} />
              </ActionPanel.Section>
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}

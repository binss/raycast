import { ActionPanel, Detail, List, Action, CopyToClipboardAction } from "@raycast/api";

import { ReactElement, useEffect, useState } from "react";

export default function Command() : ReactElement {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<{ text: string; unit: string }[]>([]);

  function FormatTimestamp(timestamp : any) {
    var date = new Date(timestamp);
    var year = date.getFullYear(),
        month = ("0" + (date.getMonth() + 1)).slice(-2),
        day = ("0" + date.getDate()).slice(-2),
        hour = ("0" + date.getHours()).slice(-2),
        minute = ("0" + date.getMinutes()).slice(-2),
        second = ("0" + date.getSeconds()).slice(-2);
    return year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
  }

  var now = Date.now();
  useEffect(() => {
    if (input === "") {
      setResults([
        {text: (now / 1000 | 0).toString(), unit: "second"},
        {text: now.toString(), unit: "millisecond"},
        {text: FormatTimestamp(now), unit: "UTC+8"}
      ]);
      return;
    }
    if (input.length == 10) {
      var timestamp = parseInt(input);
      setResults([{text: FormatTimestamp(timestamp * 1000), unit: "UTC+8"}]);
    } else if (input.length == 13) {
      var timestamp = parseInt(input);
      setResults([{text: FormatTimestamp(timestamp), unit: "UTC+8"}]);
    }
  }, [input]);

  return (
    <List
      searchBarPlaceholder="Enter text to translate"
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

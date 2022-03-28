import { List, getPreferenceValues, ActionPanel, CopyToClipboardAction, showToast, ToastStyle, getSelectedText } from "@raycast/api";
import { ReactElement, useEffect, useState } from "react";
import translate from "@vitalets/google-translate-api";
import supportedLanguagesByCode from "./supportedLanguagesByCode.json";
import fetch from "node-fetch";

let count = 0;

export default function Command(): ReactElement {
  const [isLoading, setIsLoading] = useState(false);
  const [toTranslate, setToTranslate] = useState("");
  const [results, setResults] = useState<{ text: string; languages: string }[]>([]);
  const [selectedText, setSelectedText] = useState("");

  async function FetchSelectedText() {
    const select_text = await getSelectedText();;
    select_text_strip = select_text.trim().replace(/(\r\n|\n|\r)/gm, "");
    setSelectedText(select_text_strip);
    setToTranslate(select_text);
  }

  function TranslateByYoudao() {
    const preferences = getPreferenceValues();
    const url = "http://fanyi.youdao.com/openapi.do?keyfrom=" + preferences.keyfrom + "&key=" + preferences.apikey + "&type=data&doctype=json&version=1.1&q=" + toTranslate;
    return fetch(url)
    .then(response => response.json())
    .then(json => {
      var results = [];
      if (json["errorCode"] === 0) {
        if (json.hasOwnProperty("basic")) {
          for (explain of json["basic"]["explains"]) {
            results.push({text: explain, languages: "Youdao"});
          }
        }
        if (json.hasOwnProperty("translation")) {
          for (explain of json["translation"]) {
            results.push({text: explain, languages: "Youdao"});
          }
        }
      }
      return results;
    });
  }

  useEffect(() => {
    if (toTranslate === "") {
      FetchSelectedText();
      return;
    }

    count++;
    const localCount = count;

    setIsLoading(true);
    setResults([]);

    var results = [];
    var re = new RegExp("[\u4e00-\u9fa5]");
    var has_chinese = re.test(toTranslate);
    if (has_chinese) {
      const promises = Promise.all([
        translate(toTranslate, {from: "zh-CN", to: "en"}).then(result => {
          return [{text: result.text, languages: "Google Translate"}];
        }),
        TranslateByYoudao()
      ]);
      promises.then((res) => {
        setResults(res[0].concat(res[1]));
      })
      .catch((errors) => {
        showToast(ToastStyle.Failure, "Translate failed", errors);
      })
      .then(() => {
        setIsLoading(false);
      });
    } else {
      const promises = Promise.all([
        translate(toTranslate, {from: "en", to: "zh-CN"}).then(result => {
          return [{text: result.text, languages: "Google Translate"}];
        }),
        TranslateByYoudao()
      ]);
      promises.then((res) => {
        setResults(res[0].concat(res[1]));
      })
      .catch((errors) => {
        showToast(ToastStyle.Failure, "Translate failed", errors);
      })
      .then(() => {
        setIsLoading(false);
      });
    }
  }, [toTranslate]);

  return (
    <List
      searchBarPlaceholder="Enter text to translate"
      onSearchTextChange={setToTranslate}
      isLoading={isLoading}
      searchText={selectedText}
      throttle
    >
      {results.map((r, index) => (
        <List.Item
          key={index}
          title={r.text}
          accessoryTitle={r.languages}
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

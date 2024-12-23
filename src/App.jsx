import { useEffect, useState } from "react";
import "./App.css";
import TextEditor from "./TextEditor";
import { MessageId } from "./Khoros-variables/Khoros-variables.js";

function App() {
  const [topicId, setTopicId] = useState(null);
  const [notes, setNotes] = useState(null);
  const [count, setCount] = useState(0);

  // Effect for fetching topic ID from URL
  // Run once on mount

  // Effect for fetching notes based on topic ID
  useEffect(
    (MessageId) => {
      const fetchNotes = async () => {
        if (!MessageId) return;

        try {
          const response = await fetch(
            `/restapi/vc/messages/id/${MessageId}/metadata/key/custom.custom-notes`
          );
          const text = await response.text();

          if (response.ok) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(text, "text/xml");
            const valueElement = doc.getElementsByTagName("value")[0];

            if (valueElement) {
              const encodedValue = valueElement.textContent;
              const textarea = document.createElement("textarea");
              textarea.innerHTML = encodedValue;
              const decodedValue = textarea.value;
              const jsonData = decodedValue ? JSON.parse(decodedValue) : {};
              console.log("JSON data by chakri:", jsonData);
              setNotes(jsonData);
            }
          }
        } catch (error) {
          console.error("Error fetching notes:", error);
        }
      };

      fetchNotes();
    },
    [MessageId]
  ); // Run when topicId changes

  // Effect for fetching count based on notes
  useEffect(() => {
    const fetchCount = async () => {
      if (!notes) return;

      try {
        const query = `api/2.0/search?q=SELECT count(*) FROM messages WHERE parent.id ='${notes}'`;
        const url = `/search?q=${encodeURIComponent(query)}`;

        const response = await fetch(url, { method: "GET" });
        console.log("Count response by chakri:", response);
        const data = await response.text();
        // Note: You might want to add the parsing logic here to set the count
        // setCount(parsedCount);
      } catch (error) {
        console.error("Error fetching count:", error);
      }
    };

    fetchCount();
  }, [notes]); // Run when notes changes

  return (
    <>
      <TextEditor notesId={notes} />
    </>
  );
}

export default App;

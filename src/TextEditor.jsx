import Quill from "quill";
import "quill/dist/quill.snow.css";
import { useEffect, useRef, useState } from "react";
// import { Button } from "../components/ui/button";
import "./App.css";

export default function TextEditor({ notesId }) {
  const editorRef = useRef(null);
  const quillInstance = useRef(null);
  const [content, setContent] = useState("");
  const [showEditor, setShowEditor] = useState(false);

  useEffect(() => {
    if (editorRef.current) {
      quillInstance.current = new Quill(editorRef.current, {
        debug: "false",
        modules: {
          toolbar: [
            [{ header: [1, 2, false] }],
            ["bold", "italic", "underline"],
            ["link", "image", "video"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ "code-block": true }],
            ["clean"],
          ],
        },
        placeholder: "Type here....",
        theme: "snow",
      });

      const handleTextChange = async () => {
        const editorContent = quillInstance.current.root.innerHTML;
        setContent(editorContent);
      };

      quillInstance.current.on("text-change", handleTextChange);

      return () => {
        if (quillInstance.current) {
          quillInstance.current.off("text-change", handleTextChange);
          quillInstance.current = null;
        }
      };
    }
  }, [showEditor]);

  const handleAddNote = () => {
    setShowEditor(true);
  };

  const handleCancel = () => {
    setShowEditor(false);
    setContent("");
  };

  const handleSubmit = () => {
    console.log("Note content:", content);
    if (!content) {
      alert("Note text cannot be empty.");
    }

    const msgSubject = LITHIUM.CommunityJsonObject.Page.object.subject;
    console.log("msgSubject by chakri:", msgSubject);
    const boardId = "aj_notes";
    let apiUrl;

    if (notesId == "") {
      console.log("This is a post.");
      apiUrl =
        `/restapi/vc/boards/id/${boardId}/messages/post?` +
        `message.subject=Notes on: ${msgSubject}` +
        `&message.body=${content}`;
    } else {
      console.log("This is a reply.");
      apiUrl =
        `/restapi/vc/messages/id/${notesId}/reply?` + `message.body=${content}`;
    }

    fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/xml",
        Accept: "application/xml",
      },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to add the note.");
        return response.text();
      })
      .then((responseXML) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(responseXML, "application/xml");
        const messageId = xmlDoc.getElementsByTagName("id")[0]?.textContent;

        console.log("New Message ID:", messageId);

        alert("Note added successfully!");
        setShowEditor(false);
        setContent("");
      })
      .catch((error) => {});
  };

  return (
    <div className="relative">
      <div
        id="notes-widget-chakri"
        className="custom-notes-widget-chakri border border-sky-500"
      >
        <h3 className="custom-notes-title-chakri">Notes</h3>
        <p>Notes id: {notesId}</p>
        <button
          id="add-note-button-chakri"
          className="custom-notes-add-chakri"
          onClick={handleAddNote}
        >
          Add a new note
        </button>
      </div>

      {showEditor && (
        <div className="custom-notes-popup-chakri">
          <div className="notes-container-chakri">
            <div className="popup-content-chakri">
              <div className="custom-notes-creation-chakri">
                <p className="custom-notes-author-chakri">
                  User name: <strong>Guest</strong>
                </p>
                <div ref={editorRef} id="editor" />
              </div>
              <div className="custom-create-actions-chakri">
                <button
                  className="custom-note-secondary-chakri"
                  onClick={handleCancel}
                >
                  Cancel
                </button>
                <button
                  className="custom-note-primary-chakri"
                  onClick={handleSubmit}
                >
                  Add a Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

export default function CKEditorComponent({ data, onChange }) {
  return (
    <CKEditor
      editor={ClassicEditor}
      data={data}
      onChange={(event, editor) => {
        const data = editor.getData();
        onChange(data);
      }}
      config={{
        language: "fa",
        direction: "rtl",
        // می‌تونی toolbar و تنظیمات دیگه رو اینجا اضافه کنی
      }}
    />
  );
}
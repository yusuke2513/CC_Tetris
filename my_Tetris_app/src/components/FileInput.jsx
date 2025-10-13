import React, { forwardRef } from "react";

// Hidden file input. Parent can call ref.current.click() to open file picker.
const FileInput = forwardRef(({ accept = "image/*", onFileChange }, ref) => {
    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            onFileChange(e.target.files[0]);
        }
    };

    return <input type="file" accept={accept} onChange={handleChange} ref={ref} style={{ display: "none" }} />;
});

export default FileInput;

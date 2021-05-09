import React from 'react';

/**
 * Useful Docs 
 * Code Mirror Editor   https://uiwjs.github.io/react-codemirror/
 */

import CodeMirror from '@uiw/react-codemirror';
import 'codemirror/keymap/sublime';
import 'codemirror/theme/monokai.css';
import 'codemirror/mode/markdown/markdown';

const WorkspaceEditor = ({
    initText,
    editorRef, 
    onChange,
    height
}) => {

    return (
        <CodeMirror
            value={initText}
            height={height || "60vh"}
            ref={editorRef}
            options={{
                mode: 'text/x-markdown',
                theme: 'default',
                keyMap: 'sublime',
                autofocus: true
            }}
            onChange={(_, change) => {
                onChange(change);
            }}
        />
    )
}

export default WorkspaceEditor;
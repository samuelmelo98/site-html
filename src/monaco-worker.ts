import * as monaco from 'monaco-editor';

import editorWorker
from 'monaco-editor/esm/vs/editor/editor.worker?worker';

import htmlWorker
from 'monaco-editor/esm/vs/language/html/html.worker?worker';

(self as any).MonacoEnvironment = {

  getWorker(
    _: unknown,
    label: string
  ) {

    if (label === 'html') {
      return new htmlWorker();
    }

    return new editorWorker();

  }

};

export { monaco };
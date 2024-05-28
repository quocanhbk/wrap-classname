import * as vscode from "vscode";

export function activate(context: vscode.ExtensionContext) {
  let wrapInClassNames = vscode.commands.registerCommand(
    "tailwindcss-utilities.wrapClassname",
    () => {
      wrapClassName();
    }
  );

  context.subscriptions.push(wrapInClassNames);
}

async function wrapClassName() {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    vscode.window.showErrorMessage("No active editor!");
    return; // No open text editor
  }

  const document = editor.document;
  const classNamePattern = /(className\s*=\s*)({[^}]*}|"[^"]*")/g;

  const config = vscode.workspace.getConfiguration("tailwindcss-utilities");
  const wrapFunction: string | undefined = config.get("classnameFunction");

  if (!wrapFunction) {
    vscode.window.showErrorMessage("No wrap functions defined in config!");
    return;
  }

  const cursorPosition = editor.selection.active;
  const line = cursorPosition.line;
  let text = document.lineAt(line).text;

  let match: RegExpExecArray | null;
  while ((match = classNamePattern.exec(text)) !== null) {
    // Check if cursor is inside the className attribute
    if (
      cursorPosition.character > match.index &&
      cursorPosition.character < match.index + match[0].length
    ) {
      const fullMatchStart = new vscode.Position(line, match.index);
      const fullMatchEnd = new vscode.Position(
        line,
        match.index + match[0].length
      );
      const fullMatchSelection = new vscode.Selection(
        fullMatchStart,
        fullMatchEnd
      );

      let className = match[2];

      // Don't modify if already wrapped in wrap function
      if (className.trim().startsWith(`{${wrapFunction}(`)) {
        return;
      }

      // remove braces if already wrapped
      if (className.trim().startsWith("{") && className.trim().endsWith("}")) {
        className = className.slice(1, -1);
      }

      let newClassName = `className={${wrapFunction}(${className})}`;

      await editor.edit((editBuilder) => {
        editBuilder.replace(fullMatchSelection, newClassName);
      });

      // Move cursor to before the closing parenthesis of the last wrap function
      const newCursorPosition = new vscode.Position(
        cursorPosition.line,
        fullMatchStart.character + newClassName.length - 1
      );
      editor.selection = new vscode.Selection(
        newCursorPosition,
        newCursorPosition
      );

      return;
    }
  }
}

export function deactivate() {}

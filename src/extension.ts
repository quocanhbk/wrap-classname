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

  for (let line = 0; line < document.lineCount; line++) {
    let text = document.lineAt(line).text;

    let match: RegExpExecArray | null;
    while ((match = classNamePattern.exec(text)) !== null) {
      const cursorPosition = editor.selection.active;

      // Check if cursor is inside the className attribute
      if (
        cursorPosition.line === line &&
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

        const className = match[2];

        // Don't modify if already wrapped in wrap functions
        if (className.trim().startsWith(`{${wrapFunction}(`)) {
          return;
        }

        let newClassName = `className={${wrapFunction}(${className}${")"}}`;

        await editor.edit((editBuilder) => {
          editBuilder.replace(fullMatchSelection, newClassName);
        });

        // Move cursor to before the closing parenthesis of the last wrap function
        const newCursorPosition = new vscode.Position(
          cursorPosition.line,
          fullMatchStart.character + newClassName.length - 2
        );
        editor.selection = new vscode.Selection(
          newCursorPosition,
          newCursorPosition
        );

        return;
      }
    }
  }
}

export function deactivate() {}

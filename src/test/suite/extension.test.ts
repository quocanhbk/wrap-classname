import * as assert from "assert";
import * as vscode from "vscode";

suite("wrapClassName", () => {
  vscode.window.showInformationMessage("Start all tests.");

  // select the file to test
  const testFileName = vscode.Uri.file(
    __dirname + "/../../../src/test/suite/testFile.tsx"
  );

  suiteSetup(async () => {
    await vscode.workspace.openTextDocument(testFileName).then((document) => {
      return vscode.window.showTextDocument(document);
    });
  });

  test("should wrap className with wrapFunctions", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      assert.fail("No active editor");
    }

    await editor.edit((editBuilder) => {
      editBuilder.insert(
        new vscode.Position(0, 0),
        `<div className="foo bar"></div>`
      );
    });

    // move the cursur between foo bar
    editor.selection = new vscode.Selection(
      new vscode.Position(0, 16),
      new vscode.Position(0, 16)
    );

    const classnameFunction = "twMerge";

    const config = vscode.workspace.getConfiguration("tailwindcss-utilities");
    await config.update(
      "classnameFunction",
      classnameFunction,
      vscode.ConfigurationTarget.Global
    );

    await vscode.commands.executeCommand("tailwindcss-utilities.wrapClassname");

    const updatedText = editor.document.getText();
    assert.strictEqual(
      updatedText,
      `<div className={${classnameFunction}("foo bar")}></div>`
    );

    // Clean up the document
    await editor.edit((editBuilder) => {
      editBuilder.delete(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, updatedText.length)
        )
      );
    });

    await config.update(
      "wrapFunctions",
      undefined,
      vscode.ConfigurationTarget.Global
    );
  });

  test("should not wrap if already wrapped", async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      assert.fail("No active editor");
    }

    await editor.edit((editBuilder) => {
      editBuilder.insert(
        new vscode.Position(0, 0),
        `<div className={twMerge("foo bar")}></div>`
      );
    });

    // move the cursur between foo bar
    editor.selection = new vscode.Selection(
      new vscode.Position(0, 16),
      new vscode.Position(0, 16)
    );

    const classnameFunction = "twMerge";

    const config = vscode.workspace.getConfiguration("tailwindcss-utilities");

    await config.update(
      "classnameFunction",
      classnameFunction,
      vscode.ConfigurationTarget.Global
    );

    await vscode.commands.executeCommand("tailwindcss-utilities.wrapClassname");

    const updatedText = editor.document.getText();

    assert.strictEqual(
      updatedText,
      `<div className={twMerge("foo bar")}></div>`
    );

    // Clean up the document
    await editor.edit((editBuilder) => {
      editBuilder.delete(
        new vscode.Range(
          new vscode.Position(0, 0),
          new vscode.Position(0, updatedText.length)
        )
      );
    });

    await config.update(
      "wrapFunctions",
      undefined,
      vscode.ConfigurationTarget.Global
    );
  });

  suiteTeardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});

import * as assert from "assert";
import * as vscode from "vscode";

suite("wrapClassName", () => {
  vscode.window.showInformationMessage("Start all tests.");

  const testFileName = vscode.Uri.file(
    __dirname + "/../../../src/test/suite/testFile.tsx"
  );

  suiteSetup(async () => {
    await vscode.workspace.openTextDocument(testFileName).then((document) => {
      return vscode.window.showTextDocument(document);
    });
  });

  const runWrapClassNameTest = async (
    input: string,
    expected: string,
    cursorPosition: vscode.Position
  ) => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      assert.fail("No active editor");
    }

    await editor.edit((editBuilder) => {
      editBuilder.insert(new vscode.Position(0, 0), input);
    });

    editor.selection = new vscode.Selection(cursorPosition, cursorPosition);

    const classnameFunction = "twMerge";

    const config = vscode.workspace.getConfiguration("tailwindcss-utilities");
    await config.update(
      "classnameFunction",
      classnameFunction,
      vscode.ConfigurationTarget.Global
    );

    await vscode.commands.executeCommand("tailwindcss-utilities.wrapClassname");

    const updatedText = editor.document.getText();
    assert.strictEqual(updatedText, expected);

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
      "classnameFunction",
      undefined,
      vscode.ConfigurationTarget.Global
    );
  };

  test('should wrap className with wrapFunctions in case <div className={"foo bar"}></div>', async () => {
    await runWrapClassNameTest(
      `<div className={"foo bar"}></div>`,
      `<div className={twMerge("foo bar")}></div>`,
      new vscode.Position(0, 16)
    );
  });

  test('should wrap className with wrapFunctions in case <div className="foo bar"></div>', async () => {
    await runWrapClassNameTest(
      `<div className="foo bar"></div>`,
      `<div className={twMerge("foo bar")}></div>`,
      new vscode.Position(0, 16)
    );
  });

  test("should wrap className with wrapFunctions in case <div className={'foo bar'}></div>", async () => {
    await runWrapClassNameTest(
      `<div className={'foo bar'}></div>`,
      `<div className={twMerge('foo bar')}></div>`,
      new vscode.Position(0, 17)
    );
  });

  test("should wrap className with wrapFunctions in case <div className={`foo bar`}></div>", async () => {
    await runWrapClassNameTest(
      `<div className={\`foo bar\`}></div>`,
      `<div className={twMerge(\`foo bar\`)}></div>`,
      new vscode.Position(0, 17)
    );
  });

  // test("should not wrap if already wrapped", async () => {
  //   const editor = vscode.window.activeTextEditor;
  //   if (!editor) {
  //     assert.fail("No active editor");
  //   }

  //   await editor.edit((editBuilder) => {
  //     editBuilder.insert(
  //       new vscode.Position(0, 0),
  //       `<div className={twMerge("foo bar")}></div>`
  //     );
  //   });

  //   editor.selection = new vscode.Selection(
  //     new vscode.Position(0, 16),
  //     new vscode.Position(0, 16)
  //   );

  //   const classnameFunction = "twMerge";

  //   const config = vscode.workspace.getConfiguration("tailwindcss-utilities");
  //   await config.update(
  //     "classnameFunction",
  //     classnameFunction,
  //     vscode.ConfigurationTarget.Global
  //   );

  //   await vscode.commands.executeCommand("tailwindcss-utilities.wrapClassname");

  //   const updatedText = editor.document.getText();
  //   assert.strictEqual(
  //     updatedText,
  //     `<div className={twMerge("foo bar")}></div>`
  //   );

  //   // Clean up the document
  //   await editor.edit((editBuilder) => {
  //     editBuilder.delete(
  //       new vscode.Range(
  //         new vscode.Position(0, 0),
  //         new vscode.Position(0, updatedText.length)
  //       )
  //     );
  //   });

  //   await config.update(
  //     "classnameFunction",
  //     undefined,
  //     vscode.ConfigurationTarget.Global
  //   );
  // });

  suiteTeardown(async () => {
    await vscode.commands.executeCommand("workbench.action.closeActiveEditor");
  });
});

import * as vscode from 'vscode';
import { GetRecord } from './record';

export function activate(context: vscode.ExtensionContext) {
	const fieldDecorationType = vscode.window.createTextEditorDecorationType({
		borderStyle: 'solid',
		borderWidth: "0 0 1px 0",
		light: {
			// this color will be used in light color themes
			backgroundColor: 'lightGrey',
			borderColor: 'darkRed',
		},
		dark: {
			// this color will be used in dark color themes
			backgroundColor: 'darkGrey',
			borderColor: 'lightRed'
		}
	});

	// Loop backwards from the current position looking for the next 5 record and return its sec code.
	function GetSecCode(document: vscode.TextDocument, cursor: vscode.Position): string {
		let typeCode = "6";
		let line = cursor.line;
		while (line > 0 && typeCode === "6") {
			let lineText = document.lineAt(line).text.substring(0, 94);
			let typeCode = lineText.substring(0, 1);
			if (typeCode === "5"){
				const secCode = lineText.substring(50, 53);
				return secCode;
			}
			line -= 1;
		}
		return "";
	}

    vscode.languages.registerHoverProvider('nacha-ach', {
        provideHover(document, cursor, token) {
			const activeEditor = vscode.window.activeTextEditor;
			const text = document.lineAt(cursor.line).text.substring(0, 94);
			const record = GetRecord(text, GetSecCode(document, cursor));
			const selectedField = record.getField(cursor.character+1);
			if (selectedField === null) { return; }

			activeEditor?.setDecorations(fieldDecorationType, [new vscode.Range(new vscode.Position(cursor.line, selectedField.StartPosition), new vscode.Position(cursor.line, selectedField.EndPosition))]);
			const message = `#### ${selectedField.Name}
---
${selectedField.Description}`;
			return new vscode.Hover(new vscode.MarkdownString(message));
        }
    });
}